"use client";
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import useVideoAspect from './use-video-aspect';
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
 const source=facebook?'/api/video-source?url='+encodeURIComponent(facebookVideoUrl(video.video_url)!):video.video_url;
 const [playbackFailed,setPlaybackFailed]=useState(false);
 const cover=video.thumbnail_url||(facebook?automaticVideoCover(video.video_url):'');
 const coverAspect=useVideoAspect(cover);const [mediaAspect,setMediaAspect]=useState<number|null>(null);
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
 return <>
  <div className="video-player" style={{'--video-ratio':mediaAspect??coverAspect} as CSSProperties}>{playbackFailed?<div className="video-playback-failed" role="status"><p>ვიდეოს დაკვრა ვერ მოხერხდა.</p>{facebook?<p>სცადეთ Facebook-ზე ნახვა ქვემოთ მოცემული ღილაკით.</p>:<p>სცადეთ ხელახლა.</p>}<button type="button" className="button secondary" onClick={()=>setPlaybackFailed(false)}>ხელახლა ცდა</button></div>:<video key={source} src={source} poster={cover||undefined} controls autoPlay playsInline preload="metadata" onLoadedMetadata={event=>{const media=event.currentTarget;if(media.videoWidth&&media.videoHeight)setMediaAspect(media.videoWidth/media.videoHeight);}} onPlaying={()=>void record()} onError={()=>setPlaybackFailed(true)}/>}</div>
  <div className="video-player-meta"><div className="video-view-count" role="status" aria-live="polite"><Eye size={17} aria-hidden="true"/>{count!==null?<span><strong>{count.toLocaleString('en-US')}</strong> ნახვა</span>:<span>{failed?'ნახვები დროებით მიუწვდომელია':'ნახვები იტვირთება…'}</span>}</div><div className="video-player-actions">{video.duration&&<span className="video-player-duration"><Clock size={15} aria-hidden="true"/>{video.duration}</span>}{facebook&&<a className="video-facebook-button" href={facebookVideoUrl(video.video_url)!} target="_blank" rel="noopener noreferrer"><FacebookIcon/>Facebook-ზე ნახვა</a>}</div></div>
 </>;
}
