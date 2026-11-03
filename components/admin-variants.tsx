"use client";
import {Plus,Trash2} from 'lucide-react';
/** Editable rows while typing; prices stay text until the form is saved. */
export type VariantDraft={size:string;price:string;sale_price:string};
export function toVariantDrafts(value:unknown):VariantDraft[]{
 if(!Array.isArray(value))return [];
 return value.map(v=>({size:String(v?.size??''),price:v?.price==null?'':String(v.price),sale_price:v?.sale_price==null?'':String(v.sale_price)}));
}
export default function AdminVariants({value,onChange,disabled}:{value:unknown;onChange:(rows:VariantDraft[])=>void;disabled?:boolean}){
 const rows=toVariantDrafts(value);
 const set=(index:number,key:keyof VariantDraft,text:string)=>onChange(rows.map((row,i)=>i===index?{...row,[key]:text}:row));
 return <div className="full admin-variants">
  <span className="admin-variants-title">ზომები და ფასები</span>
  <p className="admin-field-hint">თუ მცენარე რამდენიმე ზომაშია, დაამატეთ თითოეული ზომა თავისი ფასით. ერთზომიანი მცენარისთვის დატოვეთ ცარიელი და გამოიყენეთ ზემოთ მოცემული ფასი. ზომების დამატებისას ზემოთა ფასი ავტომატურად ყველაზე იაფი ზომის ფასი გახდება.</p>
  {rows.length>0&&<div className="admin-variant-list">{rows.map((row,i)=><div className="admin-variant-row" key={i}>
   <label>ზომა<input type="text" required maxLength={40} placeholder="მაგ. 60–80 სმ ან P9" value={row.size} disabled={disabled} onChange={e=>set(i,'size',e.target.value)}/></label>
   <label>ფასი (₾)<input type="number" min="0" step="0.01" placeholder="შეთანხმებით" value={row.price} disabled={disabled} onChange={e=>set(i,'price',e.target.value)}/></label>
   <label>ფასდაკლებით (₾)<input type="number" min="0" step="0.01" placeholder="—" value={row.sale_price} disabled={disabled} onChange={e=>set(i,'sale_price',e.target.value)}/></label>
   <button type="button" className="admin-delete-button" aria-label={'ზომის წაშლა — '+(row.size||String(i+1))} title="ზომის წაშლა" disabled={disabled} onClick={()=>onChange(rows.filter((_,j)=>j!==i))}><Trash2 size={17}/></button>
  </div>)}</div>}
  <button type="button" className="admin-plain-button admin-variant-add" disabled={disabled||rows.length>=12} onClick={()=>onChange([...rows,{size:'',price:'',sale_price:''}])}><Plus size={17}/>ზომის დამატება</button>
 </div>;
}
