import {facebookVideoUrl} from '@/lib/video-source';
import {facebookCoverFromHtml} from '@/lib/facebook-cover';
async function limited(response:Response,max:number){
 if(!response.body)throw new Error('No body');const reader=response.body.getReader();const chunks:Uint8Array[]=[];let length=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>max)throw new Error('Too large');chunks.push(value);}}finally{await reader.cancel();}
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return bytes;
}
export async function GET(request:Request){
 const url=facebookVideoUrl(new URL(request.url).searchParams.get('url')||'');
 if(!url)return new Response(null,{status:400});
 try{
  let target=url;let page:Response|undefined;
  for(let i=0;i<4;i++){
   page=await fetch(target,{redirect:'manual',headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(12000)});
   if(page.status<300||page.status>=400)break;
   const next=new URL(page.headers.get('location')||'',target);if(next.protocol!=='https:'||!['www.facebook.com','facebook.com','m.facebook.com','web.facebook.com'].includes(next.hostname)||next.port||next.username||next.password)throw new Error('Redirect rejected');target=next.href;
  }
  if(!page?.ok)throw new Error('Unavailable');
  const image=facebookCoverFromHtml(new TextDecoder().decode(await limited(page,1500000)));if(!image)throw new Error('No image');
  const response=await fetch(image,{redirect:'error',signal:AbortSignal.timeout(12000)});
  const type=response.headers.get('content-type')?.split(';')[0]||'';if(!response.ok||!['image/jpeg','image/png','image/webp'].includes(type))throw new Error('Not an image');
  const bytes=await limited(response,5*1024*1024);
  return new Response(bytes,{headers:{'Content-Type':type,'Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'}});
 }catch{return new Response(null,{status:404,headers:{'Cache-Control':'no-store'}});}
}
