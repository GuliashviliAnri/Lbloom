import type {MetadataRoute} from 'next';
import {catalog} from '@/lib/catalog';
import {sitemapEntries} from '@/lib/seo-sitemap';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const data=await catalog('all');
 if(!data.connected)throw new Error('Live catalog unavailable for sitemap');
 return sitemapEntries(data);
}
