export const richTextMarker='<!--lbloom-rich-text-->';
export function escapeText(text:string){return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
const allowed=new Set(['p','div','br','strong','b','em','i','u','h2','h3','ul','ol','li','blockquote','a']);
// Only our small formatting vocabulary survives; attributes are rebuilt from scratch.
export function sanitizeRichHtml(html:string){
 return html.replace(/<!--[\s\S]*?-->/g,'').split(/(<[^>]*>)/g).map(token=>{
  if(!token.startsWith('<'))return token;
  const tag=token.match(/^<\s*(\/?)\s*([a-z0-9]+)\b[^>]*>$/i);if(!tag)return escapeText(token);
  const name=tag[2].toLowerCase();if(!allowed.has(name))return '';
  if(tag[1])return name==='br'?'':`</${name}>`;
  if(name!=='a')return `<${name}>`;
  const href=token.match(/\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const url=(href?.[1]??href?.[2]??href?.[3]??'').replace(/&amp;/g,'&');
  if(!/^https?:\/\/[^\s<>"']+$/i.test(url)||url.includes('&#'))return '<a>';
  return `<a href="${escapeText(url)}" target="_blank" rel="noopener noreferrer">`;
 }).join('');
}
export function richTextHtml(value:string){return value.startsWith(richTextMarker)?sanitizeRichHtml(value.slice(richTextMarker.length)):value.split(/\n\s*\n/).filter(Boolean).map(text=>`<p>${escapeText(text).replace(/\n/g,'<br>')}</p>`).join('')}
