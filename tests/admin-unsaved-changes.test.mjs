import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const code=ts.transpileModule(readFileSync(new URL('../components/admin-unsaved-changes.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function fixture(){
 const output={},state=[],refs=[],listeners=new Map(),cleanup=[];let index=0,refIndex=0;
 class Element{constructor(anchor){this.anchor=anchor;}closest(){return this.anchor;}}
 const location={href:'https://example.test/admin',origin:'https://example.test',pathname:'/admin',search:'',assign:url=>{location.assigned=url;}};
 const react={useState:initial=>{const i=index++;if(!(i in state))state[i]=initial;return[state[i],value=>{state[i]=typeof value==='function'?value(state[i]):value;}];},useRef:value=>{const i=refIndex++;return refs[i]??(refs[i]={current:value});},useCallback:fn=>fn,useEffect:fn=>{const stop=fn();if(stop)cleanup.push(stop);}};
 const events={addEventListener:(type,fn)=>listeners.set(type,fn),removeEventListener:(type,fn)=>{if(listeners.get(type)===fn)listeners.delete(type);}};
 runInNewContext(code,{exports:output,require:name=>name==='react'?react:require(name),window:{...events,location},document:events,location,URL,Element});
 return{output,listeners,location,render(dirty,working=false){cleanup.splice(0).forEach(fn=>fn());index=refIndex=0;return output.useAdminUnsavedChanges(dirty,working);},click(anchor,extra={}){let prevented=false;listeners.get('click')?.({button:0,target:new Element(anchor),preventDefault(){prevented=true;},stopPropagation(){},...extra});return prevented;}};
}
test('baseline compares editable values and ignores metadata/key order',()=>{
 const f=fixture(),fingerprint=f.output.draftFingerprint,fields=['title','image_url'];
 assert.equal(fingerprint({id:1,title:'A',image_url:''},fields),fingerprint({image_url:'',title:'A',id:2},fields));
 assert.notEqual(fingerprint({title:'B'},fields),fingerprint({title:'A'},fields));
 assert.equal(fingerprint({title:'A'},fields),fingerprint({title:'A',image_url:null},fields));
});
test('dirty drafts warn on unload, cancel preserves edits, discard runs the requested action',()=>{
 const f=fixture();let left=0,prevented=0;let guard=f.render(true);
 f.listeners.get('beforeunload')({preventDefault(){prevented++;}});assert.equal(prevented,1);
 guard.requestLeave(()=>left++);assert.equal(left,0);
 guard=f.render(true);guard.warning.props.onCancel();assert.equal(left,0);
 guard=f.render(true);guard.requestLeave(()=>left++);guard=f.render(true);
 guard.warning.props.children[2].props.children[1].props.onClick();assert.equal(left,1);
 f.render(false);assert.equal(f.listeners.has('beforeunload'),false);
});
test('same-tab links are guarded; downloads, modifier clicks and new tabs are unaffected',()=>{
 const f=fixture();f.render(true);
 const anchor={href:'https://example.test/',target:'',hasAttribute:()=>false};
 assert.equal(f.click(anchor,{ctrlKey:true}),false);
 assert.equal(f.click({...anchor,target:'_blank'}),false);
 assert.equal(f.click({...anchor,hasAttribute:()=>true}),false);
 assert.equal(f.click(anchor),true);assert.equal(f.location.assigned,undefined);
 const guard=f.render(true);guard.warning.props.children[2].props.children[1].props.onClick();
 assert.equal(f.location.assigned,'https://example.test/');
 let warned=false;f.listeners.get('beforeunload')({preventDefault(){warned=true;}});assert.equal(warned,false);
});
test('clean drafts leave immediately, and uploads/saves prevent internal navigation',()=>{
 const f=fixture();let left=0;f.render(false).requestLeave(()=>left++);assert.equal(left,1);
 f.render(true,true).requestLeave(()=>left++);assert.equal(left,1);
});
