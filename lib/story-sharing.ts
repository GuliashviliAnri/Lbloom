import type {Metadata} from 'next';
import type {GardenStory} from './types';
export const publicSiteOrigin=process.env.NEXT_PUBLIC_SITE_URL||'https://lbloom.ge';
function origin(value:string){
 try{const url=new URL(value);if(['https:','http:'].includes(url.protocol))return url.origin}catch{}
 return 'https://lbloom.ge';
}
export function storyUrl(slug:string,siteOrigin=publicSiteOrigin){
 return new URL('/garden-stories/'+encodeURIComponent(slug),origin(siteOrigin)).href;
}
export function facebookStoryShareUrl(slug:string,siteOrigin=publicSiteOrigin){
 return 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(storyUrl(slug,siteOrigin));
}
export function storySharingMetadata(story:GardenStory,siteOrigin=publicSiteOrigin):Metadata{
 const base=origin(siteOrigin);
 const url=storyUrl(story.slug,base);
 const description=story.excerpt.trim()||story.body.replace(/\s+/g,' ').trim().slice(0,200);
 let image:string|undefined;
 if(story.image_url.trim())try{const parsed=new URL(story.image_url,base);if(['https:','http:'].includes(parsed.protocol))image=parsed.href}catch{}
 const images=image?[{url:image,alt:story.title}]:[];
 const date=(value?:string)=>value&&Number.isFinite(Date.parse(value))?new Date(value).toISOString():undefined;
 return {
  title:story.title,description,
  alternates:{canonical:url},
  openGraph:{type:'article',url,title:story.title,description,siteName:'LBLOOM საბაღე ცენტრი',locale:'ka_GE',images,publishedTime:date(story.created_at),modifiedTime:date(story.updated_at)},
  twitter:{card:'summary_large_image',title:story.title,description,images}
 };
}
