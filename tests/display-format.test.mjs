import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';

const output=ts.transpileModule(readFileSync(new URL('../lib/display-format.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const api={};
// No Georgian locale support is available in this runtime; formatting must
// still produce identical Georgian text rather than rely on Intl fallbacks.
runInNewContext(output,{exports:api,Date,Intl:undefined});

test('Supabase timestamp has identical Georgian text in every host timezone',()=>{
 const previous=process.env.TZ;
 try {
  for(const zone of ['UTC','Asia/Tbilisi','America/Los_Angeles']){
   process.env.TZ=zone;
   const date=api.formatStoryDate('2026-10-09T15:07:24.747Z');
   assert.equal(date.label,'9 ოქტომბერი, 2026');
   assert.equal(date.dateTime,'2026-10-09T15:07:24.747Z');
  }
 } finally { if(previous===undefined)delete process.env.TZ;else process.env.TZ=previous; }
});
test('Tbilisi midnight and year boundaries are respected',()=>{
 assert.equal(api.formatStoryDate('2026-10-09T20:00:00Z').label,'10 ოქტომბერი, 2026');
 assert.equal(api.formatStoryDate('2026-12-31T21:00:00Z').label,'1 იანვარი, 2027');
 assert.equal(api.formatStoryDate('2024-02-28T21:00:00Z').label,'29 თებერვალი, 2024');
});
test('equivalent offsets and timestamps without an offset are stable',()=>{
 assert.equal(api.formatStoryDate('2026-10-09T19:07:24.747+04:00').label,'9 ოქტომბერი, 2026');
 assert.equal(api.formatStoryDate('2026-10-09T20:00:00').label,'10 ოქტომბერი, 2026');
});
test('missing and invalid timestamps do not render a date',()=>{
 assert.equal(api.formatStoryDate(),null);
 assert.equal(api.formatStoryDate(''),null);
 assert.equal(api.formatStoryDate('invalid'),null);
});
test('Georgian currency formatting is stable without ICU',()=>{
 assert.equal(api.formatPrice(1100),'1\u00a0100');
 assert.equal(api.formatPrice(19.99),'19,99');
 assert.equal(api.formatPrice(0),'0');
 assert.equal(api.formatPrice(28.5),'28,5');
});
