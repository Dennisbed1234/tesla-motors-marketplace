import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getSiteUrl, SITE_NAME, SITE_TAGLINE } from '@/lib/site';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: '%s | Tesla Motors',
  },
  description: SITE_TAGLINE,
  applicationName: SITE_NAME,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  keywords: [
    'Tesla',
    'Tesla Roadster',
    'Tesla Model 3',
    'Tesla Model Y',
    'Tesla Model S',
    'Tesla Model X',
    'Cybertruck',
    'electric vehicle',
    'EV marketplace',
    'Tesla affiliate',
  ],
  authors: [{ name: SITE_NAME, url: siteUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
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
    title: SITE_NAME,
    description: SITE_TAGLINE,
    type: 'website',
    url: siteUrl,
    siteName: SITE_NAME,
    locale: 'en_US',
    images: [
      {
        url: '/icon',
        width: 512,
        height: 512,
        alt: 'Tesla Motors Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_TAGLINE,
    images: ['/icon'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#0b0d10',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: SITE_NAME,
    url: siteUrl,
    email: 'info@teslamotors.sale',
    telephone: '+1-347-508-6807',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '235 East 42nd Street',
      addressLocality: 'New York',
      addressRegion: 'NY',
      postalCode: '10017',
      addressCountry: 'US',
    },
    description: SITE_TAGLINE,
    brand: {
      '@type': 'Brand',
      name: 'Tesla',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <OrganizationJsonLd />
      </head>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
