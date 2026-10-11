import {facebookVideoUrl} from '@/lib/video-source';
import {supabaseUrl,supabasePublishableKey} from '@/lib/supabase-config';
export async function GET(request:Request){
 const url=facebookVideoUrl(new URL(request.url).searchParams.get('url')||'');if(!url)return new Response(null,{status:400});
 try{
  const response=await fetch(supabaseUrl+'/functions/v1/facebook-cover',{method:'POST',headers:{apikey:supabasePublishableKey,'Content-Type':'application/json'},body:JSON.stringify({url}),signal:AbortSignal.timeout(40000)});
  const type=response.headers.get('content-type')?.split(';')[0]||'';
  if(!response.ok||!['image/jpeg','image/png','image/webp'].includes(type))return new Response(null,{status:404,headers:{'Cache-Control':'no-store'}});
  return new Response(response.body,{headers:{'Content-Type':type,'Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'}});
 }catch{return new Response(null,{status:404,headers:{'Cache-Control':'no-store'}});}
}
