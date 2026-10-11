"use client";
import {useEffect,useState} from 'react';
export default function useVideoAspect(cover:string,fallback=16/9){
 const [measured,setMeasured]=useState<{cover:string;ratio:number}|null>(null);
 useEffect(()=>{
  if(!cover)return;let active=true;const image=new Image();
  image.onload=()=>{if(active&&image.naturalWidth&&image.naturalHeight)setMeasured({cover,ratio:image.naturalWidth/image.naturalHeight});};
  image.src=cover;return()=>{active=false;image.onload=null;};
 },[cover]);
 return measured?.cover===cover?measured.ratio:fallback;
}
