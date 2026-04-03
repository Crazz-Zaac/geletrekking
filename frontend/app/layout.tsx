import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { ScrollToTop } from '@/components/scroll-to-top'
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
  title: 'Himalayan Treks — Premium Nepal Trekking & Himalaya Tours',                                                                                                                                           
  description:
    'Discover the Himalayas with Himalayan Treks. Expert-guided trekking packages in Nepal — Everest Base Camp, Annapurna Circuit, Langtang Valley and more. Book your dream adventure today.',
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
  openGraph: {
    title: 'Gele Trekking — Premium Nepal Trekking & Himalaya Tours',
    description:
      'Expert-guided trekking in Nepal. Everest, Annapurna, Langtang and beyond.',
    type: 'website',
    locale: 'en_US',
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
      <body className="font-sans antialiased">
        {children}
        <ScrollToTop />
      </body>
    </html>
  )
}
