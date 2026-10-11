"use client";
import {useEffect,useRef,useState} from 'react';
import FacebookVideo from './facebook-video';
import {automaticVideoCover} from '@/lib/facebook-cover';
import {facebookVideoUrl} from '@/lib/video-source';
import {Eye,Clock} from 'lucide-react';
import {FacebookIcon} from './social-links';
import {supabase} from '@/lib/supabase';
import type {Video} from '@/lib/types';
let temporaryVisitor:string|undefined;
function visitorId(){
 try{
  const saved=localStorage.getItem('lbloom-video-visitor');
  if(saved&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(saved))return saved;
  const id=crypto.randomUUID();localStorage.setItem('lbloom-video-visitor',id);return id;
 }catch{return temporaryVisitor??(temporaryVisitor=crypto.randomUUID())}
}
export default function VideoPlayer({video}:{video:Video}){
 const facebook=Boolean(facebookVideoUrl(video.video_url));
 const [count,setCount]=useState<number|null>(null);
 const [failed,setFailed]=useState(false);
 const recorded=useRef(false);
 const pending=useRef(false);
 useEffect(()=>{
  let mounted=true;
  async function load(){
   if(!supabase){if(mounted)setFailed(true);return}
   try{
    const {data,error}=await supabase.from('video_view_counts').select('view_count').eq('video_id',video.id).abortSignal(AbortSignal.timeout(12000)).maybeSingle();
    if(!mounted)return;
    if(error){setFailed(true);return}
    setCount(previous=>Math.max(previous??0,Number(data?.view_count??0)));setFailed(false);
   }catch{if(mounted)setFailed(true)}
  }
  void load();return()=>{mounted=false};
 },[video.id]);
 async function record(){
  if(!supabase||recorded.current||pending.current)return;
  pending.current=true;
  try{
   const {data,error}=await supabase.rpc('record_video_view',{p_video_id:video.id,p_visitor_id:visitorId()}).abortSignal(AbortSignal.timeout(12000));
   if(!error&&data!==null&&Number.isFinite(Number(data))){recorded.current=true;setCount(previous=>Math.max(previous??0,Number(data)));setFailed(false)}
  }catch{/* Counting failures must not interrupt playback. */}
  finally{pending.current=false}
 }
 useEffect(()=>{if(facebook)void record();},[video.id,facebook]);
 return <>
  <div className={"video-player"+(facebook?" facebook-player":"")}>{facebook?<FacebookVideo url={video.video_url} title={video.title} cover={video.thumbnail_url||automaticVideoCover(video.video_url)}/>:<video src={video.video_url} poster={video.thumbnail_url} controls autoPlay playsInline onPlaying={()=>void record()}/>}</div>
  <div className="video-player-meta"><div className="video-view-count" role="status" aria-live="polite"><Eye size={17} aria-hidden="true"/>{count!==null?<span><strong>{count.toLocaleString('en-US')}</strong> {facebook?'გახსნა':'ნახვა'}</span>:<span>{failed?'ნახვები დროებით მიუწვდომელია':'ნახვები იტვირთება…'}</span>}</div><div className="video-player-actions">{video.duration&&<span className="video-player-duration"><Clock size={15} aria-hidden="true"/>{video.duration}</span>}{facebook&&<a className="video-facebook-button" href={facebookVideoUrl(video.video_url)!} target="_blank" rel="noopener noreferrer"><FacebookIcon/>Facebook-ზე ნახვა</a>}</div></div>
 </>;
}
