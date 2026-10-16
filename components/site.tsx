"use client";
import {GardenListLink,GardenAddButton} from './garden-list';
import TopGeCounter from '@/components/top-ge-counter';
import VideoCover from './video-cover';
import {facebookVideoUrl} from '@/lib/video-source';
import VideoPlayer from './video-player';
import useVideoPreparation from './use-video-preparation';
import HomeProducts from './home-products';
import usePageSwipe from './use-page-swipe';
import useSmoothPage from './use-smooth-page';
import useCardPageSize from './use-card-page-size';
import AdvertisementBanner from './advertisement-banner';
import {defaultAdvertisement,type Advertisement} from '@/lib/advertisement';
import ResponsiveImage from './responsive-image';
import DirectionIcon from './direction-icon';
import {WhatsAppIcon,MessengerIcon} from './contact-icons';
import StoryDate from './story-date';
import {latestVideo} from '@/lib/video-order';
import ProductGallery from './product-gallery';
import Price from './price';
import {hasDiscount} from '@/lib/pricing';
import SocialLinks from './social-links';
import {heightInCentimeters} from '@/lib/measurements';
import {usePathname} from 'next/navigation';import {useState,useRef,useEffect,useId} from 'react';import {Menu,X,Phone,Clock,Play,MapPin,Flame} from 'lucide-react';import type {Item,Service,Video,Settings,GardenStory} from '@/lib/types';
const nav=[['მთავარი','/'],['საბაღე ამბები','/garden-stories'],['მცენარეები','/plants'],['ეზოს ავეჯი','/furniture'],['სერვისები','/services'],['კონტაქტი','/contact']];
export function Button({href,children,secondary=false}:{href:string;children:React.ReactNode;secondary?:boolean}){return <a className={'button '+(secondary?'secondary':'')} href={href}>{children}</a>}
export function Header({settings:s}:{settings:Settings}){
 const [open,setOpen]=useState(false);
 const pathname=usePathname();
 const menuId=useId();
 const menuButton=useRef<HTMLButtonElement>(null);
 const isActive=(href:string)=>pathname===href||(href!=='/'&&pathname.startsWith(href+'/'));
 return <header onKeyDown={event=>{if(event.key==='Escape'&&open){setOpen(false);menuButton.current?.focus()}}}>
  <div className="container header">
   <a href="/" className="brand"><img src="/logo-mark.webp" alt="LBLOOM ლოგო"/><span><b>LBLOOM</b><small>საბაღე ცენტრი</small></span></a>
   <nav aria-label="მთავარი ნავიგაცია">{nav.map(([name,href])=><a href={href} key={href} aria-current={isActive(href)?'page':undefined}>{name}</a>)}</nav>
   <GardenListLink/><div className="header-contact"><a href={'tel:'+s.phone.replaceAll(' ','')}><Phone size={16}/>{s.phone}</a><small><Clock size={13}/>{s.working_hours}</small></div>
   <button type="button" ref={menuButton} className={'menu-button'+(open?' is-open':'')} onClick={()=>setOpen(!open)} aria-label={open?'მენიუს დახურვა':'მენიუს გახსნა'} aria-expanded={open} aria-controls={menuId}>{open?<X size={21}/>:<Menu size={21}/>}</button>
  </div>
  <div className={'mobile-nav-wrap'+(open?' is-open':'')} aria-hidden={!open} inert={!open}>
   <nav id={menuId} className="mobile-nav" aria-label="მობილური ნავიგაცია">
    <div className="mobile-nav-links">{nav.map(([name,href])=><a href={href} onClick={()=>setOpen(false)} key={href} aria-current={isActive(href)?'page':undefined}><span>{name}</span><DirectionIcon size={17}/></a>)}</div>
    <a className="mobile-nav-call" href={'tel:'+s.phone.replaceAll(' ','')} onClick={()=>setOpen(false)}><Phone size={18}/><span>დაგვირეკეთ<strong>{s.phone}</strong></span></a>
    <small className="mobile-nav-hours"><Clock size={14}/>{s.working_hours}</small>
   </nav>
  </div>
 </header>;
}
export function Footer({settings:s}:{settings:Settings}){return <footer><div className="container footer-grid">
 <div className="footer-brand-column"><a href="/" className="brand"><img src="/logo-mark.webp" alt="LBLOOM ლოგო"/><span><b>LBLOOM</b><small>საბაღე ცენტრი</small></span></a><p className="footer-extra">მცენარეები და ეზოს ავეჯი თქვენი სივრცისთვის</p></div>
 <div className="footer-links-column"><h3 className="footer-extra">აღმოაჩინეთ</h3><div className="footer-nav">{nav.map(([name,href])=><a href={href} key={href}>{name}</a>)}</div></div>
 <div className="footer-contact-column"><h3 className="footer-extra">დაგვიკავშირდით</h3><div className="footer-social"><SocialLinks settings={s} compact/><a href={'tel:'+s.phone.replaceAll(' ','')}>{s.phone}</a></div><p className="footer-extra footer-address">{s.address}</p><p className="footer-extra footer-hours">{s.working_hours}</p></div>
 </div><div className="container copyright">© {new Date().getFullYear()} LBLOOM საბაღე ცენტრი. ყველა უფლება დაცულია.<TopGeCounter/></div></footer>}

