"use client";
import {useEffect,useRef,useState} from 'react';
import {Check,Copy} from 'lucide-react';
export default function StoryLinkCopy({url}:{url:string}){
 const [status,setStatus]=useState<'idle'|'copied'|'manual'>('idle');
 const field=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(status==='manual'){field.current?.focus();field.current?.select();}},[status]);
 useEffect(()=>{setStatus('idle');},[url]);
 async function copy(){
  try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(url);setStatus('copied');}
  catch{setStatus('manual');}
 }
 return <div className="story-link-copy">
  <button className="story-copy-button" type="button" onClick={()=>void copy()}>{status==='copied'?<Check size={17}/>:<Copy size={17}/>}ბმულის კოპირება</button>
  {status==='manual'&&<input ref={field} className="story-copy-field" aria-label="სტატიის ბმული — დააკოპირეთ ხელით" value={url} readOnly onFocus={e=>e.currentTarget.select()}/>}
  <span className="story-copy-status" role="status">{status==='copied'?'ბმული დაკოპირებულია. შეგიძლიათ ჩასვათ Facebook-ის გვერდის ახალ პოსტში.':status==='manual'?'დააკოპირეთ მონიშნული ბმული.':''}</span>
 </div>;
}
