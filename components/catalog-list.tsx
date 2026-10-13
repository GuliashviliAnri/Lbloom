"use client";
import {useEffect,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Search,X} from 'lucide-react';
import type {Item,Category} from '@/lib/types';
import {filterPlants,filterFurniture} from '@/lib/catalog-filter';
import {plantFilterGroups,resolvePlantGroup} from '@/lib/plant-groups';
import {furnitureFilterCategories,resolveFurnitureCategory} from '@/lib/furniture-categories';
import {ProductCard,FurnitureCard} from './site';
export default function CatalogList({items,categories=[],furniture=false}:{items:Item[];categories?:Category[];furniture?:boolean}) {
 const query=useSearchParams();
 const initial=query.get('category');
 const [category,setCategory]=useState(furniture?resolveFurnitureCategory(initial,categories):resolvePlantGroup(initial,categories));
 const [search,setSearch]=useState(query.get('q')??'');
 useEffect(()=>{
  const url=new URL(window.location.href);
  const values={category:category==='all'?'':category,q:search.trim()};
  url.searchParams.delete('sort');
  url.searchParams.delete('stock');
  for(const [key,value] of Object.entries(values)){if(value)url.searchParams.set(key,value);else url.searchParams.delete(key)}
  if(url.toString()!==window.location.href)window.history.replaceState(window.history.state,'',url);
 },[category,search,furniture]);
 const groups=furniture?furnitureFilterCategories(items,categories):plantFilterGroups(items,categories);
 const allLabel=furniture?'ყველა ეზოს ავეჯი':'ყველა მცენარე';
 const selected=groups.find(c=>c.slug===category);
 const list=furniture?filterFurniture(items,{category,search},categories):filterPlants(items,categories,{category,search});
 const filtered=category!=='all'||search.trim()!=='';
 const reset=()=>{setCategory('all');setSearch('')};
 return <div className={'plant-catalog'+(furniture?' furniture-catalog':'')}>
  <aside className="plant-filters" aria-label={furniture?'ეზოს ავეჯის ფილტრები':'მცენარეების ფილტრები'}>
   <div className="filter-heading"><h2>კატეგორიები</h2><span>{groups.length}</span></div>
   <div className="desktop-categories">
    <button type="button" className="category-option" aria-pressed={category==='all'} onClick={()=>setCategory('all')}><span>{allLabel}</span><small>{items.length}</small></button>
    {groups.map(c=><button type="button" className="category-option" key={c.slug} aria-pressed={category===c.slug} onClick={()=>setCategory(c.slug)}><span>{c.name}</span><small>{c.count}</small></button>)}
   </div>
   <label className="mobile-category">კატეგორია<select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">{allLabel} ({items.length})</option>{groups.map(c=><option key={c.slug} value={c.slug}>{c.name} ({c.count})</option>)}</select></label>
  </aside>
  <div className="plant-results">
   <div className="catalog-toolbar">
    <label className="plant-search"><span className="search-symbol"><Search size={20} aria-hidden="true"/></span><span className="sr-only">{furniture?'ეზოს ავეჯის ძიება':'მცენარის ძიება'}</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder={furniture?'მოძებნე ეზოს ავეჯი…':'რომელ მცენარეს ეძებ?'}/>{search&&<button type="button" onClick={()=>setSearch('')} aria-label="ძიების გასუფთავება"><X size={18}/></button>}</label>
   </div>
   <div className="catalog-summary"><p aria-live="polite"><strong>{selected?.name??allLabel}</strong><span>{list.length} {furniture?'პროდუქტი':'მცენარე'}</span></p>{filtered&&<button type="button" onClick={reset}><X size={15}/>გასუფთავება</button>}</div>
   {list.length?<div className="product-grid catalog-products">{list.map(item=>furniture?<FurnitureCard key={item.id} item={item}/>:<ProductCard key={item.id} item={item}/>)}</div>:<div className="catalog-empty"><Search size={26} aria-hidden="true"/><h3>{search.trim()?(furniture?'ეზოს ავეჯი ვერ მოიძებნა':'მცენარე ვერ მოიძებნა'):'ამ არჩევანით პროდუქტები არ მოიძებნა'}</h3><p>{search.trim()?'სცადე სხვა სახელი ან შეცვალე ფილტრები.':'აირჩიე სხვა კატეგორია ან გაასუფთავე ფილტრები.'}</p><button type="button" className="button" onClick={reset}>ფილტრების გასუფთავება</button><div className="empty-suggestions"><span>ან დაათვალიერე სხვა კატეგორია</span><div>{groups.filter(group=>group.count>0&&group.slug!==category).slice(0,3).map(group=><button type="button" key={group.slug} onClick={()=>{setSearch('');setCategory(group.slug)}}>{group.name}<small>{group.count}</small></button>)}<a href={furniture?'/plants':'/furniture'}>{furniture?'მცენარეების ნახვა':'ეზოს ავეჯის ნახვა'}</a></div></div></div>}
  </div>
 </div>;
}
