import {supabase} from './supabase';
import {facebookVideoUrl} from './video-source';
import {fetchFacebookCover} from './facebook-cover-client';
const uploads=new Map<string,Promise<string>>();
const repairs=new Map<string,Promise<{id:string;video_url:string;thumbnail_url:string}|null>>();
/** Uploads use the signed-in administrator's client and existing Storage policies. */
export function uploadFacebookCover(value:string):Promise<string>{
 const url=facebookVideoUrl(value);if(!supabase||!url)return Promise.reject(new Error('No cover storage'));
 const pending=uploads.get(url);if(pending)return pending;
 const work=(async()=>{
  const blob=await fetchFacebookCover(url,AbortSignal.timeout(45000));
  // The function already returns a validated image below 5 MB. Upload those bytes directly;
  // automatic covers do not need browser image decoding, canvas conversion or a File wrapper.
  const name=crypto.randomUUID()+'.'+blob.type.split('/')[1];
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{
   const upload=supabase!.storage.from('video-thumbnails').upload(name,blob,{contentType:blob.type,upsert:false});
   const deadline=new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('ქავერის ატვირთვას დრო გაუვიდა. სცადეთ ხელახლა.')),30000);});
   const {error}=await Promise.race([upload,deadline]);
   if(error)throw new Error('ქავერის საცავში ატვირთვა ვერ მოხერხდა: '+error.message);
  }finally{if(timer!==undefined)clearTimeout(timer);}
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
