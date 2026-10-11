import {cache} from 'react';
import {notFound} from 'next/navigation';
import {catalog} from '@/lib/catalog';
import {ProductDetail} from '@/components/site';
import StructuredData from '@/components/structured-data';
import {relatedProducts} from '@/lib/related-products';
import {productMetadata,productData,breadcrumbData} from '@/lib/seo';
export const dynamic='force-dynamic';
const load=cache(async(slug:string)=>{const [d,list]=await Promise.all([catalog('furniture',slug),catalog('furniture')]);const item=d.furniture.find(p=>p.slug===slug);if(!item)notFound();return {d,list,item};});
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const {item}=await load(slug);return productMetadata(item,true);}
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const {d,list,item}=await load(slug);
 return <>{d.connected&&<StructuredData data={[productData(item,true),breadcrumbData([{name:'მთავარი',path:'/'},{name:'ეზოს ავეჯი',path:'/furniture'},{name:item.name,path:'/furniture/'+encodeURIComponent(item.slug)}])]}/>}<ProductDetail item={item} settings={d.settings} related={relatedProducts(item,list.furniture)} furniture={true}/></>;
}
