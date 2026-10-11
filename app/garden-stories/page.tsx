import {pageMetadata} from '@/lib/seo';
import GardenStories from '@/components/garden-stories';
import {catalog} from '@/lib/catalog';import {Shell} from '@/components/site';
export const dynamic='force-dynamic';
export const metadata=pageMetadata("საბაღე ამბები და რჩევები", "LBLOOM-ის საბაღე ამბები: მცენარეების შერჩევა, მოვლა, ცოცხალი ღობე და ეზოს მოწყობა. წაიკითხეთ პრაქტიკული რჩევები და სიახლეები.", "/garden-stories");

export default async function Page(){const d=await catalog('stories');return <Shell settings={d.settings}><section className="container section page-section stories-page"><h1>საბაღე ამბები</h1><GardenStories stories={d.garden_stories}/></section></Shell>}
