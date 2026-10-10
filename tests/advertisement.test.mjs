import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {createRequire} from 'node:module';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
const require=createRequire(import.meta.url);
function compile(file,dependencies={}){const exports={};const code=ts.transpileModule(readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;runInNewContext(code,{exports,URL,require:name=>dependencies[name]??require(name)});return exports;}
const api=compile('../lib/advertisement.ts');
const Banner=compile('../components/advertisement-banner.tsx',{'@/lib/advertisement':api}).default;
const ad={id:1,title:'LBLOOM-ის აქცია',image_url:'https://example.com/banner.webp',link_url:'https://example.com/offer',is_active:true};
test('only HTTP(S) and local page links are accepted',()=>{
 assert.equal(api.advertisementLink(' /plants '),'/plants');
 assert.equal(api.advertisementLink('https://example.com/offer'),'https://example.com/offer');
 for(const value of ['javascript:alert(1)','data:text/html,test','//evil.test','/\\evil.test','/\nevil.test','example.com',''])assert.equal(api.advertisementLink(value),null);
});
test('missing migration preserves the existing placeholder without replacing catalog content',()=>{
 assert.equal(api.advertisementFromResult(null,{code:'PGRST205'}),api.defaultAdvertisement);
 assert.equal(api.advertisementFromResult(null,{code:'42P01'}),api.defaultAdvertisement);
 assert.equal(api.advertisementFromResult(null,{code:'network'}),null);
 assert.equal(api.advertisementFromResult(null,null),null);
 assert.equal(api.advertisementFromResult(ad,null),ad);
});
test('a disabled ad stays hidden even when it has artwork and a link',()=>{
 const disabled={...ad,is_active:false};
 assert.equal(api.advertisementFromResult(disabled,null).is_active,false);
 assert.equal(renderToStaticMarkup(Banner({advertisement:disabled})), '');
 assert.equal(renderToStaticMarkup(Banner({advertisement:null})), '');
});
test('published artwork uses descriptive text and the configured safe destination',()=>{
 const html=renderToStaticMarkup(Banner({advertisement:ad}));
 assert.match(html,/href="https:\/\/example.com\/offer"/);
 assert.match(html,/rel="noopener noreferrer"/);
 assert.match(html,/alt="LBLOOM-ის აქცია"/);
 assert.match(html,/src="https:\/\/example.com\/banner.webp"/);
});
test('plain text fallback and non-clickable ads render without a link',()=>{
 const html=renderToStaticMarkup(Banner({advertisement:{...api.defaultAdvertisement,link_url:'javascript:alert(1)'}}));
 assert.match(html,/რეკლამის ადგილი/);
 assert.doesNotMatch(html,/<a /);
});
