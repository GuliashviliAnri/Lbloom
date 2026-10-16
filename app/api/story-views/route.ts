import {createClient} from '@supabase/supabase-js';
import {supabaseUrl,supabasePublishableKey} from '@/lib/supabase-config';

export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function database(){
 return createClient(supabaseUrl,supabasePublishableKey,{
  auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
 });
}

export async function GET(request:Request){
 const id=new URL(request.url).searchParams.get('id')||'';
 if(!uuid.test(id))
  return Response.json({error:'Invalid story'},{status:400,headers});
 try{
  const {data,error}=await database()
   .from('lbloom_story_view_counts')
   .select('views').eq('story_id',id).maybeSingle();
  if(error)throw error;
  return Response.json({views:Number(data?.views??0)},{headers});
 }catch{
  return Response.json({error:'Unavailable'},{status:503,headers});
 }
}

export async function POST(request:Request){
 if(request.headers.get('Origin')!==new URL(request.url).origin)
  return Response.json({error:'Invalid origin'},{status:403,headers});
 try{
  const body=await request.json() as {id?:unknown;visitor?:unknown};
  const id=typeof body.id==='string'?body.id:'';
  const visitor=typeof body.visitor==='string'?body.visitor:'';
  const match=visitor.match(/^\d{4}-\d{2}-\d{2}\.([0-9a-f-]{36})$/i);
  if(!uuid.test(id)||!match||!uuid.test(match[1]))
   return Response.json({error:'Invalid visit'},{status:400,headers});
  const {data,error}=await database().rpc('lbloom_record_story_view',{
   p_story_id:id,p_visitor:match[1]
  });
  if(error){
   if(error.code==='P0002')
    return Response.json({error:'Story not found'},{status:404,headers});
   throw error;
  }
  return Response.json({views:Number(data)},{headers});
 }catch{
  return Response.json({error:'Unavailable'},{status:503,headers});
 }
}
