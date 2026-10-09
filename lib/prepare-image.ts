export async function prepareImage(file:File,maxEdge=1600):Promise<File>{
 const url=URL.createObjectURL(file);
 try{
  const image=new Image();image.src=url;await image.decode();
  if(image.naturalWidth<=maxEdge&&image.naturalHeight<=maxEdge&&file.size<250000)return file;
  const ratio=Math.min(1,maxEdge/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));
  const context=canvas.getContext('2d');if(!context)return file;
  context.drawImage(image,0,0,canvas.width,canvas.height);
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',.84));
  if(!blob)return file;
  return new File([blob],file.name.replace(/\.[^.]+$/,'')+(blob.type==='image/webp'?'.webp':'.png'),{type:blob.type,lastModified:file.lastModified});
 }finally{URL.revokeObjectURL(url)}
}
