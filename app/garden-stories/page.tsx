import GardenStories from '@/components/garden-stories';
import {catalog} from '@/lib/catalog';import {Shell} from '@/components/site';
export const dynamic='force-dynamic';export const metadata={title:'საბაღე ამბები'};
export default async function Page(){const d=await catalog('stories');return <Shell settings={d.settings}><section className="container section page-section stories-page"><h1>საბაღე ამბები</h1><GardenStories stories={d.garden_stories}/></section></Shell>}
