import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter, Playfair_Display } from 'next/font/google'
import { ScrollToTop } from '@/components/scroll-to-top'
import { JsonLd } from '@/components/json-ld'
import { absoluteUrl, organizationJsonLd, SITE_URL, websiteJsonLd } from '@/lib/seo'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Gele Trekking — Premium Nepal Trekking & Himalaya Tours',
  description:
    'Discover the Himalayas with Gele Trekking. Expert-guided trekking packages in Nepal — Everest Base Camp, Annapurna Circuit, Langtang Valley and more. Book your dream adventure today.',
  keywords: [
    'Nepal trekking',
    'Everest Base Camp trek',
    'Annapurna Circuit',
    'Himalaya tours',
    'Nepal adventure',
    'guided trekking',
  ],
  icons: {
    icon: '/geletrekking.png',
  },
  alternates: {
    canonical: '/',
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
  openGraph: {
    title: 'Gele Trekking — Premium Nepal Trekking & Himalaya Tours',
    description:
      'Expert-guided trekking in Nepal. Everest, Annapurna, Langtang and beyond.',
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Gele Trekking',
    images: [{ url: absoluteUrl('/images/hero-himalaya.jpg'), width: 1200, height: 630, alt: 'Gele Trekking in the Himalayas' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gele Trekking — Premium Nepal Trekking & Himalaya Tours',
    description: 'Expert-guided trekking in Nepal. Everest, Annapurna, Langtang and beyond.',
    images: [absoluteUrl('/images/hero-himalaya.jpg')],
  },
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <Script
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="font-sans antialiased">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        {children}
        <ScrollToTop />
      </body>
    </html>
  )
}
