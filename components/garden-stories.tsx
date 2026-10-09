"use client";
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import DirectionIcon from './direction-icon';
import type {GardenStory} from '@/lib/types';
import ResponsiveImage from './responsive-image';
import StoryDate from './story-date';
import {GardenStoryCard} from './site';
function subscribeReducedMotion(callback:()=>void){const media=window.matchMedia('(prefers-reduced-motion: reduce)');media.addEventListener('change',callback);return()=>media.removeEventListener('change',callback)}
const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const serverReducedMotion=()=>false;
export default function GardenStories({stories,overview=false}:{stories:GardenStory[];overview?:boolean}) {
 const [index,setIndex]=useState(0);
 const paused=useSyncExternalStore(subscribeReducedMotion,reducedMotion,serverReducedMotion);
 const [hovered,setHovered]=useState(false);
 const [focused,setFocused]=useState(false);
 const touch=useRef<{x:number;y:number}|null>(null);
 const count=stories.length;
 const active=count?index%count:0;
 useEffect(()=>{
  if(count<2||paused||hovered||focused)return;
  const timer=window.setTimeout(()=>setIndex(i=>(i+1)%count),6000);
  return()=>window.clearTimeout(timer);
 },[count,paused,hovered,focused,index]);
 function move(step:number){setIndex(i=>(i+step+count)%count)}
 if(!count)return <div className="empty">საბაღე ამბები მალე დაემატება.</div>;
 const sideStories=stories.slice(1,3);
 return <><div className="story-grid">
  <div className="story-carousel" role="region" aria-roledescription="კარუსელი" aria-label="საბაღე ამბები"
   onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
   onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false)}}
   onKeyDown={e=>{if(count>1&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();move(e.key==='ArrowLeft'?-1:1)}}}
   onTouchStart={e=>{const point=e.touches[0];touch.current={x:point.clientX,y:point.clientY}}}
   onTouchCancel={()=>{touch.current=null}}
   onTouchEnd={e=>{const start=touch.current;touch.current=null;if(!start||count<2)return;const point=e.changedTouches[0];const dx=point.clientX-start.x,dy=point.clientY-start.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))move(dx<0?1:-1)}}>
   <div className="story-slides" aria-live={paused?'polite':'off'}>
    {stories.filter((_,i)=>i===active||i===(active+1)%count).map(story=><a key={story.id} href={'/garden-stories/'+story.slug} className="story-card story-featured" hidden={story.id!==stories[active].id} aria-label={story.title}>
     <ResponsiveImage src={story.image_url} alt={story.title} sizes="(max-width:767px) 100vw, 50vw" loading="eager" fetchPriority={story.id===stories[active].id?'high':'low'}/>
     <div className="story-caption"><div className="story-caption-copy"><StoryDate value={story.created_at}/><h3>{story.title}</h3><p>{story.excerpt}</p></div><span className="text-link">წაიკითხე</span></div>
    </a>)}
   </div>
   {count>1&&<>
    <button type="button" className="carousel-arrow previous" aria-label="წინა ამბავი" onClick={()=>move(-1)}><DirectionIcon direction="left" size={23}/></button>
    <button type="button" className="carousel-arrow next" aria-label="შემდეგი ამბავი" onClick={()=>move(1)}><DirectionIcon size={23}/></button>
   </>}
  </div>
  {sideStories.map(story=><GardenStoryCard key={story.id} story={story}/>)}
 </div>{!overview&&stories.length>3&&<div className="story-grid story-more-grid">{stories.slice(3).map(story=><GardenStoryCard key={story.id} story={story}/>)}</div>}</>;
}
