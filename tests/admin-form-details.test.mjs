import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {createRequire} from 'node:module';
import {renderToStaticMarkup} from 'react-dom/server';
import React from 'react';
import ts from 'typescript';
const require=createRequire(import.meta.url);
function compile(file,deps={}){const exports={};runInNewContext(ts.transpileModule(readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require:n=>deps[n]??require(n)});return exports;}
const measurements=compile('../lib/measurements.ts');
test('furniture dimensions use length, width and height and retain existing measurements',()=>{
 const result=measurements.parseDimensions('2 სკამი · სიმაღლე: 80 სმ · სიგანე: 60 სმ · სიღრმე: 55 სმ');
 assert.equal(result.length,'55');assert.equal(result.width,'60');assert.equal(result.height,'80');assert.equal(result.details,'2 სკამი');
 assert.equal(measurements.formatDimensions(result),'2 სკამი · სიგრძე: 55 სმ · სიგანე: 60 სმ · სიმაღლე: 80 სმ');
 const modern=measurements.parseDimensions('სიგრძე: 120 სმ · სიგანე: 70 სმ · სიმაღლე: 75 სმ');
 assert.equal(modern.details,'');assert.equal(modern.length,'120');assert.equal(modern.height,'75');
});
test('furniture form contains only three measurement fields in the requested order',()=>{
 const {FurnitureMeasurements}=compile('../components/admin-measurements.tsx',{'@/lib/measurements':measurements});
 const html=renderToStaticMarkup(React.createElement(FurnitureMeasurements,{value:'',onChange:()=>{}}));
 assert.equal((html.match(/<input/g)||[]).length,3);
 assert.ok(html.indexOf('სიგრძე')<html.indexOf('სიგანე'));assert.ok(html.indexOf('სიგანე')<html.indexOf('სიმაღლე'));
 assert.ok(!html.includes('კომპლექტაცია'));assert.ok(!html.includes('სიღრმე'));
});
test('video duration is derived from metadata, including long clips and invalid metadata',()=>{
 const {formatVideoDuration}=compile('../lib/video-duration.ts');
 assert.equal(formatVideoDuration(38.4),'0:38');assert.equal(formatVideoDuration(119.8),'2:00');assert.equal(formatVideoDuration(3601),'60:01');assert.equal(formatVideoDuration(NaN),'');assert.equal(formatVideoDuration(Infinity),'');assert.equal(formatVideoDuration(-1),'');
});
