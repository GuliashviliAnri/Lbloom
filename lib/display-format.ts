const georgianMonths = ['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი','ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'];

export function formatStoryDate(value?: string): {dateTime: string; label: string} | null {
 if (!value) return null;
 // Supabase emits ISO timestamps. Interpret timestamps without an offset as UTC,
 // so the browser's own timezone cannot change their meaning.
 const timestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(value) ? value+'Z' : value;
 const date = new Date(timestamp);
 if (!Number.isFinite(date.getTime())) return null;
 // Georgia uses UTC+4 without daylight saving for all contemporary news dates.
 // Explicit month names also work in browsers without Georgian ICU locale data.
 const local = new Date(date.getTime()+4*60*60*1000);
 return {dateTime: date.toISOString(), label: `${local.getUTCDate()} ${georgianMonths[local.getUTCMonth()]}, ${local.getUTCFullYear()}`};
}

export function formatPrice(value: number): string {
 const [whole, fraction] = value.toFixed(3).split('.');
 const decimal = fraction.replace(/0+$/, '');
 return whole.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')+(decimal ? ','+decimal : '');
}
