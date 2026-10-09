/* eslint-disable @next/next/no-html-link-for-pages -- Native links preserve navigation in the Sites runtime. */
import {notFound} from 'next/navigation';
import DirectionIcon from '@/components/direction-icon';
import {catalog} from '@/lib/catalog';
import ResponsiveImage from '@/components/responsive-image';
import StoryDate from '@/components/story-date';
import {Shell} from '@/components/site';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const d=await catalog('stories',slug);const story=d.garden_stories.find(s=>s.slug===slug);if(!story)notFound();
 return <Shell settings={d.settings}><article className="container story-detail">
  <nav className="breadcrumbs" aria-label="გვერდის მდებარეობა"><a href="/">მთავარი</a><span>/</span><a href="/garden-stories">საბაღე ამბები</a></nav>
  <div className="story-detail-layout">
   <header className="story-detail-heading"><span className="story-label">საბაღე ამბები</span><StoryDate value={story.created_at}/><h1>{story.title}</h1>{story.excerpt&&<p className="story-intro">{story.excerpt}</p>}</header>
   <figure className="story-detail-photo"><ResponsiveImage src={story.image_url} alt={story.title} sizes="(max-width:767px) 100vw, 50vw" fetchPriority="high"/></figure>
   <div className="story-body">{story.body.split(/\n\s*\n/).filter(Boolean).map((text:string,i:number)=><p key={i}>{text}</p>)}<a className="story-back-link" href="/garden-stories"><DirectionIcon direction="left" size={17}/>ყველა საბაღე ამბავი</a></div>
  </div>
 </article></Shell>;
}
