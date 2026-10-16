import {createClient} from '@supabase/supabase-js';
import {supabaseUrl,supabasePublishableKey} from '@/lib/supabase-config';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
function database(){return createClient(supabaseUrl,supabasePublishableKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})}
export async function GET(request:Request){
 const id=new URL(request.url).searchParams.get('id')||'';
 if(!uuid.test(id))return Response.json({error:'Invalid story'},{status:400,headers});
 try{
  const db=database();const story=await db.from('garden_stories').select('id').eq('id',id).eq('is_published',true).maybeSingle();
  if(story.error)return Response.json({error:'Unavailable'},{status:503,headers});
  if(!story.data)return Response.json({error:'Story not found'},{status:404,headers});
  const {data,error}=await db.from('lbloom_story_view_counts').select('views').eq('story_id',id).maybeSingle();
  if(error)return Response.json({error:'Unavailable'},{status:503,headers});
  return Response.json({views:Number(data?.views??0)},{headers});
 }catch{return Response.json({error:'Unavailable'},{status:503,headers})}
}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Invalid origin'},{status:403,headers});
 try{
  const raw=await request.text();if(raw.length>1000)return Response.json({error:'Invalid visit'},{status:400,headers});
  const body=JSON.parse(raw);const id=body?.id;const visitor=body?.visitor;
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tbilisi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  if(typeof id!=='string'||!uuid.test(id)||typeof visitor!=='string'||visitor.slice(0,11)!==day+'.'||!uuid.test(visitor.slice(11)))return Response.json({error:'Invalid visit'},{status:400,headers});
  const {data,error}=await database().rpc('lbloom_record_story_view',{p_story_id:id,p_visitor:visitor.slice(11)});
  if(error)return Response.json({error:error.code==='P0002'?'Story not found':'Unavailable'},{status:error.code==='P0002'?404:503,headers});
  const views=Number(data);if(data===null||!Number.isSafeInteger(views)||views<0)return Response.json({error:'Unavailable'},{status:503,headers});
  return Response.json({views},{headers});
 }catch{return Response.json({error:'Invalid visit'},{status:400,headers})}
}