export function FloatingContactButtons({settings:s}:{settings:Settings}){return <div className="floating">{s.whatsapp_url&&<a href={s.whatsapp_url} target="_blank" rel="noreferrer" className="whatsapp-contact" aria-label="WhatsApp" title="WhatsApp"><WhatsAppIcon/></a>}{s.messenger_url&&<a href={s.messenger_url} target="_blank" rel="noreferrer" className="messenger-contact" aria-label="Messenger" title="Messenger"><MessengerIcon/></a>}</div>}
export function Shell({settings,children}:{settings:Settings;children:React.ReactNode}){return <div className="site-shell"><Header settings={settings}/><main id="main">{children}</main><Footer settings={settings}/><FloatingContactButtons settings={settings}/></div>}
export function SectionHeader({title,link,label}:{title:string;link?:string;label?:string}){return <div className="section-heading"><h2>{title}</h2><span className="section-rule" aria-hidden="true"/>{link&&<a href={link}>{label??'ყველას ნახვა'}<DirectionIcon size={18}/></a>}</div>}
export function ProductCard({item,furniture=false}:{item:Item;furniture?:boolean}){return <div className="garden-product-shell"><a className={'product-card '+(furniture?'furniture-card':'plant-card')} href={(furniture?'/furniture/':'/plants/')+item.slug}><div className="product-image"><ResponsiveImage src={item.image_url} alt={item.name} loading="lazy"/>{hasDiscount(item.price,item.sale_price)&&<span className="discount-badge"><span className="discount-badge-label"><Flame size={16} fill="currentColor" aria-hidden="true"/>ფასდაკლება</span>{Math.floor((item.price!-item.sale_price!)/item.price!*100)>=1&&<strong className="discount-badge-percent">−{Math.floor((item.price!-item.sale_price!)/item.price!*100)}%</strong>}</span>}</div><div className="product-body"><h3>{item.name}</h3>{furniture?<p>{item.dimensions_or_set_details}</p>:<><p className="product-description">{item.description.split(/(?<=[.!?])\s+/)[0]}</p><p className="product-height"><span>სიმაღლე:</span> {heightInCentimeters(item.height??'')}</p></>}<div className="product-bottom"><Price price={item.price} salePrice={item.sale_price}/><span className="view">ნახვა <DirectionIcon/></span></div></div></a><GardenAddButton item={item} furniture={furniture} compact/></div>}
export function FurnitureCard({item}:{item:Item}){return <ProductCard item={item} furniture/>}
export function ServiceCard({service:s}:{service:Service}){return <a href={'/services/'+s.slug} className="service-card"><ResponsiveImage src={s.image_url} alt={s.title} loading="lazy"/><div><h3>{s.title}</h3><p>{s.description}</p><span className="service-view">ნახვა <DirectionIcon/></span></div></a>}
export function GardenStoryCard({story:s}:{story:GardenStory}){return <a href={'/garden-stories/'+s.slug} className="story-card"><ResponsiveImage src={s.image_url} alt={s.title} loading="lazy"/><div><span className="story-label">საბაღე რჩევები</span><StoryDate value={s.created_at}/><h3>{s.title}</h3><p>{s.excerpt}</p><span className="text-link">წაიკითხე</span></div></a>}
export function VideoCard({video,onClick,isNew=false}:{video:Video;onClick:()=>void;isNew?:boolean}){const preparation=useVideoPreparation(video.video_url);return <button {...preparation} className="video-card" onClick={onClick}><div>{video.thumbnail_url||facebookVideoUrl(video.video_url)?<VideoCover id={video.id} url={video.video_url} image={video.thumbnail_url} title={video.title}/>:<video className="video-opening-preview" src={video.video_url+'#t=0.01'} muted playsInline preload="metadata" aria-hidden="true"/>}{isNew&&<span className="new-badge">სიახლე</span>}<span className="play"><Play fill="currentColor" size={20}/></span></div><div className="video-caption"><h3>{video.title}</h3><span className="video-duration">{video.duration}</span></div></button>}
export function Videos({videos,featured=false,advertisement=defaultAdvertisement}:{videos:Video[];featured?:boolean;advertisement?:Advertisement|null}) {
 const [active,setActive]=useState<Video|null>(null);
 const {page,previousPage,move:setPage,motion}=useSmoothPage();
 const gridId=useId();
 const responsiveSize=useCardPageSize();
 const dialog=useRef<HTMLDialogElement>(null);
 const trigger=useRef<HTMLElement|null>(null);
 const titleId=useId();
 useEffect(()=>{
  const player=dialog.current;
  if(active){player?.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;player?.close()}}
  player?.close();
 },[active]);
 function close(){dialog.current?.close();setActive(null);trigger.current?.focus()}
 function open(video:Video){trigger.current=document.activeElement as HTMLElement;setActive(video)}
 const first=latestVideo(videos);
 const ordered=videos;
 const pageSize=responsiveSize||Math.max(ordered.length,1);
 const pages=Math.ceil(ordered.length/pageSize);
 const current=Math.min(Math.floor(page/pageSize),Math.max(0,pages-1));
 const paged=featured&&pages>1;
 const visible=featured?ordered.slice(current*pageSize,(current+1)*pageSize):ordered;
 const swipe=usePageSwipe(step=>{if(featured)setPage(Math.max(0,Math.min(pages-1,current+step))*pageSize);});
 return <>
  <div className={featured?"video-and-ad":undefined} data-count={Math.min(visible.length,4)}>
  {visible.length>0&&<div className={featured?"product-pager-frame video-pager"+(paged?" has-pages":""):""} role={featured?'region':undefined} aria-label={featured?'ვიდეოები':undefined}>
   {paged&&<button type="button" className="product-page-arrow" aria-label="ვიდეოები — წინა გვერდი" aria-controls={gridId} disabled={current===0} onClick={()=>setPage((current-1)*pageSize)}><DirectionIcon direction="left" size={23}/></button>}
   <div className={"catalog-slide-window "+motion}>
   {featured&&previousPage!==null&&responsiveSize>0&&<div className="videos video-overview video-paged-grid catalog-slide-out" aria-hidden="true" inert>{ordered.slice(Math.floor(previousPage/pageSize)*pageSize,(Math.floor(previousPage/pageSize)+1)*pageSize).map(v=><VideoCard key={v.id} video={v} isNew={v.id===first?.id} onClick={()=>{}}/>)}</div>}
   <div {...(featured&&responsiveSize?swipe:{})} id={gridId} key={pageSize+':'+current} className={"videos"+(featured?" video-overview"+(motion?" catalog-slide-in":""):"")+(featured?" video-paged-grid":"")} data-count={Math.min(visible.length,4)}>{visible.map(v=><VideoCard key={v.id} video={v} isNew={v.id===first?.id} onClick={()=>open(v)}/>)}</div>
   </div>
   {paged&&<button type="button" className="product-page-arrow" aria-label="ვიდეოები — შემდეგი გვერდი" aria-controls={gridId} disabled={current===pages-1} onClick={()=>setPage((current+1)*pageSize)}><DirectionIcon size={23}/></button>}
  </div>}
  {videos.length===0&&<div className="empty">ვიდეოები მალე დაემატება.</div>}
  {featured&&<AdvertisementBanner advertisement={advertisement}/>}
  </div>
  <dialog className="video-dialog" ref={dialog} aria-labelledby={titleId} onCancel={e=>{e.preventDefault();close()}} onClick={e=>{if(e.target===dialog.current)close()}}>
   {active&&<><div className="video-dialog-header"><div className="video-dialog-heading"><span className="video-dialog-brand">LBLOOM · ვიდეო</span><h3 id={titleId}>{active.title}</h3></div><button type="button" className="dialog-close" aria-label="ვიდეოს დახურვა" onClick={close}><X size={20}/></button></div><VideoPlayer key={active.id} video={active}/></>}
  </dialog>
 </>;
}
export function LocationSection({settings:s,title="ლოკაცია"}:{settings:Settings;title?:string}){
 return <section className="location-section" id="location"><div className="container"><SectionHeader title={title}/>
  <div className="location-grid">
   <div className="location-copy"><span className="location-kicker">გვეწვიეთ ან მოგვწერეთ</span><h3 className="location-brand">LBLOOM საბაღე ცენტრი</h3>
    <div className="location-info">
     <p className="contact-row"><span className="contact-icon"><MapPin/></span><span><small>მისამართი</small><strong>{s.address}</strong></span></p>
     <a className="contact-row" href={'tel:'+s.phone.replaceAll(' ','')}><span className="contact-icon"><Phone/></span><span><small>დაგვირეკეთ</small><strong>{s.phone}</strong></span></a>
     <p className="contact-row"><span className="contact-icon"><Clock/></span><span><small>სამუშაო საათები</small><strong>{s.working_hours}</strong></span></p>
    </div>
    <SocialLinks settings={s}/><div className="location-messaging">
     {s.whatsapp_url&&<a className="social-whatsapp" href={s.whatsapp_url} target="_blank" rel="noopener noreferrer"><WhatsAppIcon/><span>WhatsApp</span></a>}
     {s.messenger_url&&<a className="social-messenger" href={s.messenger_url} target="_blank" rel="noopener noreferrer"><MessengerIcon/><span>Messenger</span></a>}
    </div>
   </div>
   <div className="location-map-panel"><div className="map">
    {s.google_maps_embed_url?<iframe title="LBLOOM ლოკაცია Google Maps-ზე" src={s.google_maps_embed_url} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/>:<div className="map-empty"><MapPin size={36}/><h3>გვეწვიეთ საბაღე ცენტრში</h3><p>ზუსტი მისამართი დააზუსტეთ ტელეფონით.</p><a href={'tel:'+s.phone.replaceAll(' ','')}>{s.phone}</a></div>}
   </div>{s.google_maps_url?<a className="button location-route" href={s.google_maps_url} target="_blank" rel="noopener noreferrer"><MapPin size={18}/>მარშრუტის გახსნა<DirectionIcon/></a>:<p className="muted">ზუსტი ლოკაცია მალე დაემატება.</p>}</div>
  </div>
 </div></section>;
}
export function Gallery({item}:{item:Item}){return <ProductGallery item={item}/>;}
export function ProductDetail({item,settings:s,furniture=false,related=[]}:{item:Item;settings:Settings;furniture?:boolean;related?:Item[]}){const wa=s.whatsapp_url+'?text='+encodeURIComponent('გამარჯობა, მაინტერესებს '+item.name+'.');return <Shell settings={s}><div className="container detail product-detail"><div className="breadcrumbs"><a href="/">მთავარი</a><span>/</span><a href={furniture?'/furniture':'/plants'}>{furniture?'ეზოს ავეჯი':'მცენარეები'}</a><span>/</span>{item.name}</div><div className="detail-grid"><Gallery item={item}/><div className="detail-copy"><span className="eyebrow">{furniture?'ეზოს ავეჯი':'მცენარეები'}</span><h1>{item.name}</h1><div className="detail-price"><Price price={item.price} salePrice={item.sale_price}/>{hasDiscount(item.price,item.sale_price)&&<span className="detail-sale-label"><Flame size={15} aria-hidden="true"/>ფასდაკლება</span>}</div><dl className="product-specs"><div><dt>{furniture?'კომპლექტაცია / ზომა':'სიმაღლე'}</dt><dd>{furniture?item.dimensions_or_set_details:heightInCentimeters(item.height??'')}</dd></div><div><dt>მარაგის სტატუსი</dt><dd className="detail-stock">{item.is_in_stock?'მარაგშია':'ხელმისაწვდომობა დააზუსტეთ'}</dd></div></dl><div className="detail-description"><h2>პროდუქტის შესახებ</h2><p>{item.description}</p></div><div className="detail-inquiry"><GardenAddButton item={item} furniture={furniture}/><span>დაგვიკავშირდით პროდუქტის შესაკვეთად</span><div className="contact-actions">{s.whatsapp_url&&<Button href={wa}><WhatsAppIcon/>WhatsApp</Button>}{s.messenger_url&&<Button href={s.messenger_url} secondary><MessengerIcon/>Messenger</Button>}</div></div></div></div>{related.length>0&&<section className="related-products" aria-label="მსგავსი პროდუქტები"><SectionHeader title="მსგავსი პროდუქტები"/><HomeProducts items={related} furniture={furniture}/></section>}</div></Shell>}
