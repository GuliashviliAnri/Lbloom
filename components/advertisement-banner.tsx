/* eslint-disable @next/next/no-img-element -- Uploaded advertising artwork is shown in full. */
import {advertisementLink,type Advertisement} from '@/lib/advertisement';
export default function AdvertisementBanner({advertisement}:{advertisement:Advertisement|null}){
 if(!advertisement?.is_active)return null;
 const title=advertisement.title.trim()||'რეკლამა';
 const content=advertisement.image_url?<img src={advertisement.image_url} alt={title} loading="lazy"/>:<span>{title}</span>;
 const href=advertisementLink(advertisement.link_url);
 return <aside className={'advertisement-slot'+(advertisement.image_url?' advertisement-artwork':'')} aria-label="სარეკლამო სივრცე">{href?<a href={href} target="_blank" rel="noopener noreferrer" aria-label={title}>{content}</a>:content}</aside>;
}
