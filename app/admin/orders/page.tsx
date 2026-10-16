import {redirect} from 'next/navigation';
export const metadata={title:'შეკვეთები — LBLOOM',robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{id?:string}>}){const {id}=await searchParams;redirect('/admin?section=orders'+(typeof id==='string'?'&id='+encodeURIComponent(id):''))}
