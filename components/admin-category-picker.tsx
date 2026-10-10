"use client";
import {automaticSlug} from '@/lib/automatic-slug';
import {useState} from 'react';
import {Plus,X} from 'lucide-react';
import {plantCategoryChoices,selectedPlantCategory,type AdminCategory} from '@/lib/admin-categories';
export type {AdminCategory} from '@/lib/admin-categories';
export default function AdminCategoryPicker({kind,categories,value,onChange,onCreate}:{kind:'plant'|'furniture';categories:AdminCategory[];value:string;onChange:(value:string)=>void;onCreate:(data:{name:string;slug:string;kind:'plant'|'furniture';group_slug:string})=>Promise<AdminCategory|null>}) {
 const[open,setOpen]=useState(false),[name,setName]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const options=kind==='plant'?plantCategoryChoices(categories):categories.filter(c=>c.kind==='furniture');
 const selected=kind==='plant'?selectedPlantCategory(value,categories):value;
 async function create(){
  if(!name.trim()){setError('ჩაწერეთ კატეგორიის სახელი.');return}
  setBusy(true);setError('');
  const category=await onCreate({name:name.trim(),slug:automaticSlug(name),kind,group_slug:'other'});
  setBusy(false);
  if(category){onChange(kind==='plant'?category.id:category.slug);setOpen(false);setName('')}
  else setError('კატეგორია ვერ დაემატა. სცადეთ ხელახლა.');
 }
 return <div className="admin-category-picker"><label>{kind==='plant'?'მცენარის კატეგორია':'ეზოს ავეჯის კატეგორია'}<select required disabled={busy} value={selected} onChange={e=>onChange(e.target.value)}><option value="">აირჩიეთ კატეგორია</option>{options.map(c=><option key={c.id} value={kind==='plant'?c.id:c.slug}>{c.name}</option>)}</select></label>
  {!options.length&&<p className="admin-field-hint">კატეგორიების სია ცარიელია.</p>}
  <button className="admin-plain-button" type="button" disabled={busy} onClick={()=>{setOpen(!open);setError('')}}>{open?<X size={16}/>:<Plus size={16}/>} {open?'დახურვა':'კატეგორიის დამატება'}</button>
  {open&&<div className="admin-new-category" onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();if(!busy)void create()}}}><p className="admin-field-hint">ახალი კატეგორია საიტის ფილტრაციაში ცალკე გამოჩნდება.</p><label>კატეგორიის სახელი<input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder={kind==='plant'?'მაგალითად: მარადმწვანე მცენარეები':'მაგალითად: შეზლონგები'}/></label>{error&&<p className="admin-field-hint" role="alert">{error}</p>}<button type="button" className="button" disabled={busy} onClick={()=>void create()}>{busy?'ემატება…':'დამატება და არჩევა'}</button></div>}
 </div>;
}
