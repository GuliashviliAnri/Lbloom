import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {createRequire} from 'node:module';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
const require=createRequire(import.meta.url);
function compile(file,deps={}){const exports={};runInNewContext(ts.transpileModule(readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,URL,process:{env:{}},require:n=>deps[n]??require(n)});return exports;}
const api=compile('../lib/story-sharing.ts');
const story={id:'1',slug:'living-hedge',title:'ცოცხალი ღობე',excerpt:'მცენარეების შერჩევის რჩევები',body:'სტატიის ტექსტი',image_url:'/story-hedge.webp',is_published:true,sort_order:0,created_at:'2026-10-10T12:00:00Z'};
test('Facebook receives the same public article URL as canonical and Open Graph',()=>{
 const metadata=api.storySharingMetadata(story);
 const share=new URL(api.facebookStoryShareUrl(story.slug));
 assert.equal(share.origin,'https://www.facebook.com');
 assert.equal(share.searchParams.get('u'),metadata.alternates.canonical);
 assert.equal(metadata.openGraph.url,metadata.alternates.canonical);
 assert.equal(metadata.openGraph.type,'article');
 assert.equal(metadata.openGraph.title,story.title);
 assert.equal(metadata.openGraph.description,story.excerpt);
 assert.equal(metadata.openGraph.images[0].url,'https://lbloom.ge/story-hedge.webp');
 assert.equal(metadata.openGraph.images[0].alt,story.title);
});
test('uploaded cover URL is retained, with alternate public deployment origin support',()=>{
 const image='https://project.supabase.co/storage/v1/object/public/product-images/cover.jpg';
 const metadata=api.storySharingMetadata({...story,image_url:image},'https://www.lbloom.ge');
 assert.equal(metadata.openGraph.images[0].url,image);
 assert.equal(metadata.openGraph.url,'https://www.lbloom.ge/garden-stories/living-hedge');
});
test('empty introduction falls back to body and unsafe image URLs are excluded',()=>{
 const metadata=api.storySharingMetadata({...story,excerpt:'',image_url:'javascript:alert(1)'});
 assert.equal(metadata.description,story.body);
 assert.equal(metadata.openGraph.images.length,0);
 assert.equal(api.storyUrl('a?b&c','javascript:alert(1)'),'https://lbloom.ge/garden-stories/a%3Fb%26c');
});
test('share button is available in server HTML without the Facebook SDK',()=>{
 const Share=compile('../components/story-share.tsx',{'@/lib/story-sharing':api}).default;
 const html=renderToStaticMarkup(Share({slug:story.slug}));
 assert.match(html,/Facebook-ზე გაზიარება/);
 assert.match(html,/https:\/\/www.facebook.com\/sharer\/sharer.php\?u=/);
 assert.match(html,/target="_blank"/);
 assert.match(html,/rel="noopener noreferrer"/);
});
