import {supabase} from './supabase';
import type {AdminTable} from './catalog-tags';
/** Expires the cached public pages that show these tables. The admin save itself already succeeded,
 * so a failure here is only logged; the pages then refresh on their normal daily schedule. */
export async function refreshPublicPages(...tables:AdminTable[]):Promise<void>{
 if(!supabase||!tables.length)return;
 try{
  const {data:{session}}=await supabase.auth.getSession();
  if(!session)return;
  const response=await fetch('/api/revalidate',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},body:JSON.stringify({tables}),signal:AbortSignal.timeout(12000)});
  if(!response.ok)console.warn('Public page refresh failed',response.status);
 }catch(error){console.warn('Public page refresh failed',error);}
}
