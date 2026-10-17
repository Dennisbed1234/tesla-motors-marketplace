import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Tesla Motors Marketplace',
    template: '%s | Tesla Motors',
  },
  description:
    'Premium marketplace for Tesla electric vehicles. Browse models, compare specifications, and place orders.',
  applicationName: 'Tesla Motors Marketplace',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  appleWebApp: {
    capable: true,
    title: 'Tesla Motors',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [{ url: '/icon', type: 'image/png' }],
    apple: [{ url: '/apple-icon', type: 'image/png' }],
  },
  openGraph: {
    title: 'Tesla Motors Marketplace',
    description: 'Discover premium Tesla electric vehicles.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0b0d10',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
