'use client';
import {useEffect,useState} from 'react';
import {Eye} from 'lucide-react';
export default function StoryViews({storyId,record=false}:{storyId:string;record?:boolean}){
 const [views,setViews]=useState<number|null>(null);
 useEffect(()=>{
  const controller=new AbortController();let active=true;
  async function load(){try{
   let visitor='';
   if(record){const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tbilisi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());try{visitor=localStorage.getItem('lbloom-story-visitor')||'';if(!visitor.startsWith(day+'.')){visitor=day+'.'+crypto.randomUUID();localStorage.setItem('lbloom-story-visitor',visitor)}}catch{visitor=day+'.'+crypto.randomUUID()}}
   const response=await fetch('/api/story-views?id='+encodeURIComponent(storyId),{method:record?'POST':'GET',...(record?{headers:{'Content-Type':'application/json'},body:JSON.stringify({id:storyId,visitor})}:{}),signal:controller.signal});
   if(!response.ok)return;const data=await response.json();if(active&&Number.isSafeInteger(data.views)&&data.views>=0)setViews(data.views);
  }catch{/* Do not show a fabricated count if statistics are unavailable. */}}
  void load();return()=>{active=false;controller.abort()};
 },[storyId,record]);
 return <span className="story-views" title="ნახვების რაოდენობა"><Eye size={15} aria-hidden="true"/>{views===null?'…':views.toLocaleString('ka-GE')} ნახვა</span>;
}
