import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
function compile(file,deps){const exports={};runInNewContext(ts.transpileModule(readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require:n=>deps[n]??require(n)});return exports;}
function children(tree){return [tree,...(Array.isArray(tree)?tree:tree?.props?.children?[tree.props.children]:[]).flatMap(v=>Array.isArray(v)?v.flatMap(children):v&&typeof v==='object'?children(v):[])];}
test('home products page through four cards, keeping the fifth hidden until next, with correct boundaries',()=>{
 let state=0;
 const Pager=compile('../components/home-products.tsx',{react:{useId:()=> 'cards',useState:()=>[state,v=>{state=v}]},'./site':{ProductCard:()=>null},'./direction-icon':{default:()=>null}}).default;
 const items=Array.from({length:9},(_,i)=>({id:String(i+1)}));
 const render=()=>Pager({items});
 const cards=t=>children(t).filter(n=>n?.props?.item).map(n=>n.props.item.id);
 const buttons=t=>children(t).filter(n=>n?.type==='button');
 let tree=render();assert.deepEqual(cards(tree),['1','2','3','4']);assert.equal(buttons(tree)[0].props.disabled,true);
 buttons(tree)[1].props.onClick();tree=render();assert.deepEqual(cards(tree),['5','6','7','8']);
 buttons(tree)[1].props.onClick();tree=render();assert.deepEqual(cards(tree),['9']);assert.equal(buttons(tree)[1].props.disabled,true);
 buttons(tree)[0].props.onClick();assert.deepEqual(cards(render()),['5','6','7','8']);
});
test('four or fewer products need no page controls',()=>{
 const Pager=compile('../components/home-products.tsx',{react:{useId:()=> 'cards',useState:()=>[0,()=>{}]},'./site':{ProductCard:()=>null},'./direction-icon':{default:()=>null}}).default;
 assert.equal(children(Pager({items:[{id:'1'}],furniture:true})).filter(n=>n?.type==='button').length,0);
});
test('catalog includes unfeatured products beyond six and queries every content section newest first',async()=>{
 const calls=[];const data={products:Array.from({length:9},(_,i)=>({id:String(i),is_featured:false})),furniture:[],services:[],videos:[],garden_stories:[],site_settings:{id:1},advertisements:null};
 const db={from(table){const query={then(resolve){return Promise.resolve({data:data[table],error:null}).then(resolve)}};for(const method of ['select','order','eq','limit','returns','single','maybeSingle'])query[method]=(...args)=>{calls.push([table,method,...args]);return query};return query}};
 const api=compile('../lib/catalog.ts',{'@supabase/supabase-js':{createClient:()=>db},'./supabase-config':{supabaseUrl:'https://example.com',supabasePublishableKey:'public'},'./data':{settings:{}},'./advertisement':{advertisementFromResult:()=>null}});
 const result=await api.catalog('home');assert.equal(result.products.length,9);
 assert.equal(calls.some(c=>c[0]==='products'&&c[1]==='eq'&&c[2]==='is_featured'),false);
 assert.equal(calls.some(c=>c[0]==='products'&&c[1]==='limit'),false);
 for(const table of ['products','furniture','services','videos','garden_stories'])assert.ok(calls.some(c=>c[0]===table&&c[1]==='order'&&c[2]==='created_at'&&c[3].ascending===false));
 assert.ok(calls.some(c=>c[0]==='garden_stories'&&c[1]==='limit'&&c[2]===4));
});
test('home stories have two latest side cards and only four carousel slides',()=>{
 let index=3;const StoryCard=()=>null;
 const Stories=compile('../components/garden-stories.tsx',{react:{useState:()=>[index,()=>{}],useRef:()=>({current:null}),useEffect:()=>{},useSyncExternalStore:()=>false},'./direction-icon':{default:()=>null},'./responsive-image':{default:()=>null},'./story-date':{default:()=>null},'./site':{GardenStoryCard:StoryCard}}).default;
 const stories=Array.from({length:8},(_,i)=>({id:String(i),title:String(i),slug:String(i)}));
 const tree=Stories({stories,overview:true});
 assert.deepEqual(children(tree).filter(n=>n?.type===StoryCard).map(n=>n.props.story.id),['0','1']);
 const listing=Stories({stories,overview:false});
 assert.deepEqual(children(listing).filter(n=>n?.type===StoryCard).map(n=>n.props.story.id),stories.map(story=>story.id));
 const slides=children(tree).filter(n=>n?.type==='a');assert.equal(slides.length,2);assert.ok(slides.every(n=>['/garden-stories/3','/garden-stories/0'].includes(n.props.href)));
});
