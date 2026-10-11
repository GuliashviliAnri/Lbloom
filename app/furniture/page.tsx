import {pageMetadata} from '@/lib/seo';
import {Suspense} from 'react';import {catalog} from '@/lib/catalog';import {Shell} from '@/components/site';import CatalogList from '@/components/catalog-list';
export const dynamic='force-dynamic';
export const metadata=pageMetadata("ეზოს ავეჯი თბილისში", "ეზოს ავეჯი LBLOOM-ში: ნახეთ ფოტოები, ფასები, ზომები და კომპლექტაცია. შეარჩიეთ ავეჯი თქვენი ეზოსა და დასასვენებელი სივრცისთვის.", "/furniture");

export default async function Page(){const d=await catalog('furniture');return <Shell settings={d.settings}><section className="container section page-section plants-page"><div className="plants-page-heading"><div className="breadcrumbs"><a href="/">მთავარი</a><span>/</span><span>ეზოს ავეჯი</span></div><h1>ეზოს ავეჯი</h1></div><Suspense fallback={<p>იტვირთება…</p>}><CatalogList items={d.furniture} categories={d.categories} furniture={true}/></Suspense></section></Shell>}
