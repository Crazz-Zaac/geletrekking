import type { MetadataRoute } from 'next'
import { SITE_NAME } from '@/lib/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME}: Nepal Trekking & Himalaya Tours`,
    short_name: SITE_NAME,
    description: 'Expert-guided trekking in Nepal: Everest, Annapurna, Langtang and beyond.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons: [{ src: '/geletrekking.png', sizes: '651x658', type: 'image/png', purpose: 'any' }],
  }
}
