"use client";
/* eslint-disable @next/next/no-img-element -- Preview an admin's uploaded image directly. */
import {useCallback,useEffect,useState} from 'react';
import {LoaderCircle,X,RefreshCw} from 'lucide-react';
import {supabase} from '@/lib/supabase';
import {prepareImage} from '@/lib/prepare-image';
import {advertisementLink,defaultAdvertisement,type Advertisement} from '@/lib/advertisement';
import AdvertisementBanner from './advertisement-banner';
import {draftFingerprint} from './admin-unsaved-changes';
const editableFields=['title','image_url','link_url','is_active'] as const;
export default function AdminAdvertisement({onStateChange}:{onStateChange?:(state:{dirty:boolean;working:boolean})=>void}){
 const [draft,setDraft]=useState<Advertisement>(defaultAdvertisement);
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[uploading,setUploading]=useState(false);
 const [missing,setMissing]=useState(false),[available,setAvailable]=useState(false),[message,setMessage]=useState('');
 const [baseline,setBaseline]=useState(()=>draftFingerprint(defaultAdvertisement,editableFields));
 const dirty=available&&draftFingerprint(draft,editableFields)!==baseline;
 useEffect(()=>{onStateChange?.({dirty,working:loading||saving||uploading});},[dirty,loading,saving,uploading,onStateChange]);
 useEffect(()=>()=>onStateChange?.({dirty:false,working:false}),[onStateChange]);
 const load=useCallback(async()=>{
  if(!supabase)return;setLoading(true);setMessage('');setAvailable(false);
  try{const {data,error}=await supabase.from('advertisements').select('*').eq('id',1).abortSignal(AbortSignal.timeout(12000)).maybeSingle();
   if(error){setMissing(['PGRST205','42P01'].includes(error.code));if(!['PGRST205','42P01'].includes(error.code))setMessage('რეკლამის ჩატვირთვა ვერ მოხერხდა. სცადეთ ხელახლა.');}
   else{setMissing(false);setAvailable(true);setDraft(data??defaultAdvertisement);setBaseline(draftFingerprint(data??defaultAdvertisement,editableFields));}
  }catch{setMessage('კავშირი ვერ დამყარდა. სცადეთ ხელახლა.');}finally{setLoading(false);}
 },[]);
 useEffect(()=>{void load()},[load]);
 async function upload(file?:File){
  if(!file||!supabase)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8388608){setMessage('გამოიყენეთ JPG, PNG ან WebP ფოტო, მაქსიმუმ 8 MB.');return;}
  setUploading(true);setMessage('');
  try{const image=await prepareImage(file);const name=crypto.randomUUID()+'.'+image.type.split('/')[1];
   const {error}=await supabase.storage.from('product-images').upload(name,image,{contentType:image.type,upsert:false});if(error)throw error;
   setDraft(d=>({...d,image_url:supabase!.storage.from('product-images').getPublicUrl(name).data.publicUrl}));
  }catch{setMessage('ბანერის ფოტო ვერ აიტვირთა. სცადეთ ხელახლა.');}finally{setUploading(false);}
 }
 async function save(e:React.FormEvent){
  e.preventDefault();if(!supabase||!available||saving||uploading)return;
  if(draft.link_url.trim()&&!advertisementLink(draft.link_url)){setMessage('მიუთითეთ სწორი https:// ბმული ან საიტის გვერდი, მაგალითად /plants.');return;}
  if(draft.image_url.trim()&&!advertisementLink(draft.image_url)){setMessage('მიუთითეთ ფოტოს სწორი ბმული ან ატვირთეთ ფოტო.');return;}
  setSaving(true);setMessage('');
  try{const payload={id:1,title:draft.title.trim(),image_url:draft.image_url.trim(),link_url:draft.link_url.trim(),is_active:draft.is_active};
   const {error}=await supabase.from('advertisements').upsert(payload,{onConflict:'id'}).abortSignal(AbortSignal.timeout(12000));
   if(error){setMessage('რეკლამა ვერ შეინახა. გადაამოწმეთ კავშირი და სცადეთ ხელახლა.');return;}
   setDraft(payload);setBaseline(draftFingerprint(payload,editableFields));setMessage('რეკლამა შენახულია. ცვლილება საიტის განახლებისთანავე გამოჩნდება.');
  }catch{setMessage('შენახვა ვერ მოხერხდა. სცადეთ ხელახლა.');}finally{setSaving(false);}
 }
 if(loading)return <div className="admin-empty" role="status"><LoaderCircle className="admin-spinner" size={22}/>რეკლამა იტვირთება…</div>;
 return <>
  {missing&&<div className="admin-notice"><strong>რეკლამის მართვის გასააქტიურებლად საჭიროა ერთჯერადი მომზადება.</strong><p>ჩამოტვირთეთ SQL ფაილი და გაუშვით მთლიანად Supabase-ის SQL Editor-ში. შემდეგ დააჭირეთ „ხელახლა შემოწმებას“.</p><div className="admin-ad-setup-actions"><a className="button secondary" href="/advertisement-setup.sql" download>SQL ფაილის ჩამოტვირთვა</a><button className="admin-plain-button" onClick={()=>void load()}><RefreshCw size={17}/>ხელახლა შემოწმება</button></div></div>}
  {message&&<p className="admin-notice" role="status">{message}{!available&&!missing&&<button className="admin-plain-button" onClick={()=>void load()}><RefreshCw size={17}/>ხელახლა ცდა</button>}</p>}
  <form className="admin-form admin-editor" onSubmit={save} aria-busy={saving||uploading}>
   <fieldset disabled={!available||saving||uploading}><legend>სარეკლამო ბანერი</legend>
    <div className="admin-fields">
     <div className="full admin-media-field"><label>ბანერის ფოტო<input className="admin-file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{void upload(e.target.files?.[0]);e.target.value=''}}/></label><p className="admin-field-hint">JPG, PNG ან WebP · მაქსიმუმ 8 MB. გამოიყენეთ ჰორიზონტალური ბანერი, ტექსტი თავად ფოტოში განათავსეთ. ფოტო სრულად გამოჩნდება.</p><label>ფოტოს ბმული<input value={draft.image_url} inputMode="url" placeholder="ატვირთეთ ფოტო ან ჩასვით მისი ბმული" onChange={e=>setDraft(d=>({...d,image_url:e.target.value}))}/></label>{draft.image_url&&<button type="button" className="admin-plain-button" onClick={()=>setDraft(d=>({...d,image_url:''}))}><X size={17}/>ფოტოს ამოღება</button>}</div>
     <label className="full">ბანერზე დაჭერისას გასახსნელი ბმული<input value={draft.link_url} inputMode="url" placeholder="https://… ან /plants" onChange={e=>setDraft(d=>({...d,link_url:e.target.value}))}/><span className="admin-field-hint">ცარიელი ბმულის შემთხვევაში ბანერი მხოლოდ გამოჩნდება.</span></label>
     <label className="checkbox full"><input type="checkbox" checked={draft.is_active} onChange={e=>setDraft(d=>({...d,is_active:e.target.checked}))}/>რეკლამის გამოჩენა საიტზე</label>
    </div>
   </fieldset>
   <fieldset className="admin-ad-preview"><legend>წინასწარი ნახვა</legend><p className="admin-field-hint">ბანერი გამოჩნდება მთავარ გვერდზე, ვიდეოების ქვემოთ.{!draft.is_active&&' ამჟამად გამორთულია.'}</p><AdvertisementBanner advertisement={{...draft,is_active:true}}/></fieldset>
   <div className="admin-savebar"><span>{uploading?'ფოტო იტვირთება…':dirty?'შეუნახავი ცვლილებები':'სარეკლამო ადგილი მთავარ გვერდზე'}</span><button className="button" disabled={!available||saving||uploading}>{saving||uploading?<><LoaderCircle className="admin-spinner" size={17}/>მიმდინარეობს…</>:'ცვლილებების შენახვა'}</button></div>
  </form>
 </>;
}
