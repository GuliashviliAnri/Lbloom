/* eslint-disable @next/next/no-img-element -- Prebuilt responsive WebP assets also work in the Sites runtime. */
import type {ImgHTMLAttributes} from 'react';
import manifest from '@/lib/image-assets.json';
const assets=manifest as Record<string,{src:string;srcSet:string;width:number;height:number}>;
export default function ResponsiveImage({src,alt='',sizes='(max-width:767px) 72vw, (max-width:1023px) 46vw, 25vw',...props}:ImgHTMLAttributes<HTMLImageElement>){
 const asset=typeof src==='string'?assets[src]:undefined;
 return <img decoding="async" width={asset?.width} height={asset?.height} {...props} src={asset?.src??src} alt={alt} srcSet={asset?.srcSet} sizes={asset?sizes:undefined}/>;
}
