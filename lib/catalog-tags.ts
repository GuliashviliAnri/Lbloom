// Cache tags shared by the public catalog reads and the admin revalidation endpoint.
export const CATALOG_REVALIDATE_SECONDS=86400;
export const catalogTags=['plants','furniture','services','stories','videos','settings','advertisement'] as const;
export type CatalogTag=typeof catalogTags[number];
export type Scope='all'|'home'|'plants'|'furniture'|'services'|'stories'|'videos'|'settings';
export type AdminTable='products'|'furniture'|'services'|'videos'|'garden_stories'|'site_settings'|'advertisements'|'categories';

const scopeSections:Record<Scope,readonly CatalogTag[]>={
 all:catalogTags,
 home:catalogTags,
 plants:['plants','settings'],
 furniture:['furniture','settings'],
 services:['services','settings'],
 stories:['stories','settings'],
 videos:['videos','settings'],
 settings:['settings']
};
const tableSections:Record<AdminTable,readonly CatalogTag[]>={
 products:['plants'],
 furniture:['furniture'],
 services:['services'],
 videos:['videos'],
 garden_stories:['stories'],
 site_settings:['settings'],
 advertisements:['advertisement'],
 // Categories feed both catalog filters.
 categories:['plants','furniture']
};

export const catalogTag=(section:CatalogTag)=>'catalog:'+section;
export const scopeTags=(scope:Scope)=>scopeSections[scope].map(catalogTag);
export const isAdminTable=(value:unknown):value is AdminTable=>typeof value==='string'&&Object.prototype.hasOwnProperty.call(tableSections,value);
export const tableTags=(table:AdminTable)=>tableSections[table].map(catalogTag);
