"use client";
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {facebookEmbedUrl} from '@/lib/video-source';
import useVideoAspect from './use-video-aspect';
export default function FacebookVideo({url,title,cover='',preview=false}:{url:string;title:string;cover?:string;preview?:boolean}){
 const frame=useRef<HTMLDivElement>(null);const [width,setWidth]=useState(300);
 useEffect(()=>{const element=frame.current;if(!element)return;const update=()=>{const next=Math.round(element.clientWidth);if(next>0)setWidth(next);};update();const observer=new ResizeObserver(update);observer.observe(element);return()=>observer.disconnect();},[]);
 const ratio=useVideoAspect(cover);const base=facebookEmbedUrl(url);if(!base)return null;
 const src=new URL(base);src.searchParams.set('width',String(width));src.searchParams.set('height',String(Math.round(width/ratio)));
 return <div ref={frame} className={'facebook-video'+(preview?' facebook-video-preview':'')} style={{'--video-ratio':ratio} as CSSProperties}><iframe src={src.toString()} title={title} loading={preview?'lazy':undefined} tabIndex={preview?-1:undefined} aria-hidden={preview?true:undefined} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/></div>;
}
