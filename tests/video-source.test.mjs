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
