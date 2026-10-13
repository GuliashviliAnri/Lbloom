import {cache} from 'react';
import StructuredData from '@/components/structured-data';
import {serviceMetadata,breadcrumbData} from '@/lib/seo';
/* eslint-disable @next/next/no-html-link-for-pages -- Native links preserve navigation in the Sites runtime. */
import {WhatsAppIcon,MessengerIcon} from '@/components/contact-icons';
import ResponsiveImage from '@/components/responsive-image';
import {notFound} from 'next/navigation';
import {catalog} from '@/lib/catalog';
import {Shell,Button,ServiceCard,SectionHeader} from '@/components/site';
export const dynamic='force-dynamic';
const load=cache(async(slug:string)=>{const d=await catalog('services');const s=d.services.find(v=>v.slug===slug);if(!s)notFound();return {d,s};});
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const {s}=await load(slug);return serviceMetadata(s)}
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const {d,s}=await load(slug);
 const related=d.services.filter(v=>v.id!==s.id);
 return <Shell settings={d.settings}><StructuredData data={breadcrumbData([{name:'მთავარი',path:'/'},{name:'ჩვენი სერვისები',path:'/services'},{name:s.title,path:'/services/'+encodeURIComponent(s.slug)}])}/><section className="container section service-detail">
  <nav className="breadcrumbs" aria-label="გვერდის მდებარეობა"><a href="/">მთავარი</a><span>/</span><a href="/services">ჩვენი სერვისები</a><span>/</span><span>{s.title}</span></nav>
  <div className="service-detail-layout">
   <ResponsiveImage className="service-detail-image" src={s.image_url} alt={s.title} sizes="(max-width:767px) 100vw,40vw" fetchPriority="high"/>
   <div className="service-detail-copy">
    <div className="service-detail-heading"><span className="eyebrow">ჩვენი სერვისები</span><h1>{s.title}</h1></div>
    <div className="service-description">{s.description.split(/\n\s*\n/).filter(Boolean).map((text,i)=><p key={i}>{text}</p>)}</div>
    <div className="detail-inquiry"><span>დაგვიკავშირდით სერვისის დეტალების შესათანხმებლად</span><div className="contact-actions">{d.settings.whatsapp_url&&<Button href={d.settings.whatsapp_url+'?text='+encodeURIComponent('გამარჯობა, მაინტერესებს '+s.title+'.')}><span className="service-contact-icon"><WhatsAppIcon/></span>WhatsApp</Button>}{d.settings.messenger_url&&<Button href={d.settings.messenger_url} secondary><span className="service-contact-icon"><MessengerIcon/></span>Messenger</Button>}</div></div>
   </div>
  </div>
  {related.length>0&&<div className="service-related"><SectionHeader title="სხვა სერვისები"/><div className="service-grid">{related.map(service=><ServiceCard key={service.id} service={service}/>)}</div></div>}
 </section></Shell>;
}
