import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
const exports={};
runInNewContext(ts.transpileModule(readFileSync(new URL('../lib/automatic-slug.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports});
const {automaticSlug}=exports;
test('Georgian names and punctuation produce valid unique database slugs without user input',()=>{
 for(const name of ['ოქროსფერი ტუია','ეზოს ავეჯი / ახალი!','🌿',' Élite Garden  ','ა'.repeat(150)]){
  const slug=automaticSlug(name,'12345678-1234-1234-1234-123456789012');
  assert.match(slug,/^[a-z0-9]+(-[a-z0-9]+)*$/);
 }
 assert.ok(automaticSlug('ტუია','a').startsWith('tuia-'));
 assert.notEqual(automaticSlug('ტუია','a'),automaticSlug('ტუია','b'));
});
