export function moveCatalogItem<T extends {id?:unknown}>(items:T[],id:string,beforeId:string|null):T[]{
 const item=items.find(row=>String(row.id)===id);if(!item||beforeId===id)return items;
 const remaining=items.filter(row=>String(row.id)!==id);const target=beforeId===null?remaining.length:remaining.findIndex(row=>String(row.id)===beforeId);
 if(target<0)return items;const result=[...remaining];result.splice(target,0,item);return result;
}
export function sameCatalogOrder<T extends {id?:unknown}>(left:T[],right:T[]){return left.length===right.length&&left.every((row,i)=>row.id===right[i].id);}
