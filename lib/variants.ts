import type {Item,Variant} from './types';
import {hasDiscount} from './pricing';
/** Sizes saved in the admin; invalid rows are ignored so old data never breaks a page. */
export function itemVariants(item:Pick<Item,'variants'>):Variant[]{
 if(!Array.isArray(item.variants))return [];
 return item.variants.flatMap(v=>{
  if(!v||typeof v.size!=='string'||!v.size.trim())return [];
  const price=typeof v.price==='number'&&Number.isFinite(v.price)&&v.price>=0?v.price:null;
  const sale=price!==null&&hasDiscount(price,v.sale_price)?v.sale_price:null;
  return [{size:v.size.trim(),price,sale_price:sale}];
 });
}
export function findVariant(item:Pick<Item,'variants'>,size:string|undefined){return size?itemVariants(item).find(v=>v.size===size)??null:null}
export function variantPrice(v:Variant){return v.price===null?null:hasDiscount(v.price,v.sale_price)?v.sale_price:v.price}
/** Cheapest size; its prices are copied to the product so cards, sorting and SEO keep working. */
export function cheapestVariant(variants:Variant[]){return variants.reduce<Variant|null>((best,v)=>{const p=variantPrice(v);if(p===null)return best;const b=best?variantPrice(best):null;return b===null||p<b?v:best},null)}
