"use client";
import {useEffect,useRef,useState} from 'react';
export default function useSmoothPage(){
 const [page,setPage]=useState(0);
 const [previousPage,setPreviousPage]=useState<number|null>(null);
 const [motion,setMotion]=useState('');
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const busy=useRef(false);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 function move(next:number){
  if(next===page||busy.current)return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setPage(next);setPreviousPage(null);setMotion('');return;}
  busy.current=true;
  setPreviousPage(page);setPage(next);setMotion(next>page?'page-next':'page-previous');
  timer.current=setTimeout(()=>{setPreviousPage(null);setMotion('');busy.current=false;timer.current=null},600);
 }
 return {page,previousPage,move,motion};
}
