import {facebookVideoUrl} from './video-source.ts';
type Image={bytes:Uint8Array;type:string};
/** Generate only a derived cover for an existing, publicly readable catalog video.
 * Inputs never choose a table, storage bucket, path, image URL or database field.
 * A conditional update preserves covers and video links edited by the administrator.
 */
export async function persistentCover(id:unknown,url:string,publicKey:string,load:()=>Promise<Image>):Promise<string>{
 if(typeof id!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))throw Error('Invalid video');
 const base=Deno.env.get('SUPABASE_URL')||'';const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
 if(!base||!service)throw Error('Storage unavailable');
 const anon=Deno.env.get('SUPABASE_ANON_KEY');
 const publicHeaders={apikey:publicKey,...(anon?{Authorization:'Bearer '+anon}:{})};
 async function read(){
  const query=new URLSearchParams({id:'eq.'+id,select:'id,video_url,thumbnail_url',limit:'1'});
  const response=await fetch(base+'/rest/v1/videos?'+query,{headers:publicHeaders,signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Error('Video unavailable');
  const rows=await response.json();const row=rows[0];
  if(!row||facebookVideoUrl(row.video_url)!==url)throw Error('Video unavailable');return row;
 }
 const row=await read();if(row.thumbnail_url?.trim())return row.thumbnail_url;
 const image=await load();
 if(!['image/jpeg','image/png','image/webp'].includes(image.type)||!image.bytes.length||image.bytes.length>5*1024*1024)throw Error('Invalid image');
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(url));
 const digest=Array.from(new Uint8Array(hash),byte=>byte.toString(16).padStart(2,'0')).join('').slice(0,16);
 const path='facebook/'+id+'-'+digest+'.'+image.type.split('/')[1];
 const headers={apikey:service,Authorization:'Bearer '+service};
 const upload=await fetch(base+'/storage/v1/object/video-thumbnails/'+path,{method:'POST',headers:{...headers,'Content-Type':image.type,'x-upsert':'true'},body:image.bytes,signal:AbortSignal.timeout(15000)});
 if(!upload.ok)throw Error('Cover upload failed');
 const src=base+'/storage/v1/object/public/video-thumbnails/'+path;
 const query=new URLSearchParams({id:'eq.'+id,video_url:'eq.'+row.video_url,thumbnail_url:row.thumbnail_url===null?'is.null':'eq.'+(row.thumbnail_url??'')});
 const update=await fetch(base+'/rest/v1/videos?'+query,{method:'PATCH',headers:{...headers,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({thumbnail_url:src}),signal:AbortSignal.timeout(10000)});
 if(!update.ok)throw Error('Cover save failed');
 const changed=await update.json();if(changed.length)return src;
 const current=await read();if(current.thumbnail_url?.trim())return current.thumbnail_url;
 throw Error('Video changed');
}
