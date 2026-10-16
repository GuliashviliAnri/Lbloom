import {pageMetadata} from '@/lib/seo';
import {catalog} from '@/lib/catalog';import {Shell,Videos} from '@/components/site';export const dynamic='force-dynamic';
export const metadata=pageMetadata("საბაღე ვიდეოები", "ნახეთ LBLOOM-ის ვიდეოები მცენარეებზე, ეზოს ავეჯსა და საბაღე ცენტრის სიახლეებზე. გაეცანით პროდუქციას ვიდეოშიც.", "/videos");
export default async function Page(){const d=await catalog('videos');return <Shell settings={d.settings}><section className="container section page-section"><h1>სიახლეები კადრში</h1><Videos videos={d.videos}/></section></Shell>}
