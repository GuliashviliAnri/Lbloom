export const richTextMarker='<!--lbloom-rich-text-->';
export const richTextSizes=Array.from({length:63},(_,index)=>index+10);
export function escapeText(text:string){return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
const allowed=new Set(['p','div','br','strong','b','em','i','u','h2','h3','ul','ol','li','blockquote','a','span']);
// Only our small formatting vocabulary survives; attributes are rebuilt from scratch.
export function sanitizeRichHtml(html:string){
 return html.replace(/<!--[\s\S]*?-->/g,'').split(/(<[^>]*>)/g).map(token=>{
  if(!token.startsWith('<'))return token;
  const tag=token.match(/^<\s*(\/?)\s*([a-z0-9]+)\b[^>]*>$/i);if(!tag)return escapeText(token);
  const name=tag[2].toLowerCase();if(!allowed.has(name))return '';
  if(tag[1])return name==='br'?'':`</${name}>`;
  if(name==='span'){
   const style=token.match(/\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
   const size=(style?.[1]??style?.[2]??style?.[3]??'').match(/^\s*font-size\s*:\s*(\d{2})px\s*;?\s*$/i);
   return size&&richTextSizes.includes(Number(size[1]))?`<span style="font-size:${Number(size[1])}px">`:'<span>';
  }
  if(name!=='a')return `<${name}>`;
  const href=token.match(/\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const url=(href?.[1]??href?.[2]??href?.[3]??'').replace(/&amp;/g,'&');
  if(!/^https?:\/\/[^\s<>"']+$/i.test(url)||url.includes('&#'))return '<a>';
  return `<a href="${escapeText(url)}" target="_blank" rel="noopener noreferrer">`;
 }).join('');
}
export function richTextHtml(value:string){return value.startsWith(richTextMarker)?sanitizeRichHtml(value.slice(richTextMarker.length)):value.split(/\n\s*\n/).filter(Boolean).map(text=>`<p>${escapeText(text).replace(/\n/g,'<br>')}</p>`).join('')}
const blockTags=new Set(['p','div','h2','h3','ul','ol','blockquote']);
/** Splits sanitized story HTML into its top-level blocks (paragraphs, headings, lists). */
export function richTextBlocks(html:string):string[]{
 const blocks:string[]=[];let depth=0;let current='';
 for(const token of html.split(/(<[^>]*>)/g)){
  if(!token)continue;
  const tag=token.match(/^<(\/?)([a-z0-9]+)/i);const name=tag?.[2]?.toLowerCase()??'';
  if(tag&&blockTags.has(name)){if(tag[1])depth=Math.max(0,depth-1);else depth++;}
  current+=token;
  if(depth===0&&tag?.[1]&&blockTags.has(name)){blocks.push(current);current='';}
 }
 if(current.trim())blocks.push(current);
 return blocks;
}
/** Where the in-article photo goes: after the first half of the text. */
export function splitStoryBody(html:string):[string,string]{
 const blocks=richTextBlocks(html);
 if(blocks.length<2)return [html,''];
 const half=Math.ceil(blocks.length/2);
 return [blocks.slice(0,half).join(''),blocks.slice(half).join('')];
}
