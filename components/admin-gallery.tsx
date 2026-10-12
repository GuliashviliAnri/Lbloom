"use client";
import {useEffect,useRef,useState} from 'react';
import {GripHorizontal,X} from 'lucide-react';
import {moveGalleryPhoto,nearestGallerySlot} from '@/lib/gallery-order';
type Slot={x:number;y:number;left:number;top:number};
type Drag={from:number;to:number;photos:string[];nodes:HTMLElement[];slots:Slot[];ghost:HTMLElement;offsetX:number;offsetY:number;x:number;y:number;frame:number;pointer:number;handle:HTMLButtonElement};
export default function AdminGallery({photos,onChange,disabled=false}:{photos:string[];onChange:(photos:string[])=>void;disabled?:boolean}){
 const root=useRef<HTMLDivElement>(null),drag=useRef<Drag|null>(null);
 const [announcement,setAnnouncement]=useState('');
 function cleanup(){const current=drag.current;if(!current)return;drag.current=null;cancelAnimationFrame(current.frame);current.ghost.remove();current.nodes.forEach(node=>{node.style.removeProperty('transform');node.classList.remove('admin-gallery-placeholder');});if(current.handle.hasPointerCapture(current.pointer))current.handle.releasePointerCapture(current.pointer);document.documentElement.classList.remove('admin-sorting');}
 useEffect(()=>()=>cleanup(),[]);
 function animate(){
  const current=drag.current;if(!current)return;
  const edge=64;const speed=current.y<edge?-Math.ceil((edge-current.y)/edge*12):current.y>window.innerHeight-edge?Math.ceil((current.y-window.innerHeight+edge)/edge*12):0;
  if(speed)window.scrollBy(0,Math.max(-14,Math.min(14,speed)));
  const left=current.x-current.offsetX,top=current.y-current.offsetY;
  current.ghost.style.transform=`translate3d(${left}px,${top}px,0) scale(1.025)`;
  const index=nearestGallerySlot(current.slots,left+current.ghost.offsetWidth/2,top+current.ghost.offsetHeight/2+window.scrollY);
  current.to=index;
  const order=moveGalleryPhoto(current.nodes.map((_,i)=>i),current.from,index);
  order.forEach((original,target)=>{if(original===current.from)return;const a=current.slots[original],b=current.slots[target];current.nodes[original].style.transform=`translate3d(${b.left-a.left}px,${b.top-a.top}px,0)`;});
  current.frame=requestAnimationFrame(animate);
 }
 function start(event:React.PointerEvent<HTMLButtonElement>,from:number){
  if(disabled||photos.length<2||event.button!==0||drag.current)return;
  event.preventDefault();const nodes=Array.from(root.current!.querySelectorAll<HTMLElement>('[data-gallery-photo]'));
  const slots=nodes.map(node=>{const r=node.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+window.scrollY+r.height/2,left:r.left,top:r.top+window.scrollY};});
  const rect=nodes[from].getBoundingClientRect(),ghost=nodes[from].cloneNode(true) as HTMLElement;
  ghost.className='admin admin-gallery-ghost';ghost.setAttribute('aria-hidden','true');ghost.setAttribute('inert','');ghost.removeAttribute('data-gallery-photo');
  Object.assign(ghost.style,{width:rect.width+'px',height:rect.height+'px',transform:`translate3d(${rect.left}px,${rect.top}px,0)`});document.body.appendChild(ghost);
  nodes[from].classList.add('admin-gallery-placeholder');document.documentElement.classList.add('admin-sorting');
  event.currentTarget.setPointerCapture(event.pointerId);
  drag.current={from,to:from,photos:[...photos],nodes,slots,ghost,offsetX:event.clientX-rect.left,offsetY:event.clientY-rect.top,x:event.clientX,y:event.clientY,frame:0,pointer:event.pointerId,handle:event.currentTarget};
  setAnnouncement(`ფოტო ${from+1} გადაადგილდება.`);drag.current.frame=requestAnimationFrame(animate);
 }
 function finish(event:React.PointerEvent<HTMLButtonElement>){
  const current=drag.current;if(!current||event.pointerId!==current.pointer)return;
  // Resolve the final position even when pointerup arrives before the next animation frame.
  const to=nearestGallerySlot(current.slots,event.clientX-current.offsetX+current.ghost.offsetWidth/2,event.clientY-current.offsetY+current.ghost.offsetHeight/2+window.scrollY);
  const next=moveGalleryPhoto(current.photos,current.from,to);const from=current.from;cleanup();
  if(from!==to)onChange(next);setAnnouncement(`ფოტო ${from+1} ახლა ${to+1} ადგილზეა. რიგის შესანახად დააჭირეთ ცვლილებების შენახვას.`);
 }
 function keyboard(event:React.KeyboardEvent<HTMLButtonElement>,index:number){
  if(event.key==='Escape'&&drag.current){event.preventDefault();cleanup();setAnnouncement('გადაადგილება გაუქმდა.');return;}
  if(disabled||drag.current)return;
  const to=event.key==='Home'?0:event.key==='End'?photos.length-1:['ArrowLeft','ArrowUp'].includes(event.key)?Math.max(0,index-1):['ArrowRight','ArrowDown'].includes(event.key)?Math.min(photos.length-1,index+1):index;
  if(to===index)return;event.preventDefault();onChange(moveGalleryPhoto(photos,index,to));setAnnouncement(`ფოტო ${index+1} ახლა ${to+1} ადგილზეა.`);
  requestAnimationFrame(()=>root.current?.querySelectorAll<HTMLButtonElement>('.admin-gallery-grip')[to]?.focus());
 }
 return <>
  {photos.length>1&&<p className="admin-field-hint">ფოტოების რიგის შესაცვლელად სახელური სასურველ ადგილზე გადაათრიეთ. შემდეგ შეინახეთ ცვლილებები.</p>}
  <div className="admin-gallery admin-sortable-gallery" ref={root}>
   {photos.map((url,index)=><div className="admin-photo-preview admin-gallery-photo" data-gallery-photo key={url+index}>
    <img className="upload-preview" src={url} alt={`დამატებითი ფოტო ${index+1}`} draggable={false}/>
    <button type="button" className="admin-photo-remove" disabled={disabled} aria-label={`ფოტო ${index+1} — ამოღება`} onClick={()=>onChange(photos.filter((_,i)=>i!==index))}><X size={18}/></button>
    <button type="button" className="admin-gallery-grip" disabled={disabled||photos.length<2} aria-label={`ფოტო ${index+1} — რიგის შეცვლა`} aria-describedby="admin-gallery-keyboard" onPointerDown={e=>start(e,index)} onPointerMove={e=>{const current=drag.current;if(current&&e.pointerId===current.pointer){current.x=e.clientX;current.y=e.clientY;}}} onPointerUp={finish} onPointerCancel={()=>cleanup()} onLostPointerCapture={()=>cleanup()} onKeyDown={e=>keyboard(e,index)}><GripHorizontal size={18}/><span>{index+1}</span></button>
   </div>)}
  </div>
  <span id="admin-gallery-keyboard" className="sr-only">გამოიყენეთ ისრები ფოტოს გადასატანად, Home პირველ ადგილზე და End ბოლოში გადასატანად. Escape აუქმებს გადაადგილებას.</span>
  <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
 </>;
}
