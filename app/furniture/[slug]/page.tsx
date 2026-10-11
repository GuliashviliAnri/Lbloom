import {relatedProducts} from '@/lib/related-products';
import {notFound} from 'next/navigation';import {catalog} from '@/lib/catalog';import {ProductDetail} from '@/components/site';export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const [d,list]=await Promise.all([catalog('furniture',slug),catalog('furniture')]);const item=d.furniture.find(p=>p.slug===slug);if(!item)notFound();return <ProductDetail item={item} settings={d.settings} related={relatedProducts(item,list.furniture)} furniture={true}/>}
