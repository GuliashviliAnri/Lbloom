import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
function nodes(tree){return [tree,...(Array.isArray(tree)?tree:tree?.props?.children?[tree.props.children]:[]).flatMap(v=>Array.isArray(v)?v.flatMap(nodes):v&&typeof v==='object'?nodes(v):[])];}
test('home video arrows reveal the fifth video, retain latest badge, and do not lose videos on later pages',()=>{
 const state=[null,0];let hook=0;
 const react={useState:initial=>{const i=hook++;return [state[i]??initial,v=>{state[i]=v}]},useRef:()=>({current:null}),useId:()=> 'videos',useEffect:()=>{}};
 const exports={};
 const code=ts.transpileModule(readFileSync(new URL('../components/site.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 runInNewContext(code,{exports,require:n=>n==='react'?{...require(n),...react}:n==='react/jsx-runtime'?require(n):n==='./use-page-swipe'?{default:()=>({})}:n==='./use-card-page-size'?{default:()=>4}:n==='@/lib/video-order'?{latestVideo:v=>v[1]}:{default:()=>null}});
 const videos=Array.from({length:9},(_,i)=>({id:String(i+1),title:String(i+1)}));
 const render=()=>{hook=0;return exports.Videos({videos,featured:true,advertisement:null})};
 const cards=t=>nodes(t).filter(n=>n?.type===exports.VideoCard);
 const arrows=t=>nodes(t).filter(n=>n?.props?.className==='product-page-arrow');
 let tree=render();assert.deepEqual(cards(tree).map(n=>n.props.video.id),['1','2','3','4']);assert.equal(cards(tree)[0].props.isNew,false);assert.equal(cards(tree)[1].props.isNew,true);assert.equal(arrows(tree)[0].props.disabled,true);
 arrows(tree)[1].props.onClick();tree=render();assert.deepEqual(cards(tree).map(n=>n.props.video.id),['5','6','7','8']);assert.ok(cards(tree).every(n=>!n.props.isNew));
 arrows(tree)[1].props.onClick();tree=render();assert.deepEqual(cards(tree).map(n=>n.props.video.id),['9']);assert.equal(arrows(tree)[1].props.disabled,true);
 arrows(tree)[0].props.onClick();assert.deepEqual(cards(render()).map(n=>n.props.video.id),['5','6','7','8']);
 hook=0;const listing=exports.Videos({videos,featured:false,advertisement:null});assert.equal(cards(listing).length,9);assert.equal(arrows(listing).length,0);
});
