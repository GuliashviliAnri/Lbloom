import type {Item} from './types';
export function relatedProducts(item:Item,items:Item[],limit=4):Item[]{
 const others=items.filter(candidate=>candidate.id!==item.id&&candidate.slug!==item.slug);
 const sameCategory=(candidate:Item)=>Boolean(item.category_id&&candidate.category_id===item.category_id||item.category_slug&&candidate.category_slug===item.category_slug);
 return [...others.filter(sameCategory),...others.filter(candidate=>!sameCategory(candidate))].slice(0,limit);
}
