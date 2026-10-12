/** Read public embedded-player MP4 sources, prioritizing HD. No scripts are evaluated. */
export function facebookMp4Sources(html:string):string[]{
 const sources:string[]=[];
 for(const key of ['hd_src','sd_src']){
  const pattern=new RegExp('"'+key+'"\\s*:\\s*("(?:\\\\.|[^"\\\\])*")','g');
  for(const match of html.matchAll(pattern)){
   try{const value=JSON.parse(match[1]);const url=new URL(value);
    if(url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&url.hostname.endsWith('.fbcdn.net')&&/\.mp4$/i.test(url.pathname)&&!sources.includes(url.href))sources.push(url.href);
   }catch{/* Ignore malformed or untrusted metadata. */}
  }
 }
 return sources;
}
