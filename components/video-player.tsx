"use client";
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import useVideoAspect from './use-video-aspect';
import useVideoCover from './use-video-cover';
import {facebookVideoUrl} from '@/lib/video-source';
import {preloadFacebookPlayback,preparedFacebookPlayback,forgetFacebookPlayback} from '@/lib/facebook-playback';
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
 const facebookUrl=facebookVideoUrl(video.video_url);const facebook=Boolean(facebookUrl);
 const [resolved,setResolved]=useState<{url:string;src:string}|null>(()=>{const src=facebookUrl?preparedFacebookPlayback(facebookUrl):null;return src&&facebookUrl?{url:facebookUrl,src}:null;});
 const [retry,setRetry]=useState(0);
 const source=facebookUrl?(resolved?.url===facebookUrl?resolved.src:''):video.video_url;
 const [playbackFailed,setPlaybackFailed]=useState(false);
 useEffect(()=>{
  setPlaybackFailed(false);setMediaAspect(null);
  if(!facebookUrl){setResolved(null);return;}
  const cached=preparedFacebookPlayback(facebookUrl);if(cached){setResolved({url:facebookUrl,src:cached});return;}
  setResolved(null);
  const controller=new AbortController();let active=true;
  const timeout=setTimeout(()=>controller.abort(),45000);
  preloadFacebookPlayback(facebookUrl,controller.signal).then(src=>{if(active)setResolved({url:facebookUrl,src});}).catch(()=>{if(active)setPlaybackFailed(true);}).finally(()=>clearTimeout(timeout));
  return()=>{active=false;clearTimeout(timeout);controller.abort();};
 },[facebookUrl,video.video_url,retry]);
 const cover=useVideoCover(video.video_url,video.thumbnail_url,video.id);
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
  <div className="video-player" style={{'--video-ratio':mediaAspect??coverAspect} as CSSProperties}>{playbackFailed?<div className="video-playback-failed" role="status"><p>ვიდეოს დაკვრა ვერ მოხერხდა.</p>{facebook?<p>სცადეთ Facebook-ზე ნახვა ქვემოთ მოცემული ღილაკით.</p>:<p>სცადეთ ხელახლა.</p>}<button type="button" className="button secondary" onClick={()=>{if(facebookUrl)forgetFacebookPlayback(facebookUrl);setPlaybackFailed(false);setResolved(null);setRetry(value=>value+1);}}>ხელახლა ცდა</button></div>:<video key={source} src={source||undefined} style={!source?{aspectRatio:coverAspect}:undefined} poster={cover||undefined} controls autoPlay playsInline preload="auto" onLoadedMetadata={event=>{const media=event.currentTarget;if(media.videoWidth&&media.videoHeight)setMediaAspect(media.videoWidth/media.videoHeight);}} onPlaying={()=>void record()} onError={()=>{if(source)setPlaybackFailed(true);}}/>}</div>
  <div className="video-player-meta"><div className="video-view-count" role="status" aria-live="polite"><Eye size={17} aria-hidden="true"/>{count!==null?<span><strong>{count.toLocaleString('en-US')}</strong> ნახვა</span>:<span>{failed?'ნახვები დროებით მიუწვდომელია':'ნახვები იტვირთება…'}</span>}</div><div className="video-player-actions">{video.duration&&<span className="video-player-duration"><Clock size={15} aria-hidden="true"/>{video.duration}</span>}{facebook&&<a className="video-facebook-button" href={facebookVideoUrl(video.video_url)!} target="_blank" rel="noopener noreferrer"><FacebookIcon/>Facebook-ზე ნახვა</a>}</div></div>
 </>;
}
