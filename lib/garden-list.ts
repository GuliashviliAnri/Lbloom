import type {Item} from './types';
import {hasDiscount} from './pricing';
export type GardenKind='plant'|'furniture';
export type GardenEntry={id:string;kind:GardenKind;quantity:number};
export type GardenProduct={item:Item;kind:GardenKind};
export const gardenStorageKey='lbloom-garden-list:v1';
export function gardenKey(entry:{id:string;kind:GardenKind}){return entry.kind+':'+entry.id}
export function parseGardenList(raw:string|null):GardenEntry[]{
 try{const data=JSON.parse(raw||'[]');if(!Array.isArray(data))return [];const seen=new Set<string>();return data.slice(0,100).flatMap(row=>{if(!row||typeof row.id!=='string'||!row.id||!['plant','furniture'].includes(row.kind)||!Number.isInteger(row.quantity)||row.quantity<1||row.quantity>999)return [];const key=gardenKey(row);if(seen.has(key))return [];seen.add(key);return [{id:row.id,kind:row.kind,quantity:row.quantity}]})}catch{return []}
}
export function gardenPrice(item:Item){if(typeof item.price!=='number'||!Number.isFinite(item.price)||item.price<0)return null;return hasDiscount(item.price,item.sale_price)?item.sale_price!:item.price}
export function gardenTotal(entries:GardenEntry[],products:GardenProduct[]){
 let total=0,unknown=0,quantity=0;
 for(const entry of entries){quantity+=entry.quantity;const product=products.find(p=>p.item.id===entry.id&&p.kind===entry.kind);const price=product?gardenPrice(product.item):null;if(price===null)unknown+=entry.quantity;else total+=price*entry.quantity}
 return {total:Math.round(total*100)/100,unknown,quantity};
}
export function gardenMessage(entries:GardenEntry[],products:GardenProduct[],title:string,note:string,origin:string){
 const totals=gardenTotal(entries,products);const money=(n:number)=>n.toLocaleString('ka-GE',{maximumFractionDigits:2})+' ₾';
 const lines=entries.map((entry,i)=>{const product=products.find(p=>p.item.id===entry.id&&p.kind===entry.kind);if(!product)return `${i+1}. პროდუქტი აღარ არის კატალოგში — ${entry.quantity} ც.`;const {item,kind}=product;const price=gardenPrice(item);return `${i+1}. ${item.name} — ${entry.quantity} ც.\n${price===null?'ფასი დასაზუსტებელია':money(price)+' × '+entry.quantity+' = '+money(price*entry.quantity)}\n${origin}/${kind==='plant'?'plants':'furniture'}/${encodeURIComponent(item.slug)}`});
 return ['გამარჯობა, მაინტერესებს ჩემი ეზოს სიის პროდუქტები.',title.trim()?'სია: '+title.trim():'',...lines,`${totals.unknown?'ცნობილი ფასების ჯამი':'სავარაუდო ჯამი'}: ${money(totals.total)}`,totals.unknown?`${totals.unknown} ერთეულის ფასი დასაზუსტებელია.`:'',note.trim()?'შენიშვნა: '+note.trim():'','მიწოდება მხოლოდ თბილისში და მის შემოგარენშია, Yandex ტაქსით. ტაქსის საფასურს მომხმარებელი იხდის ცალკე.', 'გთხოვთ დამიზუსტოთ ხელმისაწვდომობა და საბოლოო ფასი.'].filter(Boolean).join('\n\n');
}
export function gardenWhatsApp(base:string,message:string){try{const url=new URL(base);if(url.protocol!=='https:'||!['wa.me','api.whatsapp.com','web.whatsapp.com','www.whatsapp.com','whatsapp.com'].includes(url.hostname))return null;url.searchParams.set('text',message);return url.href}catch{return null}}
