import {facebookVideoUrl} from '@/lib/video-source';
import {supabaseUrl,supabasePublishableKey} from '@/lib/supabase-config';
export async function GET(request:Request){
 const url=facebookVideoUrl(new URL(request.url).searchParams.get('url')||'');if(!url)return new Response(null,{status:400});
 try{
  const response=await fetch(supabaseUrl+'/functions/v1/facebook-cover',{method:'POST',headers:{apikey:supabasePublishableKey,'Content-Type':'application/json'},body:JSON.stringify({url,mode:'video'}),signal:AbortSignal.timeout(40000)});
  if(!response.ok)throw new Error('Video unavailable');
  const {src}=await response.json();const target=new URL(src);
  if(target.protocol!=='https:'||target.username||target.password||target.port||!target.hostname.endsWith('.fbcdn.net')||!/\.mp4$/i.test(target.pathname))throw new Error('Untrusted media');
  // Playback and range requests go directly to Facebook's CDN; no video is uploaded or buffered here.
  return new Response(null,{status:302,headers:{Location:target.href,'Cache-Control':'no-store'}});
 }catch{return new Response(null,{status:502,headers:{'Cache-Control':'no-store'}});}
}
