import {persistentCover} from './cover-storage.ts';
import {facebookMp4Sources} from './video-parser.ts';
import {facebookVideoUrl} from './video-source.ts';
import {facebookCoverFromHtml} from './cover-parser.ts';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
function json(value:unknown,status=200){return Response.json(value,{status,headers:cors});}
function keys(name:string){try{return Object.values(JSON.parse(Deno.env.get(name)||'{}')) as string[];}catch{return [];}}
const videoCache=new Map<string,{src:string;until:number}>();
const publicKeys=[...keys('SUPABASE_PUBLISHABLE_KEYS'),Deno.env.get('SUPABASE_ANON_KEY')].filter(Boolean);
async function limited(response:Response,max:number){
 if(!response.body)throw new Error('No body');const reader=response.body.getReader();const chunks:Uint8Array[]=[];let length=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>max)throw new Error('Too large');chunks.push(value);}}finally{await reader.cancel();}
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return bytes;
}
async function coverImage(url:string){
  let target=url;let page:Response|undefined;
  for(let i=0;i<4;i++){
   page=await fetch(target,{redirect:'manual',headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(15000)});
   if(page.status<300||page.status>=400)break;
   const next=new URL(page.headers.get('location')||'',target);if(next.protocol!=='https:'||!['www.facebook.com','facebook.com','m.facebook.com','web.facebook.com'].includes(next.hostname)||next.port||next.username||next.password)throw new Error('Redirect rejected');target=next.href;
  }
  if(!page?.ok)throw new Error('Video unavailable');
  const image=facebookCoverFromHtml(new TextDecoder().decode(await limited(page,1500000)));if(!image)throw new Error('Cover unavailable');
  const response=await fetch(image,{redirect:'error',signal:AbortSignal.timeout(15000)});
  const type=response.headers.get('content-type')?.split(';')[0]||'';if(!response.ok||!['image/jpeg','image/png','image/webp'].includes(type))throw new Error('Invalid image');
  const bytes=await limited(response,5*1024*1024);
  return {bytes,type};
}
Deno.serve(async request=>{
 if(request.method==='OPTIONS')return new Response(null,{headers:cors});
 if(request.method!=='POST')return json({error:'method_not_allowed'},405);
 // Public metadata uses the project API key. Persistent covers are derived only
 // for publicly readable, matching catalog rows; arbitrary storage writes are rejected.
 if(!publicKeys.includes(request.headers.get('apikey')||''))return json({error:'unauthorized'},401);
 try{
  if(Number(request.headers.get('content-length')||0)>4096)return json({error:'too_large'},413);
  const body=new TextDecoder().decode(await limited(new Response(request.body),4096));
  const input=JSON.parse(body);const url=facebookVideoUrl(input.url||'');if(!url)return json({error:'invalid_video_url'},400);
  if(input.mode==='cover_url')return json({src:await persistentCover(input.video_id,url,request.headers.get('apikey')!,()=>coverImage(url))});
  if(input.mode==='video'){
   const cached=videoCache.get(url);if(cached&&cached.until>Date.now())return json({src:cached.src});
   const query=new URLSearchParams({href:url,show_text:'false',width:'560'});
   const embedded=await fetch('https://www.facebook.com/plugins/video.php?'+query,{redirect:'error',headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(15000)});
   if(!embedded.ok)throw new Error('Video unavailable');
   const html=new TextDecoder().decode(await limited(embedded,1500000));
   for(const src of facebookMp4Sources(html)){
    const check=await fetch(src,{method:'HEAD',redirect:'error',signal:AbortSignal.timeout(10000)});
    if(check.ok&&check.headers.get('content-type')?.split(';')[0]==='video/mp4'){
     if(videoCache.size>=100)videoCache.delete(videoCache.keys().next().value!);
     videoCache.set(url,{src,until:Date.now()+120000});return json({src});
    }
   }
   throw new Error('No compatible MP4');
  }
  if(input.mode&&input.mode!=='cover')return json({error:'invalid_mode'},400);
  const {bytes,type}=await coverImage(url);
  return new Response(bytes,{headers:{...cors,'Content-Type':type,'Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'}});
 }catch{return json({error:'cover_unavailable'},422);}
});
