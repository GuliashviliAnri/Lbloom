import {pageMetadata} from '@/lib/seo';
import {catalog} from '@/lib/catalog';
import {Shell,LocationSection} from '@/components/site';
export const dynamic='force-dynamic';
export const metadata=pageMetadata("კონტაქტი და ლოკაცია", "დაუკავშირდით LBLOOM-ის საბაღე ცენტრს თბილისში. ნახეთ ტელეფონი, სამუშაო საათები, სოციალური გვერდები და ლოკაცია რუკაზე.", "/contact");

export default async function Page(){const d=await catalog('settings');return <Shell settings={d.settings}><div className="container contact-page-heading"><h1>კონტაქტი</h1><p>გვეწვიეთ საბაღე ცენტრში ან დაგვიკავშირდით პროდუქტისა და მომსახურების შესახებ.</p></div><LocationSection settings={d.settings} title="გვეწვიეთ ან მოგვწერეთ"/></Shell>}
