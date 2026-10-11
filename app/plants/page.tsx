import {pageMetadata} from '@/lib/seo';
import {Suspense} from 'react';import {catalog} from '@/lib/catalog';import {Shell} from '@/components/site';import CatalogList from '@/components/catalog-list';
export const dynamic='force-dynamic';
export const metadata=pageMetadata("მცენარეები თბილისში", "მცენარეები თქვენი ეზოსთვის LBLOOM-ის საბაღე ცენტრში. ნახეთ მცენარეების ფასები, სიმაღლეები, ფოტოები და ხელმისაწვდომობა.", "/plants");

export default async function Page(){const d=await catalog('plants');return <Shell settings={d.settings}><section className="container section page-section plants-page"><div className="plants-page-heading"><div className="breadcrumbs"><a href="/">მთავარი</a><span>/</span><span>მცენარეები</span></div><h1>მცენარეები</h1></div><Suspense fallback={<p>იტვირთება…</p>}><CatalogList items={d.products} categories={d.categories} furniture={false}/></Suspense></section></Shell>}
