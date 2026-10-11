/** Only allow known Facebook video URLs; never embed arbitrary hosts or HTML. */
export function facebookVideoUrl(value:string):string|null {
 try {
  const url=new URL(value.trim());
  if(url.protocol!=='https:'||url.username||url.password||url.port||!['facebook.com','www.facebook.com','m.facebook.com','web.facebook.com'].includes(url.hostname))return null;
  const reel=url.pathname.match(/^\/reel\/(\d+)\/?$/);
  const video=url.pathname.match(/^\/(?:[^/]+\/)?videos\/(\d+)\/?$/);
  const id=reel?.[1]||video?.[1]||(url.pathname==='/watch/'||url.pathname==='/watch'||url.pathname==='/video.php'?url.searchParams.get('v'):null);
  if(id&&/^\d+$/.test(id))return `https://www.facebook.com/${reel?'reel/':'watch/?v='}${id}`;
  if(/^\/share\/(?:r|v)\/[A-Za-z0-9]+\/?$/.test(url.pathname))return `https://www.facebook.com${url.pathname}`;
  return null;
 }catch{return null}
}
export function facebookEmbedUrl(value:string):string|null {
 const video=facebookVideoUrl(value);if(!video)return null;
 const query=new URLSearchParams({href:video,show_text:'false',width:'560',autoplay:'false'});
 return `https://www.facebook.com/plugins/video.php?${query}`;
}
export function validVideoUrl(value:string):boolean {
 if(facebookVideoUrl(value))return true;
 try {const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&!/(^|\.)facebook\.com$/.test(url.hostname)&&/\.(mp4|webm)$/i.test(url.pathname);}catch{return false}
}
