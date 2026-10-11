export function heightInCentimeters(value:string):string {
 const text=value.trim();
 const match=text.match(/^(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*(მ|m|სმ|cm)?$/i);
 if(!match)return text;
 const factor=/^(მ|m)$/i.test(match[3]??'')?100:1;
 const number=(s:string)=>String(Math.round(Number(s.replace(',','.'))*factor*100)/100);
 return number(match[1])+(match[2]?'–'+number(match[2]):'')+' სმ';
}
export const dimensionLabels={length:'სიგრძე',width:'სიგანე',height:'სიმაღლე'};
export type Dimensions={length:string;width:string;height:string;details:string};
export function parseDimensions(value:string):Dimensions {
 const result:Dimensions={length:'',width:'',height:'',details:value};
 for(const [key,label] of Object.entries(dimensionLabels)){
  const regex=new RegExp('(?:^|\\s*·\\s*)'+label+':\\s*(\\d+(?:[.,]\\d+)?)\\s*სმ','g');
  result.details=result.details.replace(regex,(_,n:string)=>{result[key as keyof typeof dimensionLabels]=n.replace(',','.');return ''});
 }
 // Old depth entries map to length; keep existing height/width and free text.
 result.details=result.details.replace(/(?:^|\s*·\s*)სიღრმე:\s*(\d+(?:[.,]\d+)?)\s*სმ/g,(_,n:string)=>{if(!result.length)result.length=n.replace(',','.');return '';});
 result.details=result.details.replace(/^\s*·\s*|\s*·\s*$/g,'').trim();
 return result;
}
export function formatDimensions(value:Dimensions):string {
 return [value.details.trim(),...Object.entries(dimensionLabels).map(([key,label])=>value[key as keyof typeof dimensionLabels]?label+': '+value[key as keyof typeof dimensionLabels]+' სმ':'')].filter(Boolean).join(' · ');
}
