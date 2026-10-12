import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {runInNewContext} from 'node:vm';import {createRequire} from 'node:module';import ts from 'typescript';
const require=createRequire(import.meta.url);
const compile=path=>ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const videoSource={};runInNewContext(compile('../lib/video-source.ts'),{exports:videoSource,URL,URLSearchParams});
const config={supabaseUrl:'https://project.supabase.co',supabasePublishableKey:'public-key'};
const cdn='https://video.xx.fbcdn.net/test.mp4?expires=fresh';
function resolver(fetch){const exports={};runInNewContext(compile('../lib/facebook-playback.ts'),{exports,fetch,URL,AbortController,DOMException,setTimeout,clearTimeout,require:name=>name==='./video-source'?videoSource:config});return exports;}
test('browser requests a fresh source directly from Supabase with canonical URL and public apikey',async()=>{let request;const api=resolver(async(url,options)=>{request={url,options};return{ok:true,json:async()=>({src:cdn})};});const signal=new AbortController().signal;assert.equal(await api.resolveFacebookPlayback('https://m.facebook.com/reel/123/?tracking=foo',signal),cdn);assert.equal(request.url,'https://project.supabase.co/functions/v1/facebook-cover');assert.deepEqual(JSON.parse(request.options.body),{url:'https://www.facebook.com/reel/123',mode:'video'});assert.equal(request.options.headers.apikey,'public-key');assert.equal(request.options.credentials,'omit');assert.equal(request.options.cache,'no-store');assert.equal(request.options.signal,signal);});
test('untrusted media, failed responses and non-Facebook input fail safely',async()=>{const invalid=['https://fbcdn.net.evil.test/test.mp4','http://video.xx.fbcdn.net/test.mp4','https://user:pass@video.xx.fbcdn.net/test.mp4','https://video.xx.fbcdn.net:8443/test.mp4','https://video.xx.fbcdn.net/test.html',null];for(const src of invalid){const api=resolver(async()=>({ok:true,json:async()=>({src})}));assert.equal(api.trustedFacebookMp4(src),null);await assert.rejects(api.resolveFacebookPlayback('https://facebook.com/reel/123',new AbortController().signal));}await assert.rejects(resolver(async()=>({ok:false})).resolveFacebookPlayback('https://facebook.com/reel/123',new AbortController().signal));let called=false;await assert.rejects(resolver(async()=>{called=true;}).resolveFacebookPlayback('https://example.com/test.mp4',new AbortController().signal));assert.equal(called,false);});
test('player loads inline after metadata arrives, retries a fresh request and cancels on close',async()=>{
 const exports={},states=[],refs=[],effects=[],requests=[];let stateIndex=0,refIndex=0,effectIndex=0,ready=null;
 const react={useState:initial=>{const i=stateIndex++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return[states[i],value=>states[i]=typeof value==='function'?value(states[i]):value];},useRef:value=>refs[refIndex++]??(refs[refIndex-1]={current:value}),useEffect:(fn,deps)=>{const i=effectIndex++;if(!effects[i]||deps.some((d,j)=>d!==effects[i].deps[j])){effects[i]?.cleanup?.();effects[i]={deps,fn};}}};
 const resolveFacebookPlayback=(url,signal)=>new Promise((resolve,reject)=>requests.push({url,signal,resolve,reject}));
 const deps={'react':react,'@/lib/video-source':videoSource,'@/lib/facebook-playback':{preloadFacebookPlayback:resolveFacebookPlayback,preparedFacebookPlayback:()=>ready,forgetFacebookPlayback(){}},'@/lib/facebook-cover':{automaticVideoCover:()=>''},'./use-video-aspect':{default:()=>16/9},'./social-links':{FacebookIcon:()=>null},'@/lib/supabase':{supabase:null}};
 runInNewContext(compile('../components/video-player.tsx'),{exports,AbortController,setTimeout,clearTimeout,require:name=>deps[name]??require(name)});
 const video={id:'test',video_url:'https://facebook.com/reel/123',thumbnail_url:'https://example.com/cover.jpg',title:'Test'};
 function render(){stateIndex=refIndex=effectIndex=0;const view=exports.default({video});for(const effect of effects)if(effect.fn){const fn=effect.fn;effect.fn=null;effect.cleanup=fn();}return view;}
 const player=view=>view.props.children[0].props.children;
 let view=render();assert.equal(player(view).type,'video');assert.equal(player(view).props.src,undefined);assert.equal(player(view).props.poster,video.thumbnail_url);assert.equal(requests.length,1);
 requests[0].resolve(cdn);await new Promise(resolve=>setImmediate(resolve));view=render();assert.equal(player(view).type,'video');assert.equal(player(view).props.src,cdn);assert.equal(player(view).props.playsInline,true);
 player(view).props.onError();view=render();assert.equal(player(view).type,'div');player(view).props.children[2].props.onClick();render();assert.equal(requests.length,2);assert.equal(requests[0].signal.aborted,true);assert.equal(requests[1].signal.aborted,false);
 effects.forEach(effect=>effect.cleanup?.());assert.equal(requests[1].signal.aborted,true);requests[1].resolve(cdn+'2');await new Promise(resolve=>setImmediate(resolve));assert.equal(states[0],null);
 states.length=refs.length=effects.length=requests.length=0;ready=cdn;view=render();assert.equal(player(view).props.src,cdn);assert.equal(requests.length,0);
});

