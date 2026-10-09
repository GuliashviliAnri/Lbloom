import manifest from './image-assets.json';
const assets=manifest as Record<string,{originalSrc?:string;illustrative?:boolean}>;
export function fullImageSource(src:string){return assets[src]?.originalSrc??src;}
export function isIllustrativeImage(src:string){return assets[src]?.illustrative===true;}
