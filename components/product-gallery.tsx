"use client";
import ResponsiveImage from './responsive-image';
import {fullImageSource,isIllustrativeImage} from '@/lib/image-path';
import {useEffect,useId,useRef,useState} from 'react';
import {Expand,X} from 'lucide-react';
import DirectionIcon from './direction-icon';
import type {Item} from '@/lib/types';
export default function ProductGallery({item}:{item:Item}){
 const images=[...new Set([item.image_url,...(item.gallery_images??[])].filter(Boolean))];
 const [index,setIndex]=useState(0);const [open,setOpen]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null);const trigger=useRef<HTMLButtonElement>(null);const touch=useRef<number|null>(null);const titleId=useId();
 const pointerOpen=useRef(false);
 const active=images[index]??images[0];
 useEffect(()=>{
  if(!open)return;const modal=dialog.current;if(!modal)return;
  const overflow=document.body.style.overflow;document.body.style.overflow='hidden';modal.showModal();
  return()=>{modal.close();document.body.style.overflow=overflow;trigger.current?.focus({preventScroll:true});if(pointerOpen.current)trigger.current?.blur()};
 },[open]);
 function step(delta:number){setIndex(i=>(i+delta+images.length)%images.length)}
 if(!images.length)return <div className="detail-image detail-image-empty">ფოტო მალე დაემატება</div>;
 return <div className="product-gallery">
  <button type="button" className="detail-image detail-image-trigger" ref={trigger} onPointerDown={()=>{pointerOpen.current=true}} onKeyDown={()=>{pointerOpen.current=false}} onClick={()=>setOpen(true)} aria-label={item.name+' — ფოტოს გადიდება'}>
   <ResponsiveImage key={active} src={active} alt={item.name} sizes="(max-width:767px) 100vw, 50vw" fetchPriority="high"/><span className="image-expand"><Expand size={17}/>გადიდება</span>
  </button>
  {isIllustrativeImage(active)&&<p className="photo-note">ფოტო საილუსტრაციოა.</p>}
  {images.length>1&&<div className="gallery" aria-label="პროდუქტის ფოტოები">{images.map((image,i)=><button type="button" key={image} onClick={()=>setIndex(i)} aria-label={'ფოტო '+(i+1)} aria-pressed={index===i}><ResponsiveImage src={image} alt="" sizes="80px" loading="lazy"/></button>)}</div>}
  <dialog ref={dialog} className="photo-dialog" aria-labelledby={titleId} onCancel={e=>{e.preventDefault();setOpen(false)}} onClose={()=>setOpen(false)} onClick={e=>{if(e.target===dialog.current)setOpen(false)}} onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}if(e.key==='ArrowRight'){e.preventDefault();step(1)}}}>
   {open&&<><div className="photo-dialog-header"><h2 id={titleId} className="sr-only">{item.name}</h2><button type="button" autoFocus onClick={()=>setOpen(false)} aria-label="ფოტოს დახურვა"><X size={23}/></button></div>
   <div className="photo-dialog-image" onClick={e=>{if(e.target===e.currentTarget)setOpen(false)}} onTouchStart={e=>{touch.current=e.touches[0]?.clientX??null}} onTouchEnd={e=>{if(touch.current!==null){const distance=(e.changedTouches[0]?.clientX??touch.current)-touch.current;if(Math.abs(distance)>60)step(distance>0?-1:1)}touch.current=null}}><img src={fullImageSource(active)} alt={item.name+' — ფოტო '+(index+1)}/></div>
   {images.length>1&&<div className="photo-dialog-controls"><button className="photo-prev" type="button" onClick={()=>step(-1)} aria-label="წინა ფოტო"><DirectionIcon direction="left" size={22}/></button><span aria-live="polite">{index+1} / {images.length}</span><button className="photo-next" type="button" onClick={()=>step(1)} aria-label="შემდეგი ფოტო"><DirectionIcon size={22}/></button></div>}</>}
  </dialog>
 </div>;
}
