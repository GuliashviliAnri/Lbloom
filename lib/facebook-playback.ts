import {facebookVideoUrl} from './video-source';
import {supabaseUrl,supabasePublishableKey} from './supabase-config';

export function trustedFacebookMp4(value:unknown):string|null{
 if(typeof value!=='string')return null;
 try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&url.hostname.endsWith('.fbcdn.net')&&/\.mp4$/i.test(url.pathname)?url.href:null;}catch{return null;}
}

/** Ask the existing public metadata function directly; static hosts need no Next API route. */
export async function resolveFacebookPlayback(value:string,signal:AbortSignal):Promise<string>{
 const url=facebookVideoUrl(value);if(!url)throw new Error('Invalid Facebook video');
 const response=await fetch(supabaseUrl+'/functions/v1/facebook-cover',{
  method:'POST',headers:{apikey:supabasePublishableKey,'Content-Type':'application/json'},
  body:JSON.stringify({url,mode:'video'}),signal,cache:'no-store',credentials:'omit'
 });
 if(!response.ok)throw new Error('Video source unavailable');
 const data=await response.json();const source=trustedFacebookMp4(data?.src);
 if(!source)throw new Error('Invalid video source');
 return source;
}

const prepared=new Map<string,{src:string;until:number}>();
const preparing=new Map<string,Promise<string>>();
export function preparedFacebookPlayback(value:string):string|null{
 const url=facebookVideoUrl(value);if(!url)return null;
 const entry=prepared.get(url);if(!entry)return null;
 if(entry.until<=Date.now()){prepared.delete(url);return null;}
 return entry.src;
}
export function forgetFacebookPlayback(value:string){const url=facebookVideoUrl(value);if(url)prepared.delete(url);}

/** Visible cards prepare metadata once; opening a player shares that request and uses a short-lived URL. */
export function preloadFacebookPlayback(value:string,signal?:AbortSignal):Promise<string>{
 const url=facebookVideoUrl(value);if(!url)return Promise.reject(new Error('Invalid Facebook video'));
 if(signal?.aborted)return Promise.reject(new DOMException('Aborted','AbortError'));
 const cached=preparedFacebookPlayback(url);if(cached)return Promise.resolve(cached);
 let pending=preparing.get(url);
 if(!pending){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),45000);
  pending=resolveFacebookPlayback(url,controller.signal).then(src=>{
   if(prepared.size>=32)prepared.delete(prepared.keys().next().value!);
   prepared.set(url,{src,until:Date.now()+60000});return src;
  }).finally(()=>{clearTimeout(timer);preparing.delete(url);});
  preparing.set(url,pending);
 }
 if(!signal)return pending;
 // A closed modal stops waiting without cancelling preparation used by another visible card.
 return new Promise((resolve,reject)=>{
  const abort=()=>reject(new DOMException('Aborted','AbortError'));
  signal.addEventListener('abort',abort,{once:true});
  pending!.then(src=>{signal.removeEventListener('abort',abort);if(!signal.aborted)resolve(src);},error=>{signal.removeEventListener('abort',abort);if(!signal.aborted)reject(error);});
 });
}
