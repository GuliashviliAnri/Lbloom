import {revalidateTag} from 'next/cache';
import {createClient} from '@supabase/supabase-js';
import {supabaseUrl,supabasePublishableKey} from '@/lib/supabase-config';
import {isAdminTable,tableTags} from '@/lib/catalog-tags';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
// Admin edits are written straight to Supabase from the browser. Afterwards the admin page calls
// this endpoint so cached public pages for the changed sections are rebuilt on the next visit.
// Access uses the caller's own Supabase session: Auth verifies the token and RLS on `admins`
// only returns the row for an administrator.
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Invalid origin'},{status:403,headers});
 const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
 if(!token)return Response.json({error:'Unauthorized'},{status:401,headers});
 let tables:unknown;
 try{const raw=await request.text();if(raw.length>1000)throw new Error('Too large');tables=JSON.parse(raw)?.tables;}
 catch{return Response.json({error:'Invalid request'},{status:400,headers});}
 if(!Array.isArray(tables)||!tables.length||!tables.every(isAdminTable))return Response.json({error:'Invalid request'},{status:400,headers});
 try{
  const db=createClient(supabaseUrl,supabasePublishableKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{headers:{Authorization:'Bearer '+token}}});
  const {data:{user},error}=await db.auth.getUser(token);
  if(error||!user)return Response.json({error:'Unauthorized'},{status:401,headers});
  const admin=await db.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();
  if(admin.error||!admin.data)return Response.json({error:'Forbidden'},{status:403,headers});
 }catch{return Response.json({error:'Unavailable'},{status:503,headers});}
 const tags=[...new Set(tables.flatMap(tableTags))];
 for(const tag of tags)revalidateTag(tag,{expire:0});
 return Response.json({revalidated:tags},{headers});
}
