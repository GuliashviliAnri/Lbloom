import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {runInNewContext} from 'node:vm';import {createRequire} from 'node:module';import ts from 'typescript';
const require=createRequire(import.meta.url),output={};
const transpile=path=>ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
runInNewContext(transpile('../lib/gallery-order.ts'),{exports:output});
test('photo order supports first, middle and last moves, preserving duplicate URLs',()=>{const photos=['a','b','a','d'];assert.deepEqual(Array.from(output.moveGalleryPhoto(photos,3,0)),['d','a','b','a']);assert.deepEqual(Array.from(output.moveGalleryPhoto(photos,0,3)),['b','a','d','a']);assert.deepEqual(Array.from(output.moveGalleryPhoto(photos,3,1)),['a','d','b','a']);assert.deepEqual(photos,['a','b','a','d']);assert.deepEqual(Array.from(output.moveGalleryPhoto(photos,-1,2)),photos);});
test('wrapped gallery finds the correct slot in both dimensions',()=>{const slots=[{x:70,y:80},{x:222,y:80},{x:70,y:270},{x:222,y:270}];assert.equal(output.nearestGallerySlot(slots,200,250),3);assert.equal(output.nearestGallerySlot(slots,40,240),2);assert.equal(output.nearestGallerySlot([],0,0),-1);});
test('touch drag follows the pointer and only updates the draft on release; cancellation leaves order unchanged',()=>{
 function fixture(){const exports={},changes=[],ghosts=[],frames=new Map();let frame=0;const photos=['a','b','c','d'];
  const nodes=photos.map((_,index)=>{const style={removeProperty:key=>delete style[key]};return{style,classList:{add(){},remove(){}},getBoundingClientRect:()=>({left:index%2*152,top:Math.floor(index/2)*190,width:140,height:171}),cloneNode:()=>({style:{},offsetWidth:140,offsetHeight:171,setAttribute(){},removeAttribute(){},remove(){ghosts.splice(ghosts.indexOf(this),1);}})};});
  const handle={setPointerCapture(){},hasPointerCapture:()=>true,releasePointerCapture(){},focus(){}};
  const window={scrollY:0,innerHeight:800,scrollBy(){}};
  const raf=fn=>{frames.set(++frame,fn);return frame;},cancel=id=>frames.delete(id);
  runInNewContext(transpile('../components/admin-gallery.tsx'),{exports,window,requestAnimationFrame:raf,cancelAnimationFrame:cancel,document:{body:{appendChild:ghost=>ghosts.push(ghost)},documentElement:{classList:{add(){},remove(){}}}},require:name=>name==='react'?{useRef:value=>({current:value}),useState:value=>[value,()=>{}],useEffect(){}}:name==='@/lib/gallery-order'?output:require(name)});
  const view=exports.default({photos,onChange:next=>changes.push(Array.from(next))});const grid=view.props.children[1];grid.props.ref.current={querySelectorAll:selector=>selector==='[data-gallery-photo]'?nodes:[handle,handle,handle,handle]};
  const grip=index=>grid.props.children[index].props.children[2].props;
  const event=(x,y)=>({pointerType:'touch',button:0,pointerId:1,clientX:x,clientY:y,currentTarget:handle,preventDefault(){}});
  const tick=()=>{const [id,fn]=frames.entries().next().value;frames.delete(id);fn();};
  return{grip,event,tick,changes,ghosts,nodes};
 }
 let f=fixture();f.grip(0).onPointerDown(f.event(70,148));assert.equal(f.ghosts.length,1);f.grip(0).onPointerMove(f.event(222,338));f.tick();assert.ok(f.ghosts[0].style.transform.includes('152px,190px'));assert.equal(f.changes.length,0);f.grip(0).onPointerUp(f.event(222,338));assert.deepEqual(f.changes,[['b','c','d','a']]);assert.equal(f.ghosts.length,0);
 f=fixture();f.grip(0).onPointerDown(f.event(70,148));f.grip(0).onPointerMove(f.event(222,338));f.tick();f.grip(0).onPointerCancel();assert.equal(f.changes.length,0);assert.equal(f.ghosts.length,0);
 f=fixture();f.grip(2).onKeyDown({...f.event(70,338),key:'Home'});assert.deepEqual(f.changes,[['c','a','b','d']]);
});
