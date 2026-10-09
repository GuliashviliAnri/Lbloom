import {createClient} from '@supabase/supabase-js';
import {supabaseUrl,supabasePublishableKey} from './supabase-config';
import * as seed from './data';
import type {GardenStory,Item,Category,Service,Video,Settings} from './types';
type Catalog={categories:Category[];products:Item[];furniture:Item[];services:Service[];videos:Video[];settings:Settings;garden_stories:GardenStory[];connected:boolean;setupRequired?:boolean};
type Scope='all'|'home'|'plants'|'furniture'|'services'|'stories'|'videos'|'settings';
export async function catalog(scope:Scope='all',slug?:string):Promise<Catalog>{
 const home=scope==='home';
 const needs=(section:Scope)=>home||scope==='all'||scope===section;
 const skip=()=>Promise.resolve({data:[],error:null});
 const url=supabaseUrl;const key=supabasePublishableKey;
 if(!url||!key)return {...seed,connected:false};
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
 function items(table:'products'|'furniture'){
  if(!needs(table==='products'?'plants':'furniture'))return skip();
  let query=db.from(table).select('*').order('created_at');
  if(slug)query=query.eq('slug',slug).limit(1);
  else if(home)query=query.eq('is_featured',true).limit(6);
  return query.returns<Item[]>();
 }
 function services(){
  if(!needs('services'))return skip();
  const query=db.from('services').select('*').order('sort_order');
  return (slug?query.eq('slug',slug).limit(1):query).returns<Service[]>();
 }
 function stories(){
  if(!needs('stories'))return skip();
  const columns=slug||scope==='all'?'*':'id,title,slug,excerpt,image_url,is_published,sort_order,created_at';
  const query=db.from('garden_stories').select(columns).eq('is_published',true).order('sort_order');
  return (slug?query.eq('slug',slug).limit(1):query).returns<(Omit<GardenStory,'body'>&{body?:string})[]>();
 }
 const [c,p,f,s,v,t,n]=await Promise.all([
  !home&&!slug&&(needs('plants')||needs('furniture'))?db.from('categories').select('*').order('sort_order'):skip(),
  items('products'),items('furniture'),services(),
  needs('videos')?db.from('videos').select('*').order('sort_order'):skip(),
  db.from('site_settings').select('*').eq('id',1).single(),stories()
 ]);
 // Preserve setup fallback and immediate visibility of admin changes; no stale public cache.
 if([c,p,f,s,v,t,n].some(x=>x.error&&['PGRST205','42P01'].includes(x.error.code)))return {...seed,connected:false,setupRequired:true};
 if([c,p,f,s,v,t,n].some(x=>x.error))throw new Error('კატალოგი დროებით მიუწვდომელია.');
 const cards=(rows:Item[]|null)=>slug?rows??[]:(rows??[]).map(row=>({...row,gallery_images:[]}));
 return {categories:c.data??[],products:cards(p.data),furniture:cards(f.data),services:s.data??[],videos:v.data??[],settings:t.data?{...t.data,instagram_url:t.data.instagram_url||seed.settings.instagram_url}:seed.settings,garden_stories:(n.data??[]).map(row=>({...row,body:row.body??''})),connected:true};
}
