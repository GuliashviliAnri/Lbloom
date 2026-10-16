import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
const api={};runInNewContext(ts.transpileModule(readFileSync('lib/rich-text.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:api,Set});
test('existing plain text stays text and keeps paragraphs and line breaks',()=>{assert.equal(api.richTextHtml('ერთი\nხაზი\n\n<strong>ტექსტი</strong>'),'<p>ერთი<br>ხაზი</p><p>&lt;strong&gt;ტექსტი&lt;/strong&gt;</p>')});
test('formatting round trips without unsafe attributes or tags',()=>{const html='<h2>სათაური</h2><p><strong>გამუქება</strong> <em>დახრა</em><u>ხაზი</u></p><ul><li>ერთი</li></ul>';assert.equal(api.richTextHtml(api.richTextMarker+html),html);assert.equal(api.sanitizeRichHtml('<img src=x onerror=alert(1)><p onclick="alert(1)">ტექსტი</p><script>alert(1)</script>'),'<p>ტექსტი</p>alert(1)')});
test('only explicit HTTP links survive; entity-based schemes and style are rejected',()=>{for(const href of ['javascript:alert(1)','java&#115;cript:alert(1)','data:text/html,x','//example.com'])assert.equal(api.sanitizeRichHtml(`<a href="${href}" onclick="x()">ბმული</a>`),'<a>ბმული</a>');assert.equal(api.sanitizeRichHtml('<a href="https://lbloom.ge/?a=1&amp;b=2" style="color:red">ბმული</a>'),'<a href="https://lbloom.ge/?a=1&amp;b=2" target="_blank" rel="noopener noreferrer">ბმული</a>')});
