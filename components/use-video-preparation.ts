"use client";
import {useEffect,useRef} from 'react';
import {facebookVideoUrl} from '@/lib/video-source';
import {preloadFacebookPlayback} from '@/lib/facebook-playback';
export default function useVideoPreparation(url:string){
 const card=useRef<HTMLButtonElement>(null);
 const prepare=()=>{if(facebookVideoUrl(url))void preloadFacebookPlayback(url).catch(()=>{});};
 useEffect(()=>{
  if(!card.current||!facebookVideoUrl(url)||typeof IntersectionObserver==='undefined')return;
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){prepare();observer.disconnect();}
  },{rootMargin:'160px',threshold:0.01});
  observer.observe(card.current);return()=>observer.disconnect();
 },[url]);
 return {ref:card,onPointerEnter:prepare,onPointerDown:prepare,onFocus:prepare};
}
