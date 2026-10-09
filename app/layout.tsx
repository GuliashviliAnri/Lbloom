import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={title:{default:'LBLOOM საბაღე ცენტრი',template:'%s | LBLOOM'},description:'მცენარეები, ეზოს ავეჯი და პროფესიონალური სერვისები ერთ სივრცეში.',icons:{icon:{url:'/favicon-rounded.svg',type:'image/svg+xml'}}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ka"><body>{children}</body></html>}
