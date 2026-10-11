import {siteUrl,siteDescription,siteName} from '@/lib/seo';
import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={title:{default:'LBLOOM საბაღე ცენტრი',template:'%s | LBLOOM'},description:siteDescription,metadataBase:new URL(siteUrl()),applicationName:siteName,robots:{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large'}},verification:{google:process.env.GOOGLE_SITE_VERIFICATION||undefined},icons:{icon:{url:'/favicon-rounded.svg',type:'image/svg+xml'}}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ka"><body>{children}</body></html>}