test('visible-card preparation and opening share one request, and every new video is prepared automatically',async()=>{
 let resolveRequest,calls=0;const api=resolver(async()=>{calls++;return new Promise(resolve=>{resolveRequest=()=>resolve({ok:true,json:async()=>({src:cdn})});});});
 const first=api.preloadFacebookPlayback('https://facebook.com/reel/123');const second=api.preloadFacebookPlayback('https://m.facebook.com/reel/123/?tracking=x');assert.equal(calls,1);resolveRequest();assert.equal(await first,cdn);assert.equal(await second,cdn);assert.equal(api.preparedFacebookPlayback('https://facebook.com/reel/123'),cdn);assert.equal(await api.preloadFacebookPlayback('https://facebook.com/reel/123'),cdn);assert.equal(calls,1);
 const newVideo=api.preloadFacebookPlayback('https://facebook.com/reel/456');assert.equal(calls,2);resolveRequest();await newVideo;assert.equal(api.preparedFacebookPlayback('https://facebook.com/reel/456'),cdn);
 api.forgetFacebookPlayback('https://facebook.com/reel/123');const retry=api.preloadFacebookPlayback('https://facebook.com/reel/123');assert.equal(calls,3);resolveRequest();await retry;
});
test('one cancelled player does not cancel shared preparation, and failures are retried',async()=>{
 let complete,calls=0;const api=resolver(async()=>{calls++;return new Promise(resolve=>{complete=()=>resolve({ok:true,json:async()=>({src:cdn})});});});
 const warm=api.preloadFacebookPlayback('https://facebook.com/reel/123');const controller=new AbortController();const waiting=api.preloadFacebookPlayback('https://facebook.com/reel/123',controller.signal);controller.abort();await assert.rejects(waiting,{name:'AbortError'});complete();assert.equal(await warm,cdn);assert.equal(calls,1);
 let attempts=0;const failing=resolver(async()=>({ok:++attempts>1,json:async()=>({src:cdn})}));await assert.rejects(failing.preloadFacebookPlayback('https://facebook.com/reel/123'));assert.equal(await failing.preloadFacebookPlayback('https://facebook.com/reel/123'),cdn);assert.equal(attempts,2);
});
test('prepared links expire after one minute and refresh before being used again',async()=>{
 const exports={};let now=100,calls=0;runInNewContext(compile('../lib/facebook-playback.ts'),{exports,URL,AbortController,DOMException,setTimeout,clearTimeout,Date:{now:()=>now},fetch:async()=>({ok:true,json:async()=>({src:cdn+ ++calls})}),require:name=>name==='./video-source'?videoSource:config});
 await exports.preloadFacebookPlayback('https://facebook.com/reel/123');assert.equal(exports.preparedFacebookPlayback('https://facebook.com/reel/123'),cdn+'1');now+=60001;assert.equal(exports.preparedFacebookPlayback('https://facebook.com/reel/123'),null);await exports.preloadFacebookPlayback('https://facebook.com/reel/123');assert.equal(exports.preparedFacebookPlayback('https://facebook.com/reel/123'),cdn+'2');
});
test('visible cards prepare their current URL, and newly added cards follow the same path',()=>{
 const exports={},calls=[];let observer,options,target,cleanup;
 class IntersectionObserver{constructor(callback,config){observer=callback;options=config;}observe(node){target=node;}disconnect(){}}
 const button={};runInNewContext(compile('../components/use-video-preparation.ts'),{exports,IntersectionObserver,require:name=>name==='react'?{useRef:()=>({current:button}),useEffect:fn=>{cleanup=fn();}}:name==='@/lib/video-source'?videoSource:{preloadFacebookPlayback:url=>{calls.push(url);return Promise.resolve(cdn);}}});
 let events=exports.default('https://facebook.com/reel/123');assert.equal(target,button);assert.equal(options.rootMargin,'160px');observer([{isIntersecting:false}]);assert.equal(calls.length,0);observer([{isIntersecting:true}]);assert.equal(calls[0],'https://facebook.com/reel/123');events.onFocus();assert.equal(calls.length,2);cleanup();
 events=exports.default('https://facebook.com/reel/999');observer([{isIntersecting:true}]);assert.equal(calls.at(-1),'https://facebook.com/reel/999');cleanup();
 events=exports.default('https://example.com/upload.mp4');events.onPointerEnter();assert.equal(calls.length,3);
});
