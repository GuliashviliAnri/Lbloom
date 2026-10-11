"use client";
import {useRef,useState,type PointerEvent,type KeyboardEvent} from 'react';
import {GripVertical} from 'lucide-react';
import {moveCatalogItem,sameCatalogOrder} from '@/lib/catalog-order';
export default function AdminReorderHandle<T extends {id?:unknown}>({id,title,rows,onChange,onSave,disabled=false}:{id:string;title:string;rows:T[];onChange:(rows:T[])=>void;onSave:(next:T[],before:T[])=>void;disabled?:boolean}){
 const [active,setActive]=useState(false);
 const drag=useRef<{before:T[];current:T[]}|null>(null);
 function start(event:PointerEvent<HTMLButtonElement>){if(disabled||event.button!==0)return;event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);drag.current={before:rows,current:rows};setActive(true);}
 function move(event:PointerEvent<HTMLButtonElement>){const state=drag.current;if(!state)return;event.preventDefault();const root=event.currentTarget.closest('.admin-list');if(!root)return;
  if(event.clientY<70)window.scrollBy(0,-18);else if(event.clientY>window.innerHeight-70)window.scrollBy(0,18);
  const nodes=Array.from(root.querySelectorAll<HTMLElement>('[data-order-id]'));const target=nodes.find(row=>{const rect=row.getBoundingClientRect();return event.clientY<rect.top+rect.height/2;});
  const next=moveCatalogItem(state.current,id,target?.dataset.orderId??null);if(!sameCatalogOrder(next,state.current)){state.current=next;onChange(next);}
 }
 function finish(event:PointerEvent<HTMLButtonElement>,cancel=false){const state=drag.current;if(!state)return;drag.current=null;setActive(false);if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  if(cancel)onChange(state.before);else if(!sameCatalogOrder(state.current,state.before))onSave(state.current,state.before);
 }
 function keyboard(event:KeyboardEvent<HTMLButtonElement>){if(disabled)return;if(!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();const index=rows.findIndex(row=>String(row.id)===id);const nextIndex=event.key==='Home'?0:event.key==='End'?rows.length-1:index+(event.key==='ArrowUp'?-1:1);if(nextIndex<0||nextIndex>=rows.length||nextIndex===index)return;
  const next=[...rows];const [item]=next.splice(index,1);next.splice(nextIndex,0,item);onChange(next);onSave(next,rows);
 }
 return <button type="button" className={'admin-reorder-handle'+(active?' is-dragging':'')} disabled={disabled} aria-label={title+' — გადაადგილება'} title="გადაათრიეთ ან გამოიყენეთ ↑ / ↓" aria-pressed={active} onPointerDown={start} onPointerMove={move} onPointerUp={event=>finish(event)} onPointerCancel={event=>finish(event,true)} onKeyDown={keyboard}><GripVertical size={21}/></button>;
}
