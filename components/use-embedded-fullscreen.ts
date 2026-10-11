"use client";
import {useSyncExternalStore} from 'react';
function subscribe(callback:()=>void){
 const pointer=window.matchMedia('(pointer: fine)'),hover=window.matchMedia('(hover: hover)');
 pointer.addEventListener('change',callback);hover.addEventListener('change',callback);
 return()=>{pointer.removeEventListener('change',callback);hover.removeEventListener('change',callback);};
}
function snapshot(){return window.matchMedia('(pointer: fine)').matches&&window.matchMedia('(hover: hover)').matches;}
// Start safely with inline playback. Rotating a phone does not enable fullscreen.
export default function useEmbeddedFullscreen(){return useSyncExternalStore(subscribe,snapshot,()=>false);}
