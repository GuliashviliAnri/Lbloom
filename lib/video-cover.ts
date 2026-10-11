import {formatVideoDuration} from './video-duration';
/** Decode the opening frame locally; the full file is never uploaded by this helper. */
export async function openingVideoFrame(file:File):Promise<{cover:Blob;duration:string}> {
 const url=URL.createObjectURL(file);const video=document.createElement('video');
 video.muted=true;video.playsInline=true;video.preload='auto';
 try {
  await new Promise<void>((resolve,reject)=>{
   const timer=setTimeout(()=>finish(new Error('Video decode timeout')),20000);
   function finish(error?:Error){clearTimeout(timer);video.onloadeddata=null;video.onerror=null;error?reject(error):resolve();}
   video.onloadeddata=()=>finish();video.onerror=()=>finish(new Error('Video decode failed'));video.src=url;
  });
  const width=video.videoWidth,height=video.videoHeight;if(!width||!height)throw new Error('No frame');
  const scale=Math.min(1,900/Math.max(width,height));const canvas=document.createElement('canvas');
  canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);
  const context=canvas.getContext('2d');if(!context)throw new Error('No canvas');
  context.drawImage(video,0,0,canvas.width,canvas.height);
  const cover=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('No cover')),'image/jpeg',.85));
  return {cover,duration:formatVideoDuration(video.duration)};
 }finally{video.removeAttribute('src');video.load();URL.revokeObjectURL(url);}
}
