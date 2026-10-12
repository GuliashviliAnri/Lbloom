"use client";
import ResponsiveImage from './responsive-image';
import useVideoCover from './use-video-cover';
export default function VideoCover({url,image='',title}:{url:string;image?:string;title:string}){
 const cover=useVideoCover(url,image);
 return cover?<ResponsiveImage src={cover} alt={title} loading="lazy"/>:<span className="video-cover-empty" aria-hidden="true"/>;
}
