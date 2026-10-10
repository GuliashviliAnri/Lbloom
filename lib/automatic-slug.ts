const georgian='აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ';
const latin=['a','b','g','d','e','v','z','t','i','k','l','m','n','o','p','zh','r','s','t','u','f','k','gh','q','sh','ch','ts','dz','ts','ch','kh','j','h'];
export function automaticSlug(name:string,uniqueId=crypto.randomUUID()):string{
 const base=Array.from(name.toLowerCase()).map(char=>{const i=georgian.indexOf(char);return i<0?char:latin[i]}).join('').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80).replace(/-+$/,'')||'item';
 return base+'-'+uniqueId;
}
