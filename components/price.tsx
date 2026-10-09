import {hasDiscount} from '@/lib/pricing';
import {formatPrice} from '@/lib/display-format';
export default function Price({price,salePrice}:{price:number|null|undefined;salePrice?:number|null}){
 if(price==null)return <strong className="price-on-request">ფასი შეთანხმებით</strong>;
 const discount=hasDiscount(price,salePrice);
 return <span className={'item-price'+(discount?' item-price-sale':'')}>
  {discount&&<del aria-label={'ძველი ფასი: '+price+' ლარი'}>{formatPrice(price)} ₾</del>}
  <strong aria-label={(discount?'ახალი ფასი: ':'ფასი: ')+(discount?salePrice:price)+' ლარი'}>{formatPrice(discount?salePrice:price)} ₾</strong>
 </span>;
}
