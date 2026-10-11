import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {runInNewContext} from 'node:vm';import ts from 'typescript';
const exports={};runInNewContext(ts.transpileModule(readFileSync(new URL('../lib/catalog-order.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports});
const rows=[{id:'a'},{id:'b'},{id:'c'},{id:'d'}];const ids=result=>Array.from(result,row=>row.id);
test('dragging moves an item to the first, middle or last position without losing records',()=>{assert.deepEqual(ids(exports.moveCatalogItem(rows,'d','a')),['d','a','b','c']);assert.deepEqual(ids(exports.moveCatalogItem(rows,'a','d')),['b','c','a','d']);assert.deepEqual(ids(exports.moveCatalogItem(rows,'a',null)),['b','c','d','a']);assert.deepEqual(ids(rows),['a','b','c','d']);});
test('same position, missing item and unknown target leave the order unchanged',()=>{assert.ok(exports.sameCatalogOrder(rows,exports.moveCatalogItem(rows,'a','a')));assert.ok(exports.sameCatalogOrder(rows,exports.moveCatalogItem(rows,'missing','a')));assert.ok(exports.sameCatalogOrder(rows,exports.moveCatalogItem(rows,'a','missing')));assert.equal(exports.sameCatalogOrder(rows,exports.moveCatalogItem(rows,'a',null)),false);});

test('drag commits only on release, cancellation restores order, and keyboard movement saves',async()=>{
 const {createRequire}=await import('node:module');const require=createRequire(import.meta.url);const changes=[],saves=[];
 function handle(disabled=false){const output={};runInNewContext(ts.transpileModule(readFileSync(new URL('../components/admin-reorder-handle.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:output,window:{innerHeight:800,scrollBy:()=>{}},require:name=>name==='react'?{useRef:value=>({current:value}),useState:value=>[value,()=>{}]}:name==='@/lib/catalog-order'?exports:require(name)});return output.default({id:'c',title:'Third',rows,onChange:next=>changes.push(ids(next)),onSave:(next,before)=>saves.push([ids(next),ids(before)]),disabled}).props;}
 const root={querySelectorAll:()=>rows.map((row,i)=>({dataset:{orderId:row.id},getBoundingClientRect:()=>({top:i*50,height:50})}))};
 const target={setPointerCapture:()=>{},hasPointerCapture:()=>true,releasePointerCapture:()=>{},closest:()=>root};const event={button:0,pointerId:1,clientY:1,currentTarget:target,preventDefault:()=>{}};
 let props=handle();props.onPointerDown(event);props.onPointerMove(event);assert.equal(saves.length,0);props.onPointerUp(event);assert.deepEqual(saves[0],[['c','a','b','d'],['a','b','c','d']]);
 props=handle();props.onPointerDown(event);props.onPointerMove(event);props.onPointerCancel(event);assert.equal(saves.length,1);assert.deepEqual(changes.at(-1),['a','b','c','d']);
 props=handle();props.onKeyDown({key:'ArrowUp',preventDefault:()=>{}});assert.deepEqual(saves.at(-1)[0],['a','c','b','d']);
 const count=saves.length;handle(true).onKeyDown({key:'ArrowUp',preventDefault:()=>{}});assert.equal(saves.length,count);
});
