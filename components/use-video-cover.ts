"use client";
import {useEffect,useState} from 'react';
import {facebookVideoUrl} from '@/lib/video-source';
import {fetchFacebookCover} from '@/lib/facebook-cover-client';
export default function useVideoCover(videoUrl:string,saved=''){
 const image=saved&&!saved.includes('logo-mark')?saved:'';
 const [automatic,setAutomatic]=useState<{url:string;src:string}|null>(null);
 useEffect(()=>{
  if(image||!facebookVideoUrl(videoUrl))return;
  let active=true,objectUrl='';const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),45000);
  fetchFacebookCover(videoUrl,controller.signal).then(blob=>{
   if(!active)return;objectUrl=URL.createObjectURL(blob);setAutomatic({url:videoUrl,src:objectUrl});
  }).catch(()=>{}).finally(()=>clearTimeout(timer));
  return()=>{active=false;clearTimeout(timer);controller.abort();if(objectUrl)URL.revokeObjectURL(objectUrl);};
 },[videoUrl,image]);
 return image||(automatic?.url===videoUrl?automatic.src:'');
}
