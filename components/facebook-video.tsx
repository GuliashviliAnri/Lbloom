import {facebookEmbedUrl,facebookVideoUrl} from '@/lib/video-source';
export default function FacebookVideo({url,title}:{url:string;title:string}){
 const src=facebookEmbedUrl(url);const href=facebookVideoUrl(url);if(!src||!href)return null;
 return <div className="facebook-video"><iframe src={src} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/><a href={href} target="_blank" rel="noopener noreferrer">Facebook-ზე გახსნა</a></div>;
}
