import {createClient} from '@supabase/supabase-js';
import {supabaseUrl,supabasePublishableKey} from '@/lib/supabase-config';
import {catalog} from '@/lib/catalog';
import {parseGardenList,gardenTotal,type GardenProduct} from '@/lib/garden-list';
import {requestError,requestFingerprint,requestLines,normalizePhone,type RequestContact} from '@/lib/garden-requests';
export const dynamic='force-dynamic';
const responseHeaders={'Cache-Control':'no-store'};
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
async function digest(value:string){const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('')}
export async function POST(request:Request){
 const error=(message:string,status:number)=>Response.json({error:message},{status,headers:responseHeaders});
 if(request.headers.get('origin')!==new URL(request.url).origin)return error('მოთხოვნა დაუშვებელია.',403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return error('არასწორი ფორმატი.',415);
 if(Number(request.headers.get('content-length'))>24000)return error('მოთხოვნა ძალიან დიდია.',413);
 const gate=process.env.LBLOOM_ORDERS_SECRET;
 if(!gate)return error('შეკვეთების მიღება დროებით მიუწვდომელია.',503);
 try{
  const raw=await request.text();if(raw.length>24000)return error('მოთხოვნა ძალიან დიდია.',413);
  const input=JSON.parse(raw);if(!input||typeof input!=='object'||!Array.isArray(input.entries)||input.entries.length>100)return error('შეამოწმე პროდუქტების სია.',400);
  const contact=input.contact as RequestContact;
  if(!contact||['name','phone','delivery','city','address'].some(k=>typeof contact[k as keyof RequestContact]!=='string')||typeof contact.planting!=='boolean'||!['delivery','pickup'].includes(contact.delivery))return error('შეავსე საკონტაქტო ინფორმაცია.',400);
  if(contact.name.length>80||contact.phone.length>24||contact.city.length>100||contact.address.length>240)return error('შეამოკლე საკონტაქტო ინფორმაცია.',400);
  const invalid=requestError(contact);if(invalid)return error(invalid,400);
  if(input.consent!==true||input.website||!uuid.test(input.id||''))return error('გადაამოწმე ფორმის მონაცემები.',400);
  const entries=parseGardenList(JSON.stringify(input.entries));if(!entries.length||entries.length!==input.entries.length)return error('პროდუქტების რაოდენობა არასწორია.',400);
  const title=typeof input.title==='string'?input.title.trim():'ჩემი ეზოს სია';const note=typeof input.note==='string'?input.note.trim():'';
  if(title.length>80||note.length>600)return error('შეამოკლე სიის სახელი ან შენიშვნა.',400);
  const [plants,furniture]=await Promise.all([catalog('plants'),catalog('furniture')]);if(!plants.connected||!furniture.connected)return error('კატალოგი დროებით მიუწვდომელია.',503);
  const products:GardenProduct[]=[...plants.products.map(item=>({item,kind:'plant' as const})),...furniture.furniture.map(item=>({item,kind:'furniture' as const}))];
  const lines=requestLines(entries,products);if(lines.length!==entries.length)return error('სიაში არის მიუწვდომელი პროდუქტი. გადაამოწმე არჩევანი.',400);
  const normalized:RequestContact={...contact,name:contact.name.trim(),phone:normalizePhone(contact.phone),city:contact.delivery==='delivery'?contact.city.trim():'',address:contact.delivery==='delivery'?contact.address.trim():''};
  const totals=gardenTotal(entries,products);
  // CF supplies this address at its edge. Caller-supplied X-Forwarded-For is ignored.
  const address=request.headers.get('cf-connecting-ip')||'unknown-origin';
  const clientHash=await digest(gate+'|lbloom-ge|'+address);
  const fingerprint=await digest(requestFingerprint(entries,normalized,title,note));
  const order={id:input.id,title:title||'ჩემი ეზოს სია',note,contact:normalized,lines,total:totals.total,unknown:totals.unknown};
  const db=createClient(supabaseUrl,supabasePublishableKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const {data,error:failure}=await db.rpc('lbloom_submit_order',{p_gate:gate,p_client_hash:clientHash,p_fingerprint:fingerprint,p_order:order});
  if(failure){if(failure.code==='P0001')return error('ბოლო 30 წუთში უკვე გაიგზავნა 3 მოთხოვნა. სცადე მოგვიანებით.',429);return error('შენახვა ვერ მოხერხდა. სცადე ხელახლა.',503)}
  return Response.json({receipt:data},{headers:responseHeaders});
 }catch{return error('მოთხოვნა ვერ დამუშავდა. გადაამოწმე მონაცემები.',400)}
}
