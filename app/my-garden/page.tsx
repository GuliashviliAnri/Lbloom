import {catalog} from '@/lib/catalog';
import {Shell} from '@/components/site';
import GardenList from '@/components/garden-list';
import type {GardenProduct} from '@/lib/garden-list';
export const dynamic='force-dynamic';
export const metadata={title:'ჩემი ეზოს სია',description:'შეაგროვე საყვარელი მცენარეები და ეზოს ავეჯი, მიუთითე რაოდენობა და გამოგვიგზავნე შენი სია.'};
export default async function Page(){const [plants,furniture]=await Promise.all([catalog('plants'),catalog('furniture')]);const products:GardenProduct[]=[...plants.products.map(item=>({item,kind:'plant' as const})),...furniture.furniture.map(item=>({item,kind:'furniture' as const}))];return <Shell settings={plants.settings}><GardenList products={products} settings={plants.settings}/></Shell>}
