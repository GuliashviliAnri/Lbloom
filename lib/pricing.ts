export function hasDiscount(price:number|null|undefined,salePrice:number|null|undefined):salePrice is number {
 return typeof price==='number'&&Number.isFinite(price)&&typeof salePrice==='number'&&Number.isFinite(salePrice)&&salePrice>=0&&salePrice<price;
}
