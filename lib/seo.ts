import type {Metadata} from 'next';
import type {Item,Service,Settings,GardenStory} from './types';
import {publicSiteOrigin} from './story-sharing';
import {hasDiscount} from './pricing';
export const siteName='LBLOOM საბაღე ცენტრი';
export function siteUrl(path='/'){
 let base='https://lbloom.ge';
 try{const candidate=new URL(publicSiteOrigin);if(['https:','http:'].includes(candidate.protocol))base=candidate.origin;}catch{}
 return new URL(path,base).href;
}
export const siteDescription='LBLOOM — საბაღე ცენტრი თბილისში. მცენარეები, ეზოს ავეჯი და რჩევები თქვენი ეზოსთვის. ნახეთ პროდუქცია, ფასები და დაგვიკავშირდით.';
export function summary(value:string,fallback=siteDescription){return value.replace(/\s+/g,' ').trim().slice(0,180)||fallback;}
export function safeImage(value:string){if(!value.trim())return undefined;try{const url=new URL(value,siteUrl());return ['https:','http:'].includes(url.protocol)?url.href:undefined;}catch{return undefined;}}
export function pageMetadata(title:string,description:string,path:string,image='/logo-mark.webp'):Metadata{
 const url=siteUrl(path);const cover=safeImage(image);const fullTitle=title.includes('LBLOOM')?title:title+' | LBLOOM';
 return {title:title.includes('LBLOOM')?{absolute:title}:title,description,alternates:{canonical:url},openGraph:{type:'website',title:fullTitle,description,url,siteName,locale:'ka_GE',images:cover?[{url:cover,alt:title}]:[]},twitter:{card:'summary_large_image',title:fullTitle,description,images:cover?[cover]:[]}};
}
export function productMetadata(item:Item,furniture=false){return pageMetadata(item.name,summary(item.description,item.name+' — '+(furniture?'ეზოს ავეჯი':'მცენარე')+' LBLOOM-ის საბაღე ცენტრში. ნახეთ ფასი და პროდუქტის დეტალები.'),(furniture?'/furniture/':'/plants/')+encodeURIComponent(item.slug),item.image_url);}
export function serviceMetadata(service:Service){return pageMetadata(service.title,summary(service.description),'/services/'+encodeURIComponent(service.slug),service.image_url);}
export function breadcrumbData(entries:{name:string;path:string}[]){return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:entries.map((entry,index)=>({'@type':'ListItem',position:index+1,name:entry.name,item:siteUrl(entry.path)}))};}
export function businessData(settings:Settings){
 const phone=settings.phone.replace(/[^\d+]/g,'');
 const sameAs=[settings.facebook_url,settings.instagram_url].filter(value=>/^https?:\/\//.test(value));
 // Preserve the actual admin-entered address; never fabricate a street or postcode.
 const address=settings.address&&!/დასაზუსტ|მალე|დაგვიკავშირდით/.test(settings.address)?{'@type':'PostalAddress',streetAddress:settings.address,addressCountry:'GE'}:undefined;
 return {'@context':'https://schema.org','@type':'GardenStore','@id':siteUrl('/#business'),name:siteName,alternateName:['LBLOOM','ელბლუმი','ლბლუმი'],url:siteUrl(),logo:siteUrl('/logo-mark.webp'),image:siteUrl('/logo-mark.webp'),description:siteDescription,telephone:phone.startsWith('+')?phone:phone.startsWith('995')?'+'+phone:'+995'+phone,address,sameAs:sameAs.length?sameAs:undefined,hasMap:settings.google_maps_url||undefined};
}
export function websiteData(){return {'@context':'https://schema.org','@type':'WebSite','@id':siteUrl('/#website'),name:siteName,alternateName:'LBLOOM',url:siteUrl(),inLanguage:'ka-GE',publisher:{'@id':siteUrl('/#business')}};}
export function productData(item:Item,furniture=false){
 const url=siteUrl((furniture?'/furniture/':'/plants/')+encodeURIComponent(item.slug));
 const price=hasDiscount(item.price,item.sale_price)?item.sale_price:item.price;
 const images=[item.image_url,...item.gallery_images].filter(Boolean).map(safeImage).filter(Boolean);
 return {'@context':'https://schema.org','@type':'Product',name:item.name,description:summary(item.description),image:images.length?images:undefined,url,sku:item.id,
  // A request-only product has no invented price or availability promise.
  offers:typeof price==='number'&&Number.isFinite(price)&&price>=0?{'@type':'Offer',url,price:String(price),priceCurrency:'GEL',availability:item.is_in_stock?'https://schema.org/InStock':undefined,seller:{'@id':siteUrl('/#business'),name:siteName}}:undefined};
}
export function articleData(story:GardenStory){
 const date=(value?:string)=>value&&Number.isFinite(Date.parse(value))?new Date(value).toISOString():undefined;
 return {'@context':'https://schema.org','@type':'Article',headline:story.title,description:summary(story.excerpt||story.body),image:safeImage(story.image_url),datePublished:date(story.created_at),dateModified:date(story.updated_at),inLanguage:'ka-GE',mainEntityOfPage:siteUrl('/garden-stories/'+encodeURIComponent(story.slug)),publisher:{'@type':'Organization',name:siteName,url:siteUrl(),logo:{'@type':'ImageObject',url:siteUrl('/logo-mark.webp')}}};
}
export function serializeJsonLd(data:unknown){return JSON.stringify(data).replace(/</g,'\\u003c');}
