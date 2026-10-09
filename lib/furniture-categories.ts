import type {Item,Category} from './types';
export const furnitureCategories = [
 {slug:'chairs',name:'სკამები'},
 {slug:'tables',name:'მაგიდები'},
 {slug:'swings',name:'საქანელები'},
 {slug:'bodzkinti',name:'ბოძკინტები'},
];
export function availableFurnitureCategories(categories:Category[]=[]) {
 const saved=categories.filter(c=>c.kind==='furniture');
 return saved.length?saved:furnitureCategories;
}
export function resolveFurnitureCategory(value:string|null,categories:Category[]=[]):string {
 return availableFurnitureCategories(categories).some(c=>c.slug===value)?value!:'all';
}
export function furnitureCategory(item:Pick<Item,'name'|'category_slug'>):string {
 if(item.category_slug)return item.category_slug;
 // Compatibility for furniture entered before category support was added.
 if(item.name.includes('სკამ'))return 'chairs';
 if(item.name.includes('მაგიდ'))return 'tables';
 if(item.name.includes('საქანელ'))return 'swings';
 if(item.name.includes('ბოძკინტ'))return 'bodzkinti';
 return '';
}
export function furnitureFilterCategories(items:Item[],categories:Category[]=[]) {
 return availableFurnitureCategories(categories).map(c=>({...c,count:items.filter(item=>furnitureCategory(item)===c.slug).length}));
}
