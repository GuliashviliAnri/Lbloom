"use client";
import {useId,useState} from 'react';
import type {Item} from '@/lib/types';
import {ProductCard} from './site';
import DirectionIcon from './direction-icon';
import usePageSwipe from './use-page-swipe';
import useCardPageSize from './use-card-page-size';
export default function HomeProducts({items,furniture=false}:{items:Item[];furniture?:boolean}){
 const [page,setPage]=useState(0);
 const responsiveSize=useCardPageSize();
 const pageSize=responsiveSize||Math.max(items.length,1);
 const id=useId();
 const pages=Math.ceil(items.length/pageSize);
 const current=Math.min(Math.floor(page/pageSize),Math.max(0,pages-1));
 const visible=items.slice(current*pageSize,(current+1)*pageSize);
 const swipe=usePageSwipe(step=>setPage(Math.max(0,Math.min(pages-1,current+step))*pageSize));
 const label=furniture?'ეზოს ავეჯი':'მცენარეები';
 return <div className="home-product-pager" role="region" aria-label={label}>
  <div className={'product-pager-frame'+(pages>1?' has-pages':'')}>
   {pages>1&&<button type="button" className="product-page-arrow" aria-label={label+' — წინა გვერდი'} aria-controls={id} disabled={current===0} onClick={()=>setPage((current-1)*pageSize)}><DirectionIcon direction="left" size={23}/></button>}
   <div {...(responsiveSize?swipe:{})} tabIndex={0} aria-label={label+' — გადასართავად გაუსვით თითი'} onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();setPage(Math.max(0,Math.min(pages-1,current+(event.key==='ArrowRight'?1:-1)))*pageSize);}}} id={id} key={pageSize+':'+current} className="product-grid product-page-enter">{visible.map(item=><ProductCard key={item.id} item={item} furniture={furniture}/>)}</div>
   {pages>1&&<button type="button" className="product-page-arrow" aria-label={label+' — შემდეგი გვერდი'} aria-controls={id} disabled={current===pages-1} onClick={()=>setPage((current+1)*pageSize)}><DirectionIcon size={23}/></button>}
  </div>
 </div>;
}
