"use client";
import {useEffect,useRef,useState,type PointerEvent,type KeyboardEvent} from 'react';
import {GripVertical} from 'lucide-react';
import {moveCatalogItem,sameCatalogOrder} from '@/lib/catalog-order';
type Slot={id:string;node:HTMLElement;top:number;height:number};
type Drag<T>={before:T[];current:T[];slots:Slot[];lookup:Map<string,Slot>;lastCenter:number|null;card:HTMLElement;ghost:HTMLElement;root:HTMLElement;handle:HTMLButtonElement;pointerId:number;x:number;y:number;startX:number;grabY:number;rect:DOMRect;targetTop:number;frame:number;reduced:boolean};
export default function AdminReorderHandle<T extends {id?:unknown}>({id,title,rows,onChange,onSave,disabled=false}:{id:string;title:string;rows:T[];onChange:(rows:T[])=>void;onSave:(next:T[],before:T[])=>void;disabled?:boolean}){
 const [active,setActive]=useState(false);
 const drag=useRef<Drag<T>|null>(null);const cleanup=useRef<(()=>void)|null>(null);
 useEffect(()=>()=>cleanup.current?.(),[]);
 function paint(state:Drag<T>){
  const dx=Math.max(-24,Math.min(24,state.x-state.startX));const dy=state.y-state.grabY-state.rect.top;
  state.ghost.style.transform=`translate3d(${dx}px,${dy}px,0) scale(${state.reduced?1:1.015})`;
  const own=state.lookup.get(id)!;const center=state.y+window.scrollY-state.grabY+own.height/2;
  if(state.lastCenter===center)return;state.lastCenter=center;
  const others=state.slots.filter(slot=>slot.id!==id);const before=others.find(slot=>center<slot.top+slot.height/2)?.id??null;
  const next=moveCatalogItem(state.before,id,before);
  if(!sameCatalogOrder(next,state.current)){
   state.current=next;let top=state.slots[0].top;
   for(const item of next){const slot=state.lookup.get(String(item.id))!;slot.node.style.transform=`translate3d(0,${top-slot.top}px,0)`;if(slot.id===id)state.targetTop=top;top+=slot.height;}
  }
 }
 function tick(state:Drag<T>){if(drag.current!==state)return;
  const edge=64;const distance=state.y<edge?state.y-edge:state.y>window.innerHeight-edge?state.y-(window.innerHeight-edge):0;
  if(distance)window.scrollBy(0,Math.sign(distance)*Math.min(14,Math.abs(distance)/4));
  paint(state);state.frame=window.requestAnimationFrame(()=>tick(state));
 }
 function start(event:PointerEvent<HTMLButtonElement>){
  if(disabled||event.button!==0)return;
  const root=event.currentTarget.closest<HTMLElement>('.admin-list');const card=event.currentTarget.closest<HTMLElement>('[data-order-id]');if(!root||!card||root.dataset.reorderActive)return;
  const slots=Array.from(root.querySelectorAll<HTMLElement>('[data-order-id]')).map(node=>{const box=node.getBoundingClientRect();return {id:node.dataset.orderId!,node,top:box.top+window.scrollY,height:box.height};});
  if(slots.length!==rows.length)return;
  event.preventDefault();event.currentTarget.focus({preventScroll:true});event.currentTarget.setPointerCapture(event.pointerId);
  const rect=card.getBoundingClientRect();const ghost=card.cloneNode(true) as HTMLElement;
  ghost.removeAttribute('data-order-id');ghost.setAttribute('aria-hidden','true');ghost.inert=true;ghost.classList.add('admin','admin-drag-ghost');
  ghost.style.width=rect.width+'px';ghost.style.height=rect.height+'px';ghost.style.left=rect.left+'px';ghost.style.top=rect.top+'px';document.body.appendChild(ghost);
  root.dataset.reorderActive='true';document.documentElement?.classList.add('admin-sorting');for(const slot of slots)slot.node.classList.add('admin-reorder-slot');card.classList.add('admin-drag-placeholder');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state:Drag<T>={before:rows,current:rows,slots,lookup:new Map(slots.map(slot=>[slot.id,slot])),lastCenter:null,card,ghost,root,handle:event.currentTarget,pointerId:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,grabY:event.clientY-rect.top,rect,targetTop:rect.top+window.scrollY,frame:0,reduced};
  cleanup.current=()=>{window.cancelAnimationFrame(state.frame);ghost.remove();delete root.dataset.reorderActive;document.documentElement?.classList.remove('admin-sorting');for(const slot of slots){slot.node.classList.remove('admin-reorder-slot','admin-drag-placeholder');slot.node.style.removeProperty('transform');slot.node.style.removeProperty('transition');}cleanup.current=null;};
  drag.current=state;setActive(true);paint(state);state.frame=window.requestAnimationFrame(()=>tick(state));
 }
 function move(event:PointerEvent<HTMLButtonElement>){const state=drag.current;if(!state)return;event.preventDefault();state.x=event.clientX;state.y=event.clientY;}
 function finish(cancel=false,event?:PointerEvent<HTMLButtonElement>){
  const state=drag.current;if(!state)return;if(event&&!cancel){state.x=event.clientX;state.y=event.clientY;paint(state);}
  drag.current=null;window.cancelAnimationFrame(state.frame);setActive(false);
  if(state.handle.hasPointerCapture(state.pointerId))state.handle.releasePointerCapture(state.pointerId);
  const positions=state.slots.map(slot=>({slot,top:slot.node.getBoundingClientRect().top}));
  for(const slot of state.slots){slot.node.style.transition='none';slot.node.style.removeProperty('transform');}
  if(!cancel&&!sameCatalogOrder(state.current,state.before)){onChange(state.current);onSave(state.current,state.before);}
  window.requestAnimationFrame(()=>{
   for(const {slot,top} of positions){const delta=top-slot.node.getBoundingClientRect().top;slot.node.style.removeProperty('transition');if(!state.reduced&&Math.abs(delta)>1)slot.node.animate?.([{transform:`translateY(${delta}px)`},{transform:'translateY(0)'}],{duration:180,easing:'cubic-bezier(.2,.75,.25,1)'});}
  });
  const target=(cancel?state.lookup.get(id)!.top:state.targetTop)-window.scrollY-state.rect.top;
  if(state.ghost.animate&&!state.reduced){const animation=state.ghost.animate([{transform:state.ghost.style.transform,opacity:1},{transform:`translate3d(0,${target}px,0) scale(1)`,opacity:1}],{duration:150,easing:'cubic-bezier(.2,.75,.25,1)',fill:'forwards'});animation.finished.then(()=>cleanup.current?.(),()=>cleanup.current?.());}
  else cleanup.current?.();
 }
 function keyboard(event:KeyboardEvent<HTMLButtonElement>){
  if(event.key==='Escape'&&drag.current){event.preventDefault();finish(true);return;}
  if(disabled||event.currentTarget.closest<HTMLElement>('.admin-list')?.dataset.reorderActive)return;
  if(!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();const index=rows.findIndex(row=>String(row.id)===id);const nextIndex=event.key==='Home'?0:event.key==='End'?rows.length-1:index+(event.key==='ArrowUp'?-1:1);if(nextIndex<0||nextIndex>=rows.length||nextIndex===index)return;
  const next=[...rows];const [item]=next.splice(index,1);next.splice(nextIndex,0,item);onChange(next);onSave(next,rows);
 }
 return <button type="button" className={'admin-reorder-handle'+(active?' is-dragging':'')} disabled={disabled} aria-label={title+' — გადაადგილება'} title="გადაათრიეთ ან გამოიყენეთ ↑ / ↓" aria-pressed={active} onPointerDown={start} onPointerMove={move} onPointerUp={event=>finish(false,event)} onPointerCancel={()=>finish(true)} onKeyDown={keyboard}><GripVertical size={21}/></button>;
}
