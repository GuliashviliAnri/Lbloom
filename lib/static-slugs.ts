// Prerender known detail pages at build time. If the catalog is unreachable during the build,
// return nothing so pages render on first request instead of failing the deploy.
export async function staticSlugs(load:()=>Promise<{slug:string}[]>):Promise<{slug:string}[]>{
 try{return (await load()).filter(row=>row.slug).map(row=>({slug:row.slug}));}
 catch{return [];}
}
