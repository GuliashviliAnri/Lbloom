import type {Video} from './types';
export function latestVideo(videos:Video[]):Video|undefined {
 return videos.reduce<Video|undefined>((latest,video)=>{
  if(!latest)return video;
  const current=Date.parse(video.created_at??'');const previous=Date.parse(latest.created_at??'');
  return Number.isFinite(current)&&(!Number.isFinite(previous)||current>previous)?video:latest;
 },undefined);
}
