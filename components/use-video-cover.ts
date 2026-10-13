"use client";
import {useEffect,useState} from 'react';
import {facebookVideoUrl} from '@/lib/video-source';
import {fetchPersistentFacebookCover} from '@/lib/facebook-cover-client';
const covers=new Map<string,string>();
export default function useVideoCover(videoUrl:string,saved='',videoId?:string){
 const image=saved&&!saved.includes('logo-mark')?saved:'';
 const key=videoId+':'+videoUrl;
 const [automatic,setAutomatic]=useState<{key:string;src:string}|null>(()=>{const src=covers.get(key);return src?{key,src}:null;});
 useEffect(()=>{
  if(image||!videoId||!facebookVideoUrl(videoUrl))return;
  const cached=covers.get(key);if(cached){setAutomatic({key,src:cached});return;}
  let active=true;const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),45000);
  fetchPersistentFacebookCover(videoUrl,videoId,controller.signal).then(src=>{
   if(covers.size>=32)covers.delete(covers.keys().next().value!);covers.set(key,src);
   if(active)setAutomatic({key,src});
  }).catch(()=>{}).finally(()=>clearTimeout(timer));
  return()=>{active=false;clearTimeout(timer);controller.abort();};
 },[videoUrl,videoId,image,key]);
 return image||(automatic?.key===key?automatic.src:'');
}
