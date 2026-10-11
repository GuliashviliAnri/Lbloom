import {siteUrl} from './seo';
import type {Item,Service,GardenStory} from './types';
import type {MetadataRoute} from 'next';
export function sitemapEntries(data:{products:Item[];furniture:Item[];services:Service[];garden_stories:GardenStory[]}):MetadataRoute.Sitemap{
 const entries:MetadataRoute.Sitemap=['/','/plants','/furniture','/services','/garden-stories','/videos','/contact'].map(path=>({url:siteUrl(path)}));
 const add=(path:string,rows:{slug:string;updated_at?:string}[])=>rows.filter(row=>row.slug).forEach(row=>{const changed=row.updated_at&&Number.isFinite(Date.parse(row.updated_at))?new Date(row.updated_at).toISOString():undefined;entries.push({url:siteUrl(path+encodeURIComponent(row.slug)),...(changed?{lastModified:changed}:{})});});
 add('/plants/',data.products);add('/furniture/',data.furniture);add('/services/',data.services);add('/garden-stories/',data.garden_stories.filter(story=>story.is_published));
 return [...new Map(entries.map(entry=>[entry.url,entry])).values()];
}
