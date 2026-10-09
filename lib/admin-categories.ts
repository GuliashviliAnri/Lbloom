import {plantGroups,categoryGroup} from './plant-groups';
export type AdminCategory={id:string;name:string;slug:string;kind?:string;group_slug?:string};
export const defaultPlantFilters=plantGroups.filter(g=>['conifers','trees-shrubs'].includes(g.slug));
export function plantCategoryChoices(categories:AdminCategory[]):AdminCategory[]{
 const plants=categories.filter(c=>c.kind!=='furniture');
 const defaults=defaultPlantFilters.map(g=>{
  const saved=plants.find(c=>c.slug===g.slug);
  return {...g,id:saved?.id??'preset:'+g.slug,kind:'plant',group_slug:g.slug};
 });
 const custom=plants.filter(c=>c.slug!=='other'&&categoryGroup({id:c.id,name:c.name,slug:c.slug,group_slug:c.group_slug,sort_order:0})==='other');
 return [...defaults,...custom];
}
export function selectedPlantCategory(value:string,categories:AdminCategory[]):string {
 const choices=plantCategoryChoices(categories);
 if(choices.some(c=>c.id===value))return value;
 const current=categories.find(c=>c.id===value);
 if(!current)return '';
 const group=categoryGroup({id:current.id,name:current.name,slug:current.slug,group_slug:current.group_slug,sort_order:0});
 return choices.find(c=>c.slug===group)?.id??'';
}
