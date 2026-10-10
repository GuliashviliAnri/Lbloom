export type Advertisement={id:number;title:string;image_url:string;link_url:string;is_active:boolean};
export const defaultAdvertisement:Advertisement={id:1,title:'რეკლამის ადგილი',image_url:'',link_url:'',is_active:true};
export function advertisementLink(value:string):string|null{
 const text=value.trim();if(!text)return null;
 if(text.startsWith('/')&&!text.startsWith('//')&&!text.includes('\\')&&!/[\u0000-\u0020]/.test(text))return text;
 try{const url=new URL(text);return ['http:','https:'].includes(url.protocol)?url.href:null}catch{return null}
}
export function advertisementFromResult(data:Advertisement|null,error:{code?:string}|null):Advertisement|null{
 if(error)return ['PGRST205','42P01'].includes(error.code??'')?defaultAdvertisement:null;
 return data;
}
