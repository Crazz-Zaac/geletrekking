import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { CookieConsentProvider } from '@/components/cookie-consent'
import { FloatingContact } from '@/components/floating-contact'
import { ScrollToTop } from '@/components/scroll-to-top'
import { JsonLd } from '@/components/json-ld'
import { absoluteUrl, organizationJsonLd, SITE_URL, websiteJsonLd } from '@/lib/seo'
import { getCachedPublicSettings, getCachedTrekLinks } from '@/lib/api'
import { TrekLinksProvider } from '@/components/trek-links'
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Company contact details for structured data; the page still renders if this fails.
  const [settings, trekLinks] = await Promise.all([getCachedPublicSettings(), getCachedTrekLinks()])

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <CookieConsentProvider>
        <TrekLinksProvider links={trekLinks}>
        <JsonLd data={[organizationJsonLd(settings), websiteJsonLd()]} />
        {children}
        <FloatingContact />
        <ScrollToTop />
        </TrekLinksProvider>
        </CookieConsentProvider>
      </body>
    </html>
  )
}
