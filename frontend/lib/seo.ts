import type { Metadata } from 'next'
import type { Trek } from '@/lib/data'
import type { TravelGuide, UiBlogPost } from '@/lib/api'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://geletrekking.com').replace(/\/+$/, '')
export const SITE_NAME = 'Gele Trekking'
export const DEFAULT_OG_IMAGE = '/images/hero-himalaya.jpg'

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function stripMarkdown(value = '') {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)(?:\{[^}]*\})?/g, ' ')
    .replace(/\[[^\]]+\]\([^)]*\)/g, (match) => match.replace(/^\[([^\]]+)\].*$/, '$1'))
    // List bullets and horizontal rules; keep hyphens inside words ("15-day").
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, ' ')
    .replace(/^\s*-{3,}\s*$/gm, ' ')
    .replace(/[#>*_`~]+/g, ' ')
    .replace(/::youtube(?:\[[^\]]*\])?\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function truncateDescription(value: string, fallback: string, maxLength = 155) {
  const clean = stripMarkdown(value) || fallback
  if (clean.length <= maxLength) return clean
  return `${clean.slice(0, maxLength - 1).replace(/\s+\S*$/, '')}…`
}

type TrekSeoInput = {
  title: string
  duration?: number
  price?: number
  difficulty?: string
  maxAltitude?: number
  offerDiscountPercent?: number
  shortDescription?: string
  fullDescription?: string
}

const formatNumber = (value: number) => value.toLocaleString('en-US')

/** Search-result title with the facts trekkers compare: days and starting price. */
export function trekSeoTitle(trek: TrekSeoInput) {
  const parts: string[] = []
  if (trek.duration) parts.push(`${trek.duration} Days`)
  if (trek.price) parts.push(`from US$${formatNumber(trek.price)}`)
  return parts.length ? `${trek.title} – ${parts.join(' ')}` : trek.title
}

/** Search-result description led by concrete facts, then the trek summary. */
export function trekSeoDescription(trek: TrekSeoInput) {
  const facts: string[] = []
  const lead = [trek.duration ? `${trek.duration}-day` : null, trek.difficulty ? trek.difficulty.toLowerCase() : null, 'guided trek in Nepal']
    .filter(Boolean)
    .join(' ')
  facts.push(trek.maxAltitude ? `${lead} reaching ${formatNumber(trek.maxAltitude)} m` : lead)
  if (trek.price) facts.push(`from US$${formatNumber(trek.price)} per person${trek.offerDiscountPercent ? ` (save ${trek.offerDiscountPercent}% now)` : ''}`)
  const summary = stripMarkdown(trek.shortDescription || trek.fullDescription || '')
  const text = `${facts.join(', ')}.${summary ? ` ${summary}` : ''}`
  const capitalized = text.charAt(0).toUpperCase() + text.slice(1)
  return truncateDescription(capitalized, `${trek.title}: guided trek in Nepal with Gele Trekking.`)
}

export function pageTitle(title: string) {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
}

export function buildMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  publishedTime,
  modifiedTime,
  tags,
  keywords,
}: {
  title: string
  description: string
  path: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
  keywords?: string[]
}): Metadata {
  const fullTitle = pageTitle(title)
  const url = absoluteUrl(path)
  const imageUrl = absoluteUrl(image)

  return {
    title: fullTitle,
    description,
    keywords: keywords || (tags?.length ? tags.map((tag) => tag.replace(/^#/, '')) : [title]),
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      locale: 'en_US',
      type,
      ...(type === 'article' ? { publishedTime, modifiedTime, tags } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  }
}

type OrganizationSettings = {
  phone?: string
  email?: string
  address?: string
  social?: Record<string, string | undefined>
} | null | undefined

// Official company profiles only (personal profiles and chat links are not "sameAs").
function companyProfiles(social: Record<string, string | undefined> = {}) {
  const urls = ['facebook', 'instagram', 'youtube', 'twitter', 'tripadvisor']
    .map((key) => (social[key] || '').trim())
    .filter((url) => /^https:\/\//.test(url))
  // LinkedIn only when it is the company page, not a personal profile (/in/...).
  const linkedin = (social.linkedin || '').trim()
  if (/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/company\//i.test(linkedin)) urls.push(linkedin)
  return Array.from(new Set([...urls, 'https://www.trustpilot.com/review/geletrekking.com']))
}

export function organizationJsonLd(settings?: OrganizationSettings) {
  const phone = settings?.phone?.trim()
  const email = settings?.email?.trim()
  const address = settings?.address?.trim()
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/geletrekking.png'),
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    description: 'Nepal-based trekking agency offering guided Himalayan treks, tours, and travel planning.',
    areaServed: ['Nepal', 'Himalayas', 'Everest Region', 'Annapurna Region', 'Langtang Region'],
    knowsAbout: ['Nepal trekking', 'Everest Base Camp Trek', 'Annapurna trekking', 'Himalayan travel planning'],
    ...(phone ? { telephone: phone } : {}),
    ...(email ? { email } : {}),
    ...(address
      ? { address: { '@type': 'PostalAddress', streetAddress: address, addressCountry: 'NP' } }
      : {}),
    ...(phone || email
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            ...(phone ? { telephone: phone } : {}),
            ...(email ? { email } : {}),
            availableLanguage: ['English', 'Nepali'],
          },
        }
      : {}),
    sameAs: companyProfiles(settings?.social),
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en',
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function articleJsonLd(post: UiBlogPost, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: truncateDescription(post.excerpt || post.content, `Read ${post.title} from Gele Trekking.`),
    image: [absoluteUrl(post.image)],
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: absoluteUrl(path),
    keywords: post.hashtags?.map((tag) => tag.replace(/^#/, '')).join(', '),
  }
}

export function guideArticleJsonLd(guide: TravelGuide, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: truncateDescription(guide.description || guide.content, `Read ${guide.title} from Gele Trekking.`),
    datePublished: guide.createdAt,
    dateModified: guide.updatedAt || guide.createdAt,
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: absoluteUrl(path),
    articleSection: guide.category,
    about: [guide.region, guide.section, guide.category].filter(Boolean),
  }
}

export function trekJsonLd(trek: Trek, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: trek.title,
    description: truncateDescription(trek.fullDescription || trek.shortDescription, `${trek.title} with Gele Trekking.`),
    image: trek.gallery?.length ? trek.gallery.map(absoluteUrl) : [absoluteUrl(trek.image)],
    url: absoluteUrl(path),
    provider: { '@id': `${SITE_URL}/#organization` },
    touristType: ['Trekkers', 'Adventure travelers'],
    itinerary: trek.itinerary?.map((day) => ({
      '@type': 'ItemList',
      name: `Day ${day.day}: ${day.title}`,
      description: day.description,
    })),
    offers: trek.price
      ? {
          '@type': 'Offer',
          price: trek.price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: absoluteUrl(path),
        }
      : undefined,
  }
}

export function faqJsonLd(faqs?: Array<{ question: string; answer: string }>) {
  const validFaqs = (faqs || []).filter((item) => item.question?.trim() && item.answer?.trim())
  if (validFaqs.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: validFaqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripMarkdown(item.answer),
      },
    })),
  }
}
