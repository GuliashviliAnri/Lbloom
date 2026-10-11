import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
const exports={};
runInNewContext(ts.transpileModule(readFileSync(new URL('../lib/video-source.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,URL,URLSearchParams});
const {facebookVideoUrl,facebookEmbedUrl,validVideoUrl}=exports;
test('Facebook reels and videos normalize to safe canonical URLs',()=>{
 assert.equal(facebookVideoUrl('https://m.facebook.com/reel/123456/?mibextid=abc'),'https://www.facebook.com/reel/123456');
 assert.equal(facebookVideoUrl('https://www.facebook.com/l.bloom.eliava/videos/98765/'),'https://www.facebook.com/watch/?v=98765');
 assert.equal(facebookVideoUrl('https://www.facebook.com/watch/?v=98765&tracking=foo'),'https://www.facebook.com/watch/?v=98765');
 assert.equal(facebookVideoUrl('https://www.facebook.com/share/r/AbC123/?mibextid=x'),'https://www.facebook.com/share/r/AbC123/');
 const embed=new URL(facebookEmbedUrl('https://www.facebook.com/reel/123456/'));
 assert.equal(embed.origin,'https://www.facebook.com');assert.equal(embed.pathname,'/plugins/video.php');
 assert.equal(embed.searchParams.get('href'),'https://www.facebook.com/reel/123456');assert.equal(embed.searchParams.get('autoplay'),'false');
});
test('untrusted iframe hosts, credentials and non-video Facebook pages are rejected',()=>{
 for(const url of ['javascript:alert(1)','https://facebook.com.evil.test/reel/123','https://evil.test/reel/123','https://user:pass@facebook.com/reel/123','http://facebook.com/reel/123','https://www.facebook.com/l.bloom.eliava','https://www.facebook.com/plugins/video.php?href=evil','https://facebook.com/reel/not-a-number','https://facebook.com:8443/reel/123']){
  assert.equal(facebookVideoUrl(url),null);assert.equal(facebookEmbedUrl(url),null);
 }
});
test('uploaded video and signed direct file links stay supported',()=>{
 assert.ok(validVideoUrl('https://example.com/video.mp4?token=abc'));
 assert.ok(validVideoUrl('https://example.com/VIDEO.WEBM'));
 assert.ok(validVideoUrl('https://www.facebook.com/reel/123'));
 assert.equal(validVideoUrl('https://youtube.com/watch?v=123'),false);
 assert.equal(validVideoUrl('data:text/html,test'),false);
 assert.equal(validVideoUrl('https://www.facebook.com/not-a-video.mp4'),false);
});

test('Facebook footer action uses one blue logo button beside the view count',async()=>{
 const {createRequire}=await import('node:module');const require=createRequire(import.meta.url);
 const React=await import('react');const {renderToStaticMarkup}=await import('react-dom/server');
 function compile(path,deps={}){const exports={};runInNewContext(ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,URL,URLSearchParams,require:name=>deps[name]??require(name)});return exports;}
 const cover=compile('../lib/facebook-cover.ts',{'./video-source':exports});
 const fb=compile('../components/facebook-video.tsx',{'@/lib/video-source':exports,'./use-video-aspect':{default:()=>16/9},'./use-embedded-fullscreen':{default:()=>false}});
 const social=compile('../components/social-links.tsx');
 const Player=compile('../components/video-player.tsx',{'./facebook-video':fb,'@/lib/video-source':exports,'@/lib/supabase':{supabase:null},'@/lib/facebook-cover':cover,'./social-links':social}).default;
 const video={id:'test',title:'Horizontal reel',video_url:'https://www.facebook.com/reel/123',thumbnail_url:'https://example.com/cover.jpg',duration:'0:30'};
 const html=renderToStaticMarkup(React.createElement(Player,{video}));
 assert.ok(html.includes('video-facebook-button'));assert.ok(html.includes('Facebook-ზე ნახვა'));
 assert.equal((html.match(/<a /g)||[]).length,1);assert.ok(html.indexOf('video-player-meta')<html.indexOf('video-facebook-button'));
 assert.ok(html.includes('--video-ratio:1.777'));assert.ok(!html.includes('Facebook-ზე გახსნა'));
 const preview=renderToStaticMarkup(React.createElement(fb.default,{url:video.video_url,title:video.title,preview:true}));
 assert.ok(preview.includes("fullscreen &#x27;none&#x27;"));assert.ok(!preview.includes('allowFullScreen=')&&!preview.includes('allowfullscreen=""'));assert.ok(preview.includes('allowfullscreen=false'));assert.ok(preview.includes('loading="lazy"'));assert.ok(preview.includes('tabindex="-1"'));assert.ok(!preview.includes('<a '));
});

test('mobile fullscreen permission stays off in portrait and landscape; desktop retains it',()=>{
 for(const [width,fine,hover,expected] of [[375,false,false,false],[844,false,false,false],[1440,true,true,true],[1024,false,false,false]]){
  const result={};runInNewContext(ts.transpileModule(readFileSync(new URL('../components/use-embedded-fullscreen.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:result,window:{innerWidth:width,matchMedia:query=>({matches:query.includes('pointer')?fine:hover})},require:()=>({useSyncExternalStore:(_subscribe,getSnapshot)=>getSnapshot()})});assert.equal(result.default(),expected);
 }
});
