"use client";
import {useSyncExternalStore} from 'react';
import Script from 'next/script';
const subscribe=()=>()=>{};
export function isTopGeHost(hostname:string){return hostname==='lbloom.ge'||hostname==='www.lbloom.ge';}
const productionHost=()=>isTopGeHost(window.location.hostname);
export default function TopGeCounter(){
 // Keep the registered counter off private previews, localhost and the admin panel.
 const enabled=useSyncExternalStore(subscribe,productionHost,()=>false);
 if(!enabled)return null;
 return <div className="top-ge-counter">
  <div id="top-ge-counter-container" data-site-id="119031"/>
  <Script id="top-ge-counter-script" async src="//counter.top.ge/counter.js" strategy="afterInteractive"/>
 </div>;
}
