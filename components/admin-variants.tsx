"use client";
import {Plus,Trash2} from 'lucide-react';
/** Editable rows while typing; prices stay text until the form is saved. */
export type VariantDraft={size:string;price:string;sale_price:string};
export function toVariantDrafts(value:unknown):VariantDraft[]{
 if(!Array.isArray(value))return [];
 return value.map(v=>({size:String(v?.size??''),price:v?.price==null?'':String(v.price),sale_price:v?.sale_price==null?'':String(v.sale_price)}));
}
/** True while the product is edited as "several sizes"; the single price and height fields are then hidden. */
export function hasVariantRows(value:unknown){return Array.isArray(value)&&value.length>0}
const empty:VariantDraft={size:'',price:'',sale_price:''};
export default function AdminVariants({value,current,onChange,disabled}:{value:unknown;current:{size:string;price:string;sale_price:string};onChange:(rows:VariantDraft[])=>void;disabled?:boolean}){
 const rows=toVariantDrafts(value);
 const multi=rows.length>0;
 const set=(index:number,key:keyof VariantDraft,text:string)=>onChange(rows.map((row,i)=>i===index?{...row,[key]:text}:row));
 // The size and price already on the product become the first size, so nothing typed before is lost.
 const startSizes=()=>onChange([{size:current.size,price:current.price,sale_price:current.sale_price},{...empty}]);
 return <div className="full admin-variants">
  <span className="admin-variants-title">ზომა და ფასი</span>
  <div className="admin-size-mode" role="group" aria-label="ზომების რაოდენობა">
   <button type="button" aria-pressed={!multi} className={!multi?'is-active':''} disabled={disabled} onClick={()=>{if(multi)onChange([])}}>ერთი ზომა<small>ერთი ფასი</small></button>
   <button type="button" aria-pressed={multi} className={multi?'is-active':''} disabled={disabled} onClick={()=>{if(!multi)startSizes()}}>რამდენიმე ზომა<small>თითოს თავისი ფასი</small></button>
  </div>
  {multi?<>
   <p className="admin-field-hint">საიტზე მომხმარებელი აირჩევს ზომას და ფასი არჩეული ზომის მიხედვით შეიცვლება. ქარდზე გამოჩნდება ყველაზე დაბალი ფასი „-დან“.</p>
   <div className="admin-variant-list">{rows.map((row,i)=><div className="admin-variant-row" key={i}>
    <label>ზომა {i+1}<input type="text" required maxLength={40} placeholder="მაგ. 60–80 სმ" value={row.size} disabled={disabled} onChange={e=>set(i,'size',e.target.value)}/></label>
    <label>ფასი (₾)<input type="number" min="0" step="0.01" placeholder="შეთანხმებით" value={row.price} disabled={disabled} onChange={e=>set(i,'price',e.target.value)}/></label>
    <label>ფასდაკლებით (₾)<input type="number" min="0" step="0.01" placeholder="—" value={row.sale_price} disabled={disabled} onChange={e=>set(i,'sale_price',e.target.value)}/></label>
    <button type="button" className="admin-delete-button" aria-label={'ზომის წაშლა — '+(row.size||String(i+1))} title="ზომის წაშლა" disabled={disabled} onClick={()=>onChange(rows.filter((_,j)=>j!==i))}><Trash2 size={17}/></button>
   </div>)}</div>
   <button type="button" className="admin-plain-button admin-variant-add" disabled={disabled||rows.length>=12} onClick={()=>onChange([...rows,{...empty}])}><Plus size={17}/>კიდევ ერთი ზომა</button>
  </>:<p className="admin-field-hint">მცენარე ერთ ზომაშია — შეავსეთ ფასი და სიმაღლე ქვემოთ.</p>}
 </div>;
}
