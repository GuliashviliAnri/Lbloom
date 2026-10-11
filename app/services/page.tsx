import {pageMetadata} from '@/lib/seo';
import {catalog} from '@/lib/catalog';import {Shell,ServiceCard} from '@/components/site';export const dynamic='force-dynamic';
export const metadata=pageMetadata("ჩვენი სერვისები", "LBLOOM-ის საბაღე ცენტრის სერვისები. გაეცანით მომსახურების დეტალებს და დაგვიკავშირდით თქვენი ეზოსთვის სასურველი გადაწყვეტილების შესარჩევად.", "/services");
export default async function Page(){const d=await catalog('services');return <Shell settings={d.settings}><section className="container section page-section services-page"><span className="eyebrow">LBLOOM საბაღე ცენტრი</span><h1>ჩვენი სერვისები</h1><div className="service-grid">{d.services.map(s=><ServiceCard key={s.id} service={s}/>)}</div></section></Shell>}
