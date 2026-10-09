import type {Category, Item} from './types';
export const plantGroups = [
 {slug:'conifers',name:'წიწვოვანი მცენარეები'},
 {slug:'trees-shrubs',name:'ფოთლოვანი ხეები და ბუჩქები'},
 {slug:'flowering',name:'ყვავილოვანი მცენარეები'},
 {slug:'fruit',name:'ხეხილი'},
 {slug:'grasses',name:'დეკორატიული ბალახები'},
];
const visiblePlantGroups=plantGroups.filter(g=>!['flowering','fruit','grasses'].includes(g.slug));
const legacyGroups:Record<string,string>={tuia:'conifers',smaragdi:'conifers',kiparosi:'conifers',zetiskhili:'fruit',oleandra:'flowering',evonimusi:'trees-shrubs',tsyavi:'trees-shrubs'};
export function categoryGroup(category?:Category):string {
 if(!category)return 'other';
 if(plantGroups.some(g=>g.slug===category.slug))return category.slug;
 if(category.group_slug&&[...plantGroups.map(g=>g.slug),'other'].includes(category.group_slug))return category.group_slug;
 return plantGroups.some(g=>g.slug===category.slug)?category.slug:legacyGroups[category.slug]??'other';
}
export function resolvePlantGroup(value:string|null,categories:Category[]):string {
 if(value==='all'||!value)return 'all';
 if(value==='other'||visiblePlantGroups.some(g=>g.slug===value))return value;
 const legacy=categories.find(c=>c.slug===value);
 if(legacy&&legacy.kind!=='furniture'&&categoryGroup(legacy)==='other'&&legacy.slug!=='other')return legacy.slug;
 const group=legacy?categoryGroup(legacy):'all';
 return group==='other'||visiblePlantGroups.some(g=>g.slug===group)?group:'all';
}
export function plantFilterGroups(items:Item[],categories:Category[]) {
 const byId=new Map(categories.filter(c=>c.kind!=='furniture').map(c=>[c.id,categoryGroup(c)]));
 const groups=visiblePlantGroups.map(g=>({...g,count:items.filter(p=>byId.get(p.category_id??'')===g.slug).length}));
 const custom=categories.filter(c=>c.kind!=='furniture'&&categoryGroup(c)==='other'&&c.slug!=='other').map(c=>({slug:c.slug,name:c.name,count:items.filter(p=>p.category_id===c.id).length}));
 const customIds=new Set(categories.filter(c=>custom.some(g=>g.slug===c.slug)).map(c=>c.id));
 const otherCount=items.filter(p=>(byId.get(p.category_id??'')??'other')==='other'&&!customIds.has(p.category_id??'')).length;
 return [...groups,...custom,...(otherCount?[{slug:'other',name:'სხვა მცენარეები',count:otherCount}]:[])];
}
