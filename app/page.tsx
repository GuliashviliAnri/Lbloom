import HomeProducts from '@/components/home-products';
import GardenStories from '@/components/garden-stories';
import {catalog} from '@/lib/catalog';
import {Shell,SectionHeader,ServiceCard,Videos,LocationSection} from '@/components/site';
export const dynamic='force-dynamic';
export default async function Home(){
 const d=await catalog('home');
 const plants=d.products;
 const furniture=d.furniture;
 return <Shell settings={d.settings}>
  <section className="container home-intro"><h1>შექმენი ლამაზი ეზო ჩვენთან ერთად</h1><p>მცენარეები, ეზოს ავეჯი და პროფესიონალური სერვისები ერთ სივრცეში.</p></section>
  <section className="container section garden-stories-section"><SectionHeader title="საბაღე ამბები" link="/garden-stories" label="ყველა ამბავი"/><GardenStories stories={d.garden_stories} overview/></section>
  <section className="container section"><SectionHeader title="მცენარეები" link="/plants" label="ყველა მცენარე"/>{plants.length?<HomeProducts items={plants}/>:<div className="empty">მცენარეები მალე დაემატება.</div>}</section>
  <section className="container section videos-section"><SectionHeader title="ჩვენი ვიდეოები" link="/videos" label="ყველა ვიდეო"/><Videos videos={d.videos} advertisement={d.advertisement} featured/></section>
  <section className="container section"><SectionHeader title="ეზოს ავეჯი" link="/furniture" label="ყველა ეზოს ავეჯი"/>{furniture.length?<HomeProducts items={furniture} furniture/>:<div className="empty">ეზოს ავეჯის მიმდინარე არჩევანი დააზუსტეთ ჩვენთან: {d.settings.phone}.</div>}</section>
  <section className="section services-section"><div className="container"><SectionHeader title="ჩვენი სერვისები" link="/services" label="ყველა სერვისი"/><div className="service-grid">{d.services.map(s=><ServiceCard key={s.id} service={s}/>)}</div></div></section>
  <LocationSection settings={d.settings} title="კონტაქტი"/>
 </Shell>;
}
