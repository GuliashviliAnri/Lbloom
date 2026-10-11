import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
function compile(file,deps={}){const exports={};runInNewContext(ts.transpileModule(readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,URL,Date,Map,process:{env:{}},require:n=>deps[n]??require(n)});return exports;}
const seo=compile('../lib/seo.ts',{'./story-sharing':{publicSiteOrigin:'https://lbloom.ge'},'./pricing':{hasDiscount:(p,s)=>typeof p==='number'&&typeof s==='number'&&s<p}});
const product={id:'1',name:'ტუია',slug:'thuja',description:'მარადმწვანე მცენარე',price:20,sale_price:15,image_url:'/photo.webp',gallery_images:[],is_in_stock:true,created_at:'2026-10-01T10:00:00Z'};
test('product metadata uses each product title, description, cover, and canonical public URL',()=>{
 const data=seo.productMetadata(product);assert.equal(data.title,product.name);assert.equal(data.description,product.description);assert.equal(data.alternates.canonical,'https://lbloom.ge/plants/thuja');assert.equal(data.openGraph.images[0].url,'https://lbloom.ge/photo.webp');
 assert.equal(seo.productMetadata(product,true).alternates.canonical,'https://lbloom.ge/furniture/thuja');
 assert.equal(seo.pageMetadata('LBLOOM — საბაღე ცენტრი','ტექსტი','/').title.absolute,'LBLOOM — საბაღე ცენტრი');
});
test('product structured data uses sale price in GEL and never invents review scores or request-only prices',()=>{
 const data=seo.productData(product);assert.equal(data.offers.price,'15');assert.equal(data.offers.priceCurrency,'GEL');assert.equal(data.offers.availability,'https://schema.org/InStock');assert.equal(data.aggregateRating,undefined);
 assert.equal(seo.productData({...product,price:null,sale_price:null}).offers,undefined);
 assert.equal(seo.productData({...product,is_in_stock:false}).offers.availability,undefined);
});
test('business schema preserves known contact details without creating an address',()=>{
 const settings={phone:'574 240 286',address:'მისამართის დასაზუსტებლად დაგვიკავშირდით',facebook_url:'https://facebook.com/l.bloom.eliava',instagram_url:'',google_maps_url:'https://maps.app.goo.gl/test'};
 const data=seo.businessData(settings);assert.equal(data.telephone,'+995574240286');assert.equal(data.address,undefined);assert.equal(data['@type'],'GardenStore');
 assert.equal(seo.businessData({...settings,address:'ელიავას ბაზრობა'}).address.streetAddress,'ელიავას ბაზრობა');
});
test('JSON-LD safely encodes admin-entered text and article dates remain truthful',()=>{
 const data=seo.serializeJsonLd({name:'</script><script>alert(1)</script>'});assert.ok(!data.includes('<'));assert.equal(JSON.parse(data).name,'</script><script>alert(1)</script>');
 const article=seo.articleData({title:'ამბავი',slug:'story',excerpt:'რჩევები',body:'ტექსტი',image_url:'',created_at:'invalid'});assert.equal(article.image,undefined);assert.equal(article.datePublished,undefined);assert.equal(article.author,undefined);
});
test('sitemap lists products, furniture, services and only published stories, excluding admin and duplicate location',()=>{
 const api=compile('../lib/seo-sitemap.ts',{'./seo':seo});
 const entries=api.sitemapEntries({products:[product,product],furniture:[{...product,slug:'chair'}],services:[{slug:'design'}],garden_stories:[{slug:'new-story',is_published:true,updated_at:'2026-10-10T10:00:00Z'},{slug:'draft',is_published:false}]});
 const urls=Array.from(entries,e=>e.url);assert.ok(urls.includes('https://lbloom.ge/plants/thuja'));assert.ok(urls.includes('https://lbloom.ge/furniture/chair'));assert.ok(urls.includes('https://lbloom.ge/services/design'));assert.ok(urls.includes('https://lbloom.ge/garden-stories/new-story'));assert.ok(!urls.some(url=>/admin|draft|location/.test(url)));assert.equal(urls.filter(url=>url.endsWith('/plants/thuja')).length,1);
 assert.equal(entries.find(e=>e.url.endsWith('/new-story')).lastModified,'2026-10-10T10:00:00.000Z');assert.equal(entries.find(e=>e.url.endsWith('/plants/thuja')).lastModified,undefined);
});
test('robots allows public crawling and advertises the canonical sitemap',()=>{
 const {default:robots}=compile('../app/robots.ts',{'@/lib/seo':seo});const data=robots();assert.equal(data.rules.allow,'/');assert.equal(data.sitemap,'https://lbloom.ge/sitemap.xml');
});
test('sitemap refuses seed data when the live database is unavailable',async()=>{
 const {default:sitemap}=compile('../app/sitemap.ts',{'@/lib/catalog':{catalog:async()=>({connected:false})},'@/lib/seo-sitemap':{sitemapEntries:()=>[]}});
 await assert.rejects(sitemap,/Live catalog unavailable/);
});
