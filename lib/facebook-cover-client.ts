import {facebookVideoUrl} from './video-source';
import {supabaseUrl,supabasePublishableKey} from './supabase-config';
export async function fetchFacebookCover(value:string,signal:AbortSignal):Promise<Blob>{
 const url=facebookVideoUrl(value);if(!url)throw new Error('Invalid Facebook video');
 const response=await fetch(supabaseUrl+'/functions/v1/facebook-cover',{
  method:'POST',headers:{apikey:supabasePublishableKey,'Content-Type':'application/json'},
  body:JSON.stringify({url,mode:'cover'}),signal,credentials:'omit'
 });
 if(!response.ok)throw new Error('Facebook-იდან ქავერის მიღება ვერ მოხერხდა ('+response.status+').');
 const type=response.headers.get('content-type')?.split(';')[0]||'';
 if(!['image/jpeg','image/png','image/webp'].includes(type)||Number(response.headers.get('content-length')||0)>5*1024*1024)throw new Error('Invalid cover');
 const blob=await response.blob();if(!blob.size||blob.size>5*1024*1024)throw new Error('Invalid cover');
 return blob;
}
