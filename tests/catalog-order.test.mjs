import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {runInNewContext} from 'node:vm';import ts from 'typescript';
const exports={};runInNewContext(ts.transpileModule(readFileSync(new URL('../lib/catalog-order.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports});
const rows=[{id:'a'},{id:'b'},{id:'c'},{id:'d'}];const ids=result=>Array.from(result,row=>row.id);
test('dragging moves an item to the first, middle or last position without losing records',()=>{assert.deepEqual(ids(exports.moveCatalogItem(rows,'d','a')),['d','a','b','c']);assert.deepEqual(ids(exports.moveCatalogItem(rows,'a','d')),['b','c','a','d']);assert.deepEqual(ids(exports.moveCatalogItem(rows,'a',null)),['b','c','d','a']);assert.deepEqual(ids(rows),['a','b','c','d']);});
test('same position, missing item and unknown target leave the order unchanged',()=>{assert.ok(exports.sameCatalogOrder(rows,exports.moveCatalogItem(rows,'a','a')));assert.ok(exports.sameCatalogOrder(rows,exports.moveCatalogItem(rows,'missing','a')));assert.ok(exports.sameCatalogOrder(rows,exports.moveCatalogItem(rows,'a','missing')));assert.equal(exports.sameCatalogOrder(rows,exports.moveCatalogItem(rows,'a',null)),false);});

test('floating drag follows the pointer, commits on release, and cancels without writing',async()=>{
 const {createRequire}=await import('node:module');const require=createRequire(import.meta.url);
 const code=ts.transpileModule(readFileSync(new URL('../components/admin-reorder-handle.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 function fixture(){
  const output={},changes=[],saves=[],ghosts=[],frames=new Map();let frameId=0;
  function node(row,i){const style={removeProperty:key=>{delete style[key];}};return {dataset:{orderId:row.id},style,classList:{add:()=>{},remove:()=>{}},getBoundingClientRect:()=>({top:i*50,height:50,left:20,width:300}),cloneNode:()=>({style:{},classList:{add:()=>{}},setAttribute:()=>{},removeAttribute:()=>{},remove(){ghosts.splice(ghosts.indexOf(this),1);}})};}
  const elements=rows.map(node);const root={dataset:{},querySelectorAll:()=>elements};const target={closest:selector=>selector==='.admin-list'?root:elements[2],focus:()=>{},setPointerCapture:()=>{},hasPointerCapture:()=>true,releasePointerCapture:()=>{}};
  const window={scrollY:0,innerHeight:800,scrollBy:()=>{},matchMedia:()=>({matches:false}),requestAnimationFrame:fn=>{frames.set(++frameId,fn);return frameId;},cancelAnimationFrame:id=>frames.delete(id)};
  runInNewContext(code,{exports:output,window,document:{body:{appendChild:ghost=>ghosts.push(ghost)}},require:name=>name==='react'?{useRef:value=>({current:value}),useState:value=>[value,()=>{}],useEffect:()=>{}}:name==='@/lib/catalog-order'?exports:require(name)});
  const props=output.default({id:'c',title:'Third',rows,onChange:next=>changes.push(ids(next)),onSave:(next,before)=>saves.push([ids(next),ids(before)])}).props;
  const event=y=>({button:0,pointerId:1,clientX:70,clientY:y,currentTarget:target,preventDefault:()=>{}});
  function frame(){const [key,fn]=frames.entries().next().value;frames.delete(key);fn();}
  return {props,event,frame,ghosts,changes,saves};
 }
 let f=fixture();f.props.onPointerDown(f.event(125));assert.equal(f.ghosts.length,1);f.props.onPointerMove(f.event(10));f.frame();assert.ok(f.ghosts[0].style.transform.includes('-115px'));assert.equal(f.changes.length,0);assert.equal(f.saves.length,0);f.props.onPointerUp(f.event(10));assert.deepEqual(f.saves[0],[['c','a','b','d'],['a','b','c','d']]);assert.equal(f.ghosts.length,0);
 f=fixture();f.props.onPointerDown(f.event(125));f.props.onPointerMove(f.event(10));f.frame();f.props.onPointerCancel();assert.equal(f.changes.length,0);assert.equal(f.saves.length,0);assert.equal(f.ghosts.length,0);
 f=fixture();f.props.onKeyDown({...f.event(125),key:'ArrowUp'});assert.deepEqual(f.saves[0][0],['a','c','b','d']);
});
