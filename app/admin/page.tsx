"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Native links preserve navigation in the Sites runtime. */
import FacebookVideo from '@/components/facebook-video';
import {facebookVideoUrl,validVideoUrl} from '@/lib/video-source';
import {openingVideoFrame} from '@/lib/video-cover';
import {formatVideoDuration} from '@/lib/video-duration';
import {automaticSlug} from '@/lib/automatic-slug';
import AdminAdvertisement from '@/components/admin-advertisement';
import AdminCategoryPicker,{type AdminCategory} from '@/components/admin-category-picker';
import {HeightInput,FurnitureMeasurements} from '@/components/admin-measurements';
import {heightInCentimeters} from '@/lib/measurements';
import {prepareImage} from '@/lib/prepare-image';
import Price from '@/components/price';
import {settings as defaultSettings} from '@/lib/data';
import {defaultPlantFilters} from '@/lib/admin-categories';
import DirectionIcon from '@/components/direction-icon';
import {useEffect,useState,useCallback} from 'react';import {Sprout,Armchair,FolderTree,Shovel,Video,Newspaper,Settings,Search,Plus,Pencil,Trash2,LogOut,ExternalLink,LoaderCircle,X,Megaphone,Play} from 'lucide-react';import {supabase} from '@/lib/supabase';import {furnitureCategories,furnitureCategory} from '@/lib/furniture-categories';
type Table='products'|'furniture'|'services'|'videos'|'garden_stories'|'site_settings'|'advertisements';type Row=Record<string,string|number|boolean|string[]|null>;
const tabs:Record<Table,string>={products:'მცენარეები',furniture:'ეზოს ავეჯი',services:'სერვისები',videos:'ვიდეოები',garden_stories:'საბაღე ამბები',site_settings:'საიტის ინფორმაცია',advertisements:'რეკლამა'};
const labels:Record<string,string>={excerpt:'მოკლე შესავალი',body:'ამბის სრული ტექსტი',is_published:'გამოქვეყნებულია',name:'სახელი',title:'სათაური',price:'ჩვეულებრივი ფასი (₾)',sale_price:'ფასდაკლებული ფასი (₾)',height:'სიმაღლე',description:'აღწერა',dimensions_or_set_details:'კომპლექტაცია / ზომები',image_url:'მთავარი ფოტო',gallery_images:'დამატებითი ფოტოები',category_id:'კატეგორია',category_slug:'ეზოს ავეჯის კატეგორია',is_in_stock:'მარაგშია',video_url:'ვიდეოს ბმული',thumbnail_url:'ვიდეოს გარეკანი',phone:'ტელეფონი',address:'მისამართი',google_maps_url:'Google Maps-ის პირდაპირი ბმული',google_maps_embed_url:'Google Maps embed ბმული',working_hours:'სამუშაო საათები',facebook_url:'Facebook ბმული',instagram_url:'Instagram ბმული',whatsapp_url:'WhatsApp ბმული',messenger_url:'Messenger ბმული'};
const fields:Record<Table,string[]>={products:['name','category_id','price','sale_price','height','description','image_url','gallery_images','is_in_stock'],furniture:['name','category_slug','price','sale_price','description','dimensions_or_set_details','image_url','gallery_images','is_in_stock'],services:['title','description','image_url'],videos:['title','video_url','thumbnail_url','duration'],garden_stories:['title','excerpt','body','image_url','is_published'],site_settings:['phone','address','google_maps_url','google_maps_embed_url','working_hours','facebook_url','instagram_url','whatsapp_url','messenger_url'],advertisements:[]};
const icons={products:Sprout,furniture:Armchair,services:Shovel,videos:Video,garden_stories:Newspaper,site_settings:Settings,advertisements:Megaphone};
function fresh(t:Table):Row{return Object.fromEntries(fields[t].map(f=>[f,f.startsWith('is_')?false:f==='gallery_images'?[]:f==='sort_order'?0:'']))}
const defaultCategories:Row[]=[...defaultPlantFilters.map((c,i)=>({...c,id:'preset:'+c.slug,kind:'plant',group_slug:c.slug,sort_order:i})),...furnitureCategories.map((c,i)=>({...c,id:'preset:'+c.slug,kind:'furniture',group_slug:'other',sort_order:i}))];
function mergeCategories(saved:Row[]):Row[]{return [...saved,...defaultCategories.filter(c=>!saved.some(r=>r.slug===c.slug))]}
export default function Admin(){const[ready,setReady]=useState(!supabase);const[authorized,setAuthorized]=useState(false);const[email,setEmail]=useState('');const[password,setPassword]=useState('');const[table,setTable]=useState<Table>('products');const[rows,setRows]=useState<Row[]>([]);const[cats,setCats]=useState<Row[]>(defaultCategories);const[draft,setDraft]=useState<Row>(fresh('products'));const[editing,setEditing]=useState(false);const[message,setMessage]=useState('');const[busy,setBusy]=useState(false);const[uploading,setUploading]=useState(false);const[deleting,setDeleting]=useState<string|null>(null);const[query,setQuery]=useState('');
useEffect(()=>{if(!supabase)return;let mounted=true;async function check(){const{data:{user}}=await supabase!.auth.getUser();if(!mounted)return;let allowed=false;if(user){const{data,error}=await supabase!.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();allowed=Boolean(data&&!error)}setAuthorized(allowed);setReady(true)}void check();const{data:{subscription}}=supabase.auth.onAuthStateChange(()=>{setTimeout(()=>void check(),0)});return()=>{mounted=false;subscription.unsubscribe()}},[]);
const load=useCallback(async(t:Table)=>{
 if(!supabase||t==='advertisements')return;
 setBusy(true);setMessage('');
 try{
  const [result,c]=await Promise.all([
   supabase.from(t).select('*').order(t==='site_settings'?'id':'created_at',{ascending:false}).order('id',{ascending:false}).abortSignal(AbortSignal.timeout(12000)),
   supabase.from('categories').select('*').order('sort_order').abortSignal(AbortSignal.timeout(12000))
  ]);
  const{data,error}=result;
  if(error){setRows([]);setMessage(['PGRST205','42P01'].includes(error.code)?'ბაზის ცხრილები ჯერ არ არის შექმნილი. გაუშვით სრული SQL სკრიპტი Supabase-ში.':'მონაცემების ჩატვირთვა ვერ მოხერხდა. სცადეთ ხელახლა.');}
  else{setRows(data??[]);if(t==='site_settings'){setDraft({...defaultSettings,...data?.[0],instagram_url:data?.[0]?.instagram_url||defaultSettings.instagram_url});setEditing(true)}}
  setCats(mergeCategories(c.data??[]));
  if(c.error&&['PGRST205','42P01'].includes(c.error.code))setMessage('საწყისი კატეგორიები ხელმისაწვდომია ასარჩევად. შენახვის გასააქტიურებლად გაუშვით სრული SQL სკრიპტი.');
 }catch{setMessage('კავშირი ვერ დამყარდა. განაახლეთ გვერდი და სცადეთ ხელახლა.')}
 finally{setBusy(false)}
},[])
useEffect(()=>{if(!authorized)return;const timer=setTimeout(()=>void load(table),0);return()=>clearTimeout(timer)},[authorized,table,load]);
async function login(e:React.FormEvent){e.preventDefault();if(!supabase)return;setBusy(true);const{error}=await supabase.auth.signInWithPassword({email,password});setPassword('');setMessage(error?'შესვლა ვერ მოხერხდა. გადაამოწმეთ ელფოსტა და პაროლი.':'თუ ანგარიში არ არის ადმინისტრატორად დამატებული, წვდომა შეზღუდული დარჩება.');setBusy(false)}
function switchTable(t:Table){setTable(t);setDraft(fresh(t));setEditing(false);setMessage('');setDeleting(null);setQuery('')}
async function upload(files:FileList|null,field:string){
 if(!files||!supabase)return;const list=Array.from(files);
 if(list.some(file=>!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8388608)){setMessage('გამოიყენეთ JPG, PNG ან WebP ფოტო, მაქსიმუმ 8 MB.');return}
 setUploading(true);setMessage('');const urls:string[]=[];
 try{
  for(const original of list){
   const file=await prepareImage(original,field==='thumbnail_url'?900:1600);
   const bucket=field==='thumbnail_url'?'video-thumbnails':'product-images';const name=crypto.randomUUID()+'.'+file.type.split('/')[1];
   const {error}=await supabase.storage.from(bucket).upload(name,file,{contentType:file.type,upsert:false});if(error)throw error;
   urls.push(supabase.storage.from(bucket).getPublicUrl(name).data.publicUrl);
  }
 }catch{setMessage('ფოტოს ატვირთვა ვერ მოხერხდა. სცადეთ ხელახლა.')}
 finally{
  if(urls.length)setDraft(d=>({...d,[field]:field==='gallery_images'?[...(Array.isArray(d[field])?d[field] as string[]:[]),...urls]:urls[0]}));
  setUploading(false);
 }
}
async function uploadOpeningCover(file:File){
 if(!supabase)throw new Error('No storage');
 const frame=await openingVideoFrame(file);const name=crypto.randomUUID()+'.jpg';
 const {error}=await supabase.storage.from('video-thumbnails').upload(name,frame.cover,{contentType:'image/jpeg',upsert:false});
 if(error)throw error;
 return {url:supabase.storage.from('video-thumbnails').getPublicUrl(name).data.publicUrl,duration:frame.duration};
}
async function coverFromVideo(files:FileList|null){
 const file=files?.[0];if(!file)return;setUploading(true);setMessage('');
 try{const frame=await uploadOpeningCover(file);setDraft(d=>({...d,thumbnail_url:frame.url,duration:frame.duration}));setMessage('ვიდეოს საწყისი კადრი გარეკანად დაემატა.');}
 catch{setMessage('კადრი ვერ მივიღეთ. სცადეთ MP4 ვიდეო ან დაამატეთ გარეკანი ფოტოდ.');}
 finally{setUploading(false);}
}
async function uploadVideo(files:FileList|null){
 const file=files?.[0];if(!file||!supabase)return;
 const type=file.type||(/\.mp4$/i.test(file.name)?'video/mp4':/\.webm$/i.test(file.name)?'video/webm':'');
 if(!['video/mp4','video/webm'].includes(type)){setMessage('აირჩიეთ MP4 ან WebM ვიდეო. სხვა ფორმატის ვიდეო ჯერ MP4 ფორმატში შეინახეთ.');return}
 if(file.size>50*1024*1024){setMessage('ვიდეო მაქსიმუმ 50 MB უნდა იყოს. შეამოკლეთ ან შეამცირეთ ფაილის ზომა.');return}
 setUploading(true);setMessage('');
 try{
  const name=crypto.randomUUID()+(type==='video/mp4'?'.mp4':'.webm');
  const {error}=await supabase.storage.from('videos').upload(name,file,{contentType:type,upsert:false});
  if(error){setMessage(/bucket.*not found/i.test(error.message)?'ვიდეოების საცავი ჯერ არ არის შექმნილი. გაუშვით ვიდეოების SQL ფაილი Supabase-ის SQL Editor-ში.':'ვიდეო ვერ აიტვირთა. გადაამოწმეთ ინტერნეტი და ვიდეოების საცავის უფლებები.');return}
  const url=supabase.storage.from('videos').getPublicUrl(name).data.publicUrl;
  setDraft(d=>({...d,video_url:url,duration:''}));
  try {
   const frame=await uploadOpeningCover(file);
   setDraft(d=>({...d,thumbnail_url:frame.url,duration:frame.duration}));
   setMessage('ვიდეო და მისი საწყისი კადრი ატვირთულია. დაამატეთ სათაური და შეინახეთ.');
  }catch{setMessage('ვიდეო ატვირთულია, მაგრამ საწყისი კადრი ვერ მივიღეთ. შეგიძლიათ გარეკანი ფოტოდ დაამატოთ.');}
 }catch{setMessage('ვიდეოს ატვირთვა შეწყდა. სცადეთ ხელახლა.')}finally{setUploading(false)}
}
async function save(e:React.FormEvent){e.preventDefault();if(!supabase||uploading)return;if(table==='videos'&&!validVideoUrl(String(draft.video_url??''))){setMessage('ჩასვით Facebook Reel-ის საჯარო ბმული ან პირდაპირი MP4 / WebM ვიდეოს HTTPS ბმული.');return;}setBusy(true);setMessage('');const payload:Row={};for(const f of fields[table])payload[f]=draft[f]??(f==='category_slug'?furnitureCategory({name:String(draft.name??'')}):'');if(['products','furniture','services','garden_stories'].includes(table)){payload.slug=draft.slug||automaticSlug(String(payload.name??payload.title??''));if(!draft.slug)setDraft(d=>({...d,slug:payload.slug}))}if((table==='products'&&String(payload.category_id).startsWith('preset:'))||(table==='furniture'&&cats.some(c=>c.slug===payload.category_slug&&String(c.id).startsWith('preset:')))){const chosen=cats.find(c=>table==='products'?c.id===payload.category_id:c.slug===payload.category_slug);if(chosen){const{data:resolved,error}=await supabase.from('categories').upsert({name:chosen.name,slug:chosen.slug,kind:table==='furniture'?'furniture':'plant',group_slug:chosen.group_slug,sort_order:chosen.sort_order},{onConflict:'slug',ignoreDuplicates:true}).select('id').maybeSingle();let id=resolved?.id;if(!id&&!error){const existing=await supabase.from('categories').select('id').eq('slug',chosen.slug).single();id=existing.data?.id}if(error||!id){setMessage('კატეგორიის შენახვისთვის ჯერ გაუშვით ბაზის სრული SQL სკრიპტი.');setBusy(false);return}if(table==='products')payload.category_id=id}}if(table==='products')payload.height=heightInCentimeters(String(payload.height??''));for(const f of ['price','sale_price'])if(f in payload)payload[f]=payload[f]===''?null:Number(payload[f]);if(table==='products'||table==='furniture'){
 if(payload.sale_price!==null&&(payload.price===null||!Number.isFinite(Number(payload.sale_price))||Number(payload.sale_price)<0||Number(payload.sale_price)>=Number(payload.price))){setMessage('ფასდაკლებული ფასი ჩვეულებრივ ფასზე ნაკლები უნდა იყოს. ფასდაკლების გასაუქმებლად დატოვეთ ველი ცარიელი.');setBusy(false);return}
 if(payload.sale_price===null&&!rows.some(r=>Object.prototype.hasOwnProperty.call(r,'sale_price')))delete payload.sale_price;
}const result=table==='site_settings'?await supabase.from(table).upsert({...payload,id:1}):draft.id?await supabase.from(table).update(payload).eq('id',draft.id):await supabase.from(table).insert(payload);if(result.error){setMessage(result.error.code==='PGRST204'&&'sale_price' in payload?'ფასდაკლების შესანახად გაუშვით ფასდაკლებების SQL ფაილი Supabase-ის SQL Editor-ში.':result.error.code==='23505'?'ჩანაწერი ამ სახელით უკვე არსებობს. სცადეთ ხელახლა.':'შენახვა ვერ მოხერხდა. გადაამოწმეთ ველები და კავშირი.');setBusy(false);return}await load(table);if(table!=='site_settings'){setEditing(false);setDraft(fresh(table))}setMessage('ცვლილებები შენახულია.');setBusy(false)}
async function remove(id:string){if(!supabase)return;setBusy(true);const{error}=await supabase.from(table).delete().eq('id',id);if(error){setMessage('წაშლა ვერ მოხერხდა. კატეგორიის წაშლამდე მასთან დაკავშირებული პროდუქტები გადაიტანეთ.');setBusy(false)}else{setDeleting(null);await load(table);setMessage('ჩანაწერი წაშლილია.')}}
const categoryOptions:AdminCategory[]=cats.map(c=>({id:String(c.id),name:String(c.name),slug:String(c.slug),kind:String(c.kind??'plant'),group_slug:String(c.group_slug??'other')}));
async function createCategory(data:{name:string;slug:string;kind:'plant'|'furniture';group_slug:string}):Promise<AdminCategory|null>{
 if(!supabase)return null;
 setBusy(true);
 try {
 const{data:created,error}=await supabase.from('categories').insert({...data,sort_order:cats.filter(c=>(c.kind??'plant')===data.kind).length}).select('*').single();
 if(error){setMessage(error.code==='23505'?'ეს კატეგორია უკვე არსებობს. აირჩიეთ სიიდან.':'კატეგორია ვერ შეინახა. გადაამოწმეთ სრული SQL სკრიპტის გაშვება.');return null}
 setCats(c=>[...c,created]);setMessage('კატეგორია დამატებულია და არჩეულია.');return created as AdminCategory;
 }catch{setMessage('კატეგორია ვერ შეინახა. სცადეთ ხელახლა.');return null}finally{setBusy(false)}
}
function renderField(f:string){const value=draft[f];if(f==='sale_price')return <label>{labels[f]}<input type="number" min="0" step="0.01" value={String(value??'')} placeholder="ფასდაკლების გარეშე" onChange={e=>setDraft(d=>({...d,sale_price:e.target.value}))}/></label>;if(f==='video_url')return <div className="full admin-media-field"><label>ვიდეოს ატვირთვა<input className="admin-file-input" type="file" accept="video/mp4,video/webm,.mp4,.webm" disabled={uploading} onChange={e=>{void uploadVideo(e.target.files);e.target.value=''}}/></label><p className="admin-field-hint">აირჩიეთ ვიდეო ტელეფონიდან ან კომპიუტერიდან · MP4 ან WebM · მაქსიმუმ 50 MB. ბმული ავტომატურად შეივსება.</p><label>ვიდეოს ბმული<input type="text" required value={String(value??'')} placeholder="ატვირთეთ ვიდეო ან ჩასვით პირდაპირი ვიდეოს ბმული" onChange={e=>setDraft(d=>({...d,video_url:e.target.value,duration:''}))}/></label>{value&&<video className="admin-video-preview" src={String(value)} controls playsInline preload="metadata"/>}</div>;if(f==='height')return <HeightInput value={String(value??'')} onChange={v=>setDraft(d=>({...d,height:v}))}/>;if(f==='dimensions_or_set_details')return <FurnitureMeasurements value={String(value??'')} onChange={v=>setDraft(d=>({...d,dimensions_or_set_details:v}))}/>;if(f.startsWith('is_'))return <label className="checkbox"><input type="checkbox" checked={Boolean(value)} onChange={e=>setDraft({...draft,[f]:e.target.checked})}/>{labels[f]}</label>;if(['image_url','thumbnail_url','gallery_images'].includes(f))return <div className="full"><label>{labels[f]}<input className="admin-file-input" type="file" accept="image/jpeg,image/png,image/webp" multiple={f==='gallery_images'} onChange={e=>{void upload(e.target.files,f);e.target.value=''}} disabled={uploading}/></label>{f==='gallery_images'?<div className="admin-gallery">{(Array.isArray(value)?value:[]).map((u,i)=><div className="admin-photo-preview" key={u+String(i)}><img className="upload-preview" src={u} alt={'ფოტო '+(i+1)}/><button className="admin-photo-remove" type="button" aria-label={'ფოტო '+(i+1)+' — ამოღება'} title="ფოტოს ამოღება" onClick={()=>setDraft(d=>({...d,gallery_images:(d.gallery_images as string[]).filter((_,j)=>i!==j)}))}><X size={18}/></button></div>)}</div>:<><input aria-label={labels[f]+' ბმული'} type="text" inputMode="url" value={String(value??'')} placeholder="https://… ან /ფოტო.jpg" onChange={e=>setDraft({...draft,[f]:e.target.value})}/>{value&&<div className="admin-photo-preview"><img className="upload-preview" src={String(value)} alt="არჩეული ფოტო"/><button className="admin-photo-remove" type="button" aria-label={labels[f]+' — ამოღება'} title="ფოტოს ამოღება" onClick={()=>setDraft(d=>({...d,[f]:''}))}><X size={18}/></button></div>}</>}</div>;if(f==='category_slug'||f==='category_id')return <AdminCategoryPicker kind={f==='category_id'?'plant':'furniture'} categories={categoryOptions} value={String(value??'')} onChange={v=>setDraft(d=>({...d,[f]:v}))} onCreate={createCategory}/>;return <label className={['description','excerpt','body','dimensions_or_set_details'].includes(f)?'full':''}>{labels[f]}{['description','excerpt','body'].includes(f)?<textarea required value={String(value??'')} onChange={e=>setDraft({...draft,[f]:e.target.value})}/>:<input type={f==='price'?'number':f==='video_url'?'text':f.endsWith('_url')?'url':'text'} min={f==='price'?0:undefined} step={f==='price'?'0.01':undefined} required={['name','title','duration','phone','working_hours','video_url'].includes(f)} value={String(value??'')} onChange={e=>setDraft({...draft,[f]:e.target.value})}/>}</label>}
const visibleRows=rows.filter(r=>String(r.name??r.title??'').toLocaleLowerCase('ka').includes(query.trim().toLocaleLowerCase('ka')));
const imageFields=fields[table].filter(f=>['image_url','gallery_images','thumbnail_url'].includes(f));
const statusFields=fields[table].filter(f=>f.startsWith('is_'));
const mainFields=fields[table].filter(f=>!imageFields.includes(f)&&!statusFields.includes(f));
function startEdit(row?:Row){setDraft(row??fresh(table));setEditing(true);setMessage('');setDeleting(null);window.scrollTo({top:0,behavior:'smooth'})}
const brand=<a href="/" className="admin-brand"><img src="/logo-mark.webp" alt="LBLOOM ლოგო"/><span><strong>LBLOOM</strong><small>საბაღე ცენტრი</small></span></a>;
if(!ready)return <div className="admin admin-loading" role="status"><LoaderCircle className="admin-spinner" size={24}/>იტვირთება…</div>;
if(!supabase)return <div className="admin admin-login"><div className="admin-login-card">{brand}<h1>ადმინისტრირება</h1><p className="notice">ადმინისტრირების გასააქტიურებლად საჭიროა Supabase-ის პროექტის დაკავშირება.</p><a className="admin-site-link" href="/">საიტზე დაბრუნება</a></div></div>;
if(!authorized)return <div className="admin admin-login"><div className="admin-login-card">{brand}<div className="admin-login-heading"><span className="admin-kicker">მართვის პანელი</span><h1>მოგესალმებით</h1><p>შედით ადმინისტრატორის ანგარიშით.</p></div><form className="admin-form admin-login-form" onSubmit={login}><label>ელფოსტა<input type="email" autoComplete="username" placeholder="თქვენი ელფოსტა" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>პაროლი<input type="password" autoComplete="current-password" placeholder="თქვენი პაროლი" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="button" disabled={busy}>{busy?<><LoaderCircle className="admin-spinner" size={18}/>მიმდინარეობს…</>:'შესვლა'}</button></form>{message&&<p className="admin-notice" role="status">{message}</p>}<a href="/" className="admin-site-link"><DirectionIcon direction="left" size={16}/>საიტზე დაბრუნება</a></div></div>;
return <div className="admin admin-workspace">
 <aside className="admin-sidebar">{brand}<span className="admin-kicker">მართვის პანელი</span><nav className="admin-tabs" aria-label="ადმინისტრირების სექციები">{Object.entries(tabs).map(([t,n])=>{const Icon=icons[t as Table];return <button key={t} type="button" disabled={busy||uploading} aria-pressed={table===t} onClick={()=>switchTable(t as Table)}><Icon size={19}/><span>{n}</span></button>})}</nav><a href="/" className="admin-site-link"><ExternalLink size={17}/>საიტის ნახვა</a></aside>
 <main className="admin-main">
  <header className="admin-topbar"><span>LBLOOM · ადმინისტრირება</span><button type="button" className="admin-plain-button" onClick={()=>void supabase!.auth.signOut()} disabled={busy||uploading}><LogOut size={17}/>გასვლა</button></header>
  <div className="admin-page-heading"><div><span className="admin-kicker">{editing&&table!=='site_settings'?'ჩანაწერის მართვა':'კონტენტის მართვა'}</span><h1>{tabs[table]}</h1><p>{table==='advertisements'?'მართეთ მთავარ გვერდზე გამოჩენილი სარეკლამო ბანერი.':table==='site_settings'?'საკონტაქტო ინფორმაცია და სოციალური ქსელების ბმულები.':editing?(draft.id?'შეცვალეთ ჩანაწერის ინფორმაცია.':'შეავსეთ ინფორმაცია ახალი ჩანაწერისთვის.'):'დაამატეთ ახალი ჩანაწერი ან შეცვალეთ არსებული.'}</p></div>{!editing&&table!=='site_settings'&&table!=='advertisements'&&<button className="button" disabled={busy} onClick={()=>startEdit()}><Plus size={18}/>დამატება</button>}{editing&&table!=='site_settings'&&<button className="admin-plain-button" disabled={busy||uploading} onClick={()=>setEditing(false)}><DirectionIcon direction="left" size={17}/>სიაში დაბრუნება</button>}</div>
  {message&&<p className="admin-notice" role="status">{message}{message.includes('SQL')&&<> <a href="/database-setup.sql" download className="text-link">სრული SQL ფაილის ჩამოტვირთვა</a></>}</p>}
  {table==='advertisements'?<AdminAdvertisement/>:editing?<form className="admin-form admin-editor" onSubmit={save} aria-busy={busy||uploading}>
   {table==='videos'?<div className="admin-video-layout">
    <fieldset disabled={busy||uploading} className="admin-video-details"><legend>ვიდეოს ინფორმაცია</legend>
     <div className="admin-video-info">{renderField('title')}</div>
     <div className="admin-video-upload"><div className="admin-video-upload-heading"><Video size={24}/><div><strong>ატვირთეთ ვიდეო</strong><p>აირჩიეთ ფაილი ტელეფონიდან ან კომპიუტერიდან</p></div></div>
      <label>ვიდეოს ფაილი<input className="admin-file-input" type="file" accept="video/mp4,video/webm,.mp4,.webm" disabled={uploading} onChange={e=>{void uploadVideo(e.target.files);e.target.value=''}}/></label>
      <p className="admin-field-hint">MP4 ან WebM · მაქსიმუმ 50 MB</p>
     </div>
     <label>ან ჩასვით Facebook Reel-ის / ვიდეოს ბმული<input type="text" required value={String(draft.video_url??'')} placeholder="https://www.facebook.com/reel/… ან https://…/video.mp4" onChange={e=>setDraft(d=>({...d,video_url:e.target.value,duration:'',thumbnail_url:''}))}/></label>
    </fieldset>
    <fieldset disabled={busy||uploading} className="admin-video-visuals"><legend>წინასწარი ნახვა და გარეკანი</legend>
     <div className="admin-video-stage">{draft.video_url?(facebookVideoUrl(String(draft.video_url))?<FacebookVideo url={String(draft.video_url)} title={String(draft.title||'ვიდეოს წინასწარი ნახვა')}/>:<video key={String(draft.video_url)} onLoadedMetadata={event=>{const duration=formatVideoDuration(event.currentTarget.duration);const url=String(draft.video_url);if(duration)setDraft(current=>current.video_url===url?{...current,duration}:current);}} src={String(draft.video_url)} poster={String(draft.thumbnail_url??'')} controls playsInline preload="metadata"/>):<div className="admin-video-placeholder"><Play size={30}/><strong>ვიდეო აქ გამოჩნდება</strong><p>ატვირთეთ ფაილი ან ჩასვით ბმული</p></div>}</div>
     <div className="admin-video-cover"><label>გარეკანი ვიდეოს დასაწყისიდან<input className="admin-file-input" type="file" accept="video/mp4,video/webm,.mp4,.webm" onChange={e=>{void coverFromVideo(e.target.files);e.target.value=''}}/></label><p className="admin-field-hint">აირჩიეთ ორიგინალი ვიდეო — მხოლოდ საწყისი კადრის ფოტო აიტვირთება. ვიდეოს ზომა აქ შეზღუდული არ არის.</p>{renderField('thumbnail_url')}</div>
     <p className="admin-field-hint">ატვირთულ ვიდეოს საწყისი კადრი ავტომატურად ემატება. სურვილის შემთხვევაში შეცვალეთ ფოტოთი · JPG, PNG ან WebP · მაქსიმუმ 8 MB</p>
    </fieldset>
   </div>:(table==='products'||table==='furniture')?<div className="admin-product-layout">
    <div className="admin-product-information">
     <fieldset disabled={busy||uploading}><legend>პროდუქტის ინფორმაცია</legend><div className="admin-fields">{mainFields.map(f=><div key={f} className={['name','category_id','category_slug','height','description','dimensions_or_set_details'].includes(f)?'full':''}>{renderField(f)}</div>)}</div></fieldset>
     <fieldset disabled={busy||uploading}><legend>ხელმისაწვდომობა</legend><div className="admin-fields">{statusFields.map(f=><div key={f}>{renderField(f)}</div>)}</div></fieldset>
    </div>
    <fieldset disabled={busy||uploading} className="admin-product-images"><legend>პროდუქტის ფოტოები</legend>
     <p className="admin-field-hint">პირველი ფოტო ქარდზე გამოჩნდება, დამატებითი ფოტოები — პროდუქტის გალერეაში.</p>
     <div className="admin-photo-fields">{imageFields.map(f=><div key={f} className={f==='image_url'?'admin-primary-photo':'admin-extra-photos'}>{renderField(f)}{f==='image_url'&&!draft.image_url&&<div className="admin-product-photo-empty">{table==='products'?<Sprout size={32}/>:<Armchair size={32}/>}<span>აქ გამოჩნდება მთავარი ფოტო</span></div>}</div>)}</div>
     <p className="admin-field-hint">JPG, PNG ან WebP · თითო ფოტო მაქსიმუმ 8 MB</p>
    </fieldset>
   </div>:<>
   <fieldset disabled={busy||uploading}><legend>{table==='site_settings'?'საიტის ინფორმაცია':'ძირითადი ინფორმაცია'}</legend><div className="admin-fields">{mainFields.map(f=><div key={f} className={['description','excerpt','body','dimensions_or_set_details'].includes(f)?'full':''}>{renderField(f)}</div>)}</div></fieldset>
   {imageFields.length>0&&<fieldset disabled={busy||uploading}><legend>ფოტოები</legend><p className="admin-field-hint">JPG, PNG ან WebP · თითო ფოტო მაქსიმუმ 8 MB</p><div className="admin-fields">{imageFields.map(f=><div className="full admin-media-field" key={f}>{renderField(f)}</div>)}</div></fieldset>}
   {statusFields.length>0&&<fieldset disabled={busy||uploading}><legend>გამოჩენა და პარამეტრები</legend><div className="admin-fields">{statusFields.map(f=><div key={f}>{renderField(f)}</div>)}</div></fieldset>}
   </>}
   <div className="admin-savebar"><span>{uploading?'ფაილი იტვირთება…':draft.id?'არსებული ჩანაწერის რედაქტირება':'ახალი ჩანაწერი'}</span><div>{table!=='site_settings'&&<button className="button secondary" type="button" disabled={busy||uploading} onClick={()=>setEditing(false)}>გაუქმება</button>}<button className="button" disabled={busy||uploading}>{busy||uploading?<><LoaderCircle className="admin-spinner" size={17}/>მიმდინარეობს…</>:'ცვლილებების შენახვა'}</button></div></div>
  </form>:<section className="admin-records" aria-label={tabs[table]}>
   <div className="admin-list-toolbar"><label className="admin-search"><Search size={19}/><input type="search" aria-label="ჩანაწერების ძიება" placeholder="მოძებნეთ სახელით…" value={query} onChange={e=>setQuery(e.target.value)}/></label><span>{query?visibleRows.length+' / '+rows.length:rows.length} ჩანაწერი</span></div>
   {busy?<div className="admin-empty" role="status"><LoaderCircle className="admin-spinner" size={22}/>მონაცემები იტვირთება…</div>:visibleRows.length===0?<div className="admin-empty"><FolderTree size={28}/><h2>{query?'ჩანაწერი ვერ მოიძებნა':'ჩანაწერები ჯერ არ არის'}</h2><p>{query?'სცადეთ სხვა საძიებო სიტყვა.':'პირველი ჩანაწერის შესაქმნელად გამოიყენეთ „დამატება“.'}</p></div>:<div className="admin-list">{visibleRows.map(r=>{const image=String(r.image_url??r.thumbnail_url??'');const Icon=icons[table];const category=cats.find(c=>c.id===r.category_id);return <article className="admin-row" key={String(r.id)}>
    <div className="admin-row-content"><div className="admin-row-photo">{image?<img src={image} alt="" loading="lazy"/>:<Icon size={23}/>}</div><div className="admin-row-name"><strong>{String(r.name??r.title??'')}</strong><div className="admin-row-meta">{category&&<span>{String(category.name)}</span>}{r.category_slug&&<span>{cats.find(c=>c.slug===r.category_slug)?.name??furnitureCategories.find(c=>c.slug===r.category_slug)?.name??''}</span>}{r.height&&<span>{heightInCentimeters(String(r.height))}</span>}{r.duration&&<span>{String(r.duration)}</span>}{table==='garden_stories'&&<span className="admin-tag">{r.is_published?'გამოქვეყნებულია':'მონახაზი'}</span>}</div></div></div>
    <div className="admin-row-actions">{(table==='products'||table==='furniture')&&<span className="admin-row-price"><Price price={r.price===null||r.price===''||r.price===undefined?null:Number(r.price)} salePrice={r.sale_price===null||r.sale_price===''||r.sale_price===undefined?null:Number(r.sale_price)}/></span>}<button className="admin-edit-button" disabled={busy} onClick={()=>startEdit(r)}><Pencil size={16}/><span>რედაქტირება</span></button>{deleting===r.id?<div className="admin-delete-confirm"><span>წავშალოთ ჩანაწერი?</span><button className="admin-delete-button" onClick={()=>void remove(String(r.id))} disabled={busy}>წაშლა</button><button className="admin-plain-button" onClick={()=>setDeleting(null)}>გაუქმება</button></div>:<button className="admin-delete-button" aria-label={String(r.name??r.title)+' — წაშლა'} disabled={busy} onClick={()=>setDeleting(String(r.id))}><Trash2 size={17}/></button>}</div>
   </article>})}</div>}
  </section>}
 </main>
</div>}
