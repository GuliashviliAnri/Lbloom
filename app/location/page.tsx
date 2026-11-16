import type {Metadata} from 'next';
import {siteUrl} from '@/lib/seo';
import {catalog} from '@/lib/catalog';import {Shell,LocationSection} from '@/components/site';export const revalidate=86400;export const metadata:Metadata={title:'ლოკაცია',alternates:{canonical:siteUrl('/contact')}};export default async function Page(){const d=await catalog('settings');return <Shell settings={d.settings}><LocationSection settings={d.settings}/></Shell>}
