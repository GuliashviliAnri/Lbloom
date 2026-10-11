import {facebookVideoUrl} from './video-source';
export function automaticVideoCover(url:string):string {const facebook=facebookVideoUrl(url);return facebook?'/api/video-cover?url='+encodeURIComponent(facebook):'';}
export function facebookCoverFromHtml(html:string):string|null {
 const decode=(value:string)=>value.replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#(?:x([\da-f]+)|(\d+));/gi,(_,hex,decimal)=>String.fromCodePoint(parseInt(hex||decimal,hex?16:10)));
 for(const tag of html.match(/<meta\b[^>]*>/gi)||[]){
  const attrs:Record<string,string>={};for(const match of tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g))attrs[match[1].toLowerCase()]=decode(match[3]);
  if(attrs.property?.toLowerCase()!=='og:image'||!attrs.content)continue;
  try{const url=new URL(attrs.content);if(url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&url.hostname.endsWith('.fbcdn.net'))return url.href;}catch{}
 }
 return null;
}
