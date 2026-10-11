export function formatVideoDuration(seconds:number):string {
 if(!Number.isFinite(seconds)||seconds<0)return '';
 const total=Math.round(seconds);
 return Math.floor(total/60)+':'+String(total%60).padStart(2,'0');
}
