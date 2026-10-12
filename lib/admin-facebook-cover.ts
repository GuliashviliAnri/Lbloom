import {supabase} from './supabase';
import {facebookVideoUrl} from './video-source';
import {fetchFacebookCover} from './facebook-cover-client';
import {prepareImage} from './prepare-image';
const uploads=new Map<string,Promise<string>>();
const repairs=new Map<string,Promise<{id:string;video_url:string;thumbnail_url:string}|null>>();
/** Uploads use the signed-in administrator's client and existing Storage policies. */
export function uploadFacebookCover(value:string):Promise<string>{
 const url=facebookVideoUrl(value);if(!supabase||!url)return Promise.reject(new Error('No cover storage'));
 const pending=uploads.get(url);if(pending)return pending;
 const work=(async()=>{
  const blob=await fetchFacebookCover(url,AbortSignal.timeout(45000));
  const file=await prepareImage(new File([blob],'facebook-cover.jpg',{type:blob.type}),900);
  const name=crypto.randomUUID()+'.'+file.type.split('/')[1];
  const {error}=await supabase!.storage.from('video-thumbnails').upload(name,file,{contentType:file.type,upsert:false});if(error)throw error;
  return supabase!.storage.from('video-thumbnails').getPublicUrl(name).data.publicUrl;
 })().finally(()=>uploads.delete(url));uploads.set(url,work);return work;
}
export function repairFacebookCover(row:{id:string;video_url:string;thumbnail_url?:string|null}){
 if(!supabase||row.thumbnail_url?.trim()||!facebookVideoUrl(row.video_url))return Promise.resolve(null);
 const pending=repairs.get(row.id);if(pending)return pending;
 const work=(async()=>{
  const cover=await uploadFacebookCover(row.video_url);
  let update=supabase!.from('videos').update({thumbnail_url:cover}).eq('id',row.id).eq('video_url',row.video_url);
  update=row.thumbnail_url===null?update.is('thumbnail_url',null):update.eq('thumbnail_url',row.thumbnail_url??'');
  const {data,error}=await update.select('id,video_url,thumbnail_url').maybeSingle();if(error)throw error;
  return data as {id:string;video_url:string;thumbnail_url:string}|null;
 })().finally(()=>repairs.delete(row.id));repairs.set(row.id,work);return work;
}
