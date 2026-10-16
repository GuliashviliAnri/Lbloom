import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync('drizzle/0000_misty_apocalypse.sql','utf8'));
const DB={prepare(sql){return {sql,args:[],bind(...args){this.args=args;return this},async first(){return sqlite.prepare(this.sql).get(...this.args)}}},async batch(statements){sqlite.exec('BEGIN');try{for(const s of statements)sqlite.prepare(s.sql).run(...s.args);sqlite.exec('COMMIT')}catch(e){sqlite.exec('ROLLBACK');throw e}}};
const route={};runInNewContext(ts.transpileModule(readFileSync('app/api/story-views/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:route,require(name){if(name==='cloudflare:workers')return {env:{DB}};if(name==='@/lib/catalog')return {catalog:async()=>({connected:true,garden_stories:[{id:'published-story'}]})};throw Error(name)},Response,Request,URL,Intl,Date});
const origin='https://lbloom.example';const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tbilisi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function post(id='published-story',visitor=day+'.11111111-1111-4111-8111-111111111111',source=origin){return route.POST(new Request(origin+'/api/story-views',{method:'POST',headers:{Origin:source,'Content-Type':'application/json'},body:JSON.stringify({id,visitor})}))}
test('daily visits increment atomically once per browser, while reads do not count',async()=>{
 assert.equal((await (await route.GET(new Request(origin+'/api/story-views?id=published-story'))).json()).views,0);
 assert.equal((await (await post()).json()).views,1);
 assert.equal((await (await post()).json()).views,1);
 assert.equal((await (await post('published-story',day+'.22222222-2222-4222-8222-222222222222')).json()).views,2);
 assert.equal((await (await route.GET(new Request(origin+'/api/story-views?id=published-story'))).json()).views,2);
});
test('cross-origin, unpublished and invalid visits cannot change totals',async()=>{
 assert.equal((await post('published-story',undefined,'https://other.example')).status,403);
 assert.equal((await post('draft-story')).status,404);
 assert.equal((await post('published-story','invalid')).status,400);
 assert.equal((await (await route.GET(new Request(origin+'/api/story-views?id=published-story'))).json()).views,2);
});
