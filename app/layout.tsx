import { ActionFlight } from '@/components/action-flight';
import { SiteMotion } from '@/components/site-motion';
import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider, Header, Footer, FloatingChat } from '@/components/store';
export const metadata: Metadata = { title: { default: 'Docs2Travel — A world of possibilities', template: '%s | Docs2Travel' }, description: 'Personal travel, visa and official document assistance. Explore services and speak with an advisor.' };
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang="en"><body><StoreProvider><SiteMotion/><ActionFlight/><Header /><main>{children}</main><Footer /><FloatingChat /></StoreProvider></body></html>; }

