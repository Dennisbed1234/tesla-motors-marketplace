import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Tesla Motors — Premium Electric Vehicle Marketplace',
    template: '%s | Tesla Motors Marketplace',
  },
  description:
    'Premium marketplace for Tesla electric vehicles. Browse models, compare specifications, and submit reservation or purchase inquiries.Afilliated with Tesla, Inc.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Tesla Motors — Premium Electric Vehicle Marketplace',
    description: 'Discover premium Tesla electric vehicles. Independent marketplace.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
