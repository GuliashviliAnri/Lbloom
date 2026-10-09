import {catalog} from '@/lib/catalog';
import {Shell,LocationSection} from '@/components/site';
export const dynamic='force-dynamic';
export default async function Page(){const d=await catalog('settings');return <Shell settings={d.settings}><div className="container contact-page-heading"><h1>კონტაქტი</h1><p>გვეწვიეთ საბაღე ცენტრში ან დაგვიკავშირდით პროდუქტისა და მომსახურების შესახებ.</p></div><LocationSection settings={d.settings} title="გვეწვიეთ ან მოგვწერეთ"/></Shell>}
