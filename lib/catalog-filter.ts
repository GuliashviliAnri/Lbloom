import type {Item, Category} from './types';
import {categoryGroup,resolvePlantGroup} from './plant-groups';
import {furnitureCategory,resolveFurnitureCategory} from './furniture-categories';
export type PlantFilters = {category:string; search:string};
export function filterPlants(items:Item[], categories:Category[], filters:PlantFilters) {
 const group=resolvePlantGroup(filters.category,categories);
 const direct=categories.find(c=>c.kind!=='furniture'&&c.slug===group&&categoryGroup(c)==='other'&&c.slug!=='other');
 const groups=new Map(categories.map(c=>[c.id,categoryGroup(c)]));
 const search=filters.search.trim().normalize('NFKC').toLocaleLowerCase('ka-GE');
 return items.filter(item=>(group==='all'||(direct?item.category_id===direct.id:(groups.get(item.category_id??'')??'other')===group))&&(!search||item.name.normalize('NFKC').toLocaleLowerCase('ka-GE').includes(search)));
}

export function filterFurniture(items:Item[], filters:PlantFilters,categories:Category[]=[]) {
 const category=resolveFurnitureCategory(filters.category,categories);
 const search=filters.search.trim().normalize('NFKC').toLocaleLowerCase('ka-GE');
 return items.filter(item=>(category==='all'||furnitureCategory(item)===category)&&(!search||item.name.normalize('NFKC').toLocaleLowerCase('ka-GE').includes(search)));
}
