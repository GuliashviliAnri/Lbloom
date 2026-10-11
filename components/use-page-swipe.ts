"use client";
import {useRef} from 'react';
import type {TouchEvent,MouseEvent} from 'react';
export default function usePageSwipe(move:(step:number)=>void){
 const start=useRef<{x:number;y:number}|null>(null);
 const suppressClickUntil=useRef(0);
 return {
  onTouchStart:(event:TouchEvent)=>{if(event.touches.length!==1){start.current=null;return;}const point=event.touches[0];start.current={x:point.clientX,y:point.clientY};},
  onTouchCancel:()=>{start.current=null;},
  onTouchEnd:(event:TouchEvent)=>{
   const origin=start.current;start.current=null;if(!origin)return;
   const point=event.changedTouches[0];const dx=point.clientX-origin.x,dy=point.clientY-origin.y;
   if(Math.abs(dx)<45||Math.abs(dx)<=Math.abs(dy))return;
   suppressClickUntil.current=Date.now()+500;
   move(dx<0?1:-1);
  },
  onClickCapture:(event:MouseEvent)=>{if(Date.now()<suppressClickUntil.current){event.preventDefault();event.stopPropagation();}}
 };
}
