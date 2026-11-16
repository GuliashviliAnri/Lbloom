import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
function compile(file,deps={}){const exports={};runInNewContext(ts.transpileModule(readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,require:n=>deps[n],Request,Response,URL});return exports;}
const tags=compile('../lib/catalog-tags.ts');
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');

test('every catalog scope is tagged with the sections it renders, always including site settings',()=>{
 assert.deepEqual([...tags.scopeTags('plants')],['catalog:plants','catalog:settings']);
 assert.deepEqual([...tags.scopeTags('settings')],['catalog:settings']);
 for(const scope of ['home','all'])assert.equal(tags.scopeTags(scope).length,7);
});

test('admin tables expire the matching public sections, and categories expire both catalogs',()=>{
 assert.deepEqual([...tags.tableTags('garden_stories')],['catalog:stories']);
 assert.deepEqual([...tags.tableTags('advertisements')],['catalog:advertisement']);
 assert.deepEqual([...tags.tableTags('categories')],['catalog:plants','catalog:furniture']);
 assert.equal(tags.isAdminTable('admins'),false);
 assert.equal(tags.isAdminTable('toString'),false);
 assert.equal(tags.isAdminTable('products'),true);
});

test('public pages are cached with ISR while admin, my-garden and API routes stay dynamic',()=>{
 const cached=['app/page.tsx','app/plants/page.tsx','app/plants/[slug]/page.tsx','app/furniture/page.tsx','app/furniture/[slug]/page.tsx','app/services/page.tsx','app/services/[slug]/page.tsx','app/garden-stories/page.tsx','app/garden-stories/[slug]/page.tsx','app/videos/page.tsx','app/contact/page.tsx','app/location/page.tsx','app/sitemap.ts'];
 for(const file of cached){const source=read('../'+file);assert.doesNotMatch(source,/force-dynamic/,file);assert.match(source,/export const revalidate=300;/,file);assert.doesNotMatch(source,/searchParams|cookies\(|headers\(/,file);}
 for(const file of ['app/plants/[slug]/page.tsx','app/furniture/[slug]/page.tsx','app/services/[slug]/page.tsx','app/garden-stories/[slug]/page.tsx'])assert.match(read('../'+file),/generateStaticParams/,file);
 for(const file of ['app/my-garden/page.tsx','app/api/revalidate/route.ts','app/api/story-views/route.ts','app/api/garden-orders/route.ts'])assert.match(read('../'+file),/force-dynamic/,file);
});

function revalidateRoute({user='u1',admin=true}={}){
 const expired=[];const tokens=[];
 const db={auth:{getUser:async token=>{tokens.push(token);return {data:{user:user&&token==='good'?{id:user}:null},error:null}}},from:()=>{const q={select:()=>q,eq:()=>q,maybeSingle:async()=>({data:admin?{user_id:user}:null,error:null})};return q}};
 const route=compile('../app/api/revalidate/route.ts',{'next/cache':{revalidateTag:(tag,profile)=>expired.push([tag,profile])},'@supabase/supabase-js':{createClient:()=>db},'@/lib/supabase-config':{supabaseUrl:'https://example.com',supabasePublishableKey:'public'},'@/lib/catalog-tags':tags});
 const call=(body,{token='good',origin='https://lbloom.ge'}={})=>route.POST(new Request('https://lbloom.ge/api/revalidate',{method:'POST',headers:{origin,...(token?{authorization:'Bearer '+token}:{})},body:JSON.stringify(body)}));
 return {call,expired,tokens};
}

test('revalidation endpoint expires only the changed sections for a verified administrator',async()=>{
 const {call,expired}=revalidateRoute();
 const response=await call({tables:['products','categories']});
 assert.equal(response.status,200);
 assert.deepEqual(JSON.parse(JSON.stringify(expired)),[['catalog:plants',{expire:0}],['catalog:furniture',{expire:0}]]);
});

test('revalidation endpoint rejects missing tokens, non-admins, foreign origins and unknown tables',async()=>{
 const anonymous=revalidateRoute();assert.equal((await anonymous.call({tables:['products']},{token:''})).status,401);
 const invalid=revalidateRoute();assert.equal((await invalid.call({tables:['products']},{token:'bad'})).status,401);
 const visitor=revalidateRoute({admin:false});assert.equal((await visitor.call({tables:['products']})).status,403);
 const foreign=revalidateRoute();assert.equal((await foreign.call({tables:['products']},{origin:'https://evil.example'})).status,403);
 const unknown=revalidateRoute();assert.equal((await unknown.call({tables:['admins']})).status,400);
 for(const r of [anonymous,invalid,visitor,foreign,unknown])assert.deepEqual(r.expired,[]);
});

test('catalog list does not read search params during render',()=>{
 assert.doesNotMatch(read('../components/catalog-list.tsx'),/useSearchParams/);
});

test('detail page params fall back to on-demand rendering when the catalog is unreachable',async()=>{
 const {staticSlugs}=compile('../lib/static-slugs.ts');
 assert.deepEqual(JSON.parse(JSON.stringify(await staticSlugs(async()=>[{slug:'a'},{slug:''}]))),[{slug:'a'}]);
 assert.equal((await staticSlugs(async()=>{throw new Error('offline')})).length,0);
});
