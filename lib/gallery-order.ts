export function moveGalleryPhoto<T>(photos:readonly T[],from:number,to:number):T[]{
 if(from===to||from<0||to<0||from>=photos.length||to>=photos.length)return [...photos];
 const next=[...photos];const [photo]=next.splice(from,1);next.splice(to,0,photo);return next;
}
export function nearestGallerySlot(slots:readonly {x:number;y:number}[],x:number,y:number):number{
 let nearest=-1,distance=Infinity;
 slots.forEach((slot,index)=>{const d=(slot.x-x)**2+(slot.y-y)**2;if(d<distance){nearest=index;distance=d;}});
 return nearest;
}
