"use client";
import {useSyncExternalStore} from 'react';
const mobile='(max-width: 767px)';
const tablet='(max-width: 1023px)';
function subscribe(notify:()=>void){
 const queries=[window.matchMedia(mobile),window.matchMedia(tablet)];
 queries.forEach(query=>query.addEventListener('change',notify));
 return ()=>queries.forEach(query=>query.removeEventListener('change',notify));
}
// Zero means the original native horizontal scroll on phones.
function snapshot(){return window.matchMedia(mobile).matches?0:window.matchMedia(tablet).matches?2:4;}
export default function useCardPageSize(){return useSyncExternalStore(subscribe,snapshot,()=>4);}
