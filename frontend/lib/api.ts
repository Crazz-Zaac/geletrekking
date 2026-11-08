import type { TeamSocialLinks } from '@/lib/team-social-links'
import { treks as fallbackTreks } from '@/lib/data'
import type { Trek } from '@/lib/data'
import { parseAltitude } from '@/lib/trek-itinerary'
export interface UiBlogPost {
  id: string
  updatedAt?: string
  slug: string
  title: string
  excerpt: string
  image: string
  category: string
  hashtags?: string[]
  author: string
  date: string
  readTime: string
  content: string
}
export interface AdminUser {
  email: string
  name?: string
  role: 'editor' | 'superadmin'
  twoFactorEnabled?: boolean
  requiresTwoFactorSetup?: boolean
}
export interface AdminTwoFactorSetupResponse {
  message: string
  secret: string
  otpauthUrl: string
  qrUrl: string
}
interface AdminLoginResponse {
  user?: {
    email: string
    name?: string
    role: 'editor' | 'superadmin'
    twoFactorEnabled?: boolean
    requiresTwoFactorSetup?: boolean
  }
  need2FA?: boolean
  message?: string
}
interface AuthMeResponse {
  user?: {
    email?: string
    name?: string
    role?: string
    twoFactorEnabled?: boolean
    requiresTwoFactorSetup?: boolean
  }
}
export interface AdminPricingTier {
  name: string
  price_usd?: number
  price_gbp?: number
  includes?: string[]
}

export interface AdminAvailabilityRange {
  _id?: string
  start_date: string
  end_date: string
  status?: "available" | "booked" | "limited"
  note?: string
}

export interface AdminTripEssential {
  title: string
  summary?: string
  detail?: string
}

export interface AdminTrek {
  _id: string
  name: string
  slug?: string
  description: string
  region?: string
  region_description?: string
  image_url?: string
  gallery_images?: string[]
  map_image_url?: string
  highlights?: string[]
  includes?: string[]
  excludes?: string[]
  what_to_pack?: string[]
  trip_essentials?: AdminTripEssential[]
  itinerary?: Array<{
    _id?: string
    day: number
    title: string
    description?: string
    altitude?: string
    distance?: string
    accommodation?: string
    highlights?: string[]
  }>
  best_season?: string
  availability?: AdminAvailabilityRange[]
  start_point?: string
  end_point?: string
  price_gbp?: number
  price_usd?: number
  pricing_tiers?: AdminPricingTier[]
  duration_days?: number
  difficulty?: 'Easy' | 'Moderate' | 'Hard'
  group_size_min?: number
  group_size_max?: number
  max_altitude_meters?: number
  trip_length_km?: number
  acclimatization_days?: number
  daily_activity_hours?: string
  wifi_availability?: string
  tour_type?: string
  transportation?: string
  itinerary_pdf_url?: string
  trek_map_embed_url?: string
  has_offer?: boolean
  offer_type?: string
  offer_title?: string
  offer_description?: string
  discounted_price_gbp?: number
  discounted_price_usd?: number
  offer_valid_from?: string
  offer_valid_to?: string
  offer_discount_percent?: number
  offer_active_now?: boolean
  original_price_gbp?: number
  original_price_usd?: number
  season_tag?: string
  faqs?: Array<{
    _id?: string
    question: string
    answer: string
  }>
  is_featured?: boolean
  featured_order?: number
  is_active?: boolean
  is_optional?: boolean
  rating?: number
  review_count?: number
  createdAt?: string
  latitude?: number
  longitude?: number
  location_name?: string
}
export interface AdminBlog {
  _id: string
  slug: string
  title: string
  excerpt?: string
  content: string
  coverImage?: string
  author?: string
  hashtags?: string[]
  isPublished: boolean
  createdAt?: string
}
export interface AdminGalleryItem {
  _id: string
  title?: string
  imageUrl: string
  category?: string
  isFeatured?: boolean
  createdAt?: string
}
export interface AdminContactMessage {
  _id: string
  name: string
  email: string
  message: string
  source?: string
  isRead: boolean
  createdAt: string
}
export type BookingFormPayload = Record<string, string | boolean>
export type BookingFieldType = 'text' | 'email' | 'tel' | 'date' | 'time' | 'textarea' | 'select' | 'checkbox'
export interface BookingFormFieldConfig {
  id: string
  label: string
  type: BookingFieldType
  required?: boolean
  options?: string[]
  placeholder?: string
  condition?: 'sharedAccommodation' | 'altitudeCoverage'
  locked?: boolean
}
export interface BookingFormSectionConfig {
  id: string
  title: string
  fields: BookingFormFieldConfig[]
}
export type BookingFormConfig = BookingFormSectionConfig[]
export interface AdminBookingSubmission {
  _id: string
  firstName: string
  lastName: string
  email: string
  mobileWhatsapp?: string
  trekPackage: string
  formLink?: string
  trekStartDate?: string
  trekEndDate?: string
  formData: BookingFormPayload
  isRead: boolean
  createdAt: string
  updatedAt?: string
  pdfFilename?: string
  pdfPurgedAt?: string | null
}
export interface AdminNotificationItem {
  id: string
  type: 'message' | 'booking'
  title: string
  description: string
  href: string
  createdAt: string
}
export interface AdminNotificationSummary {
  totalUnread: number
  unreadMessages: number
  unreadBookings: number
  items: AdminNotificationItem[]
}
export interface AdminBookingFormLink {
  _id: string
  clientName?: string
  clientEmail?: string
  trekPackage?: string
  notes?: string
  formConfig?: BookingFormConfig
  isActive: boolean
  expiresAt: string
  submittedAt?: string
  submission?: string
  createdAt: string
  updatedAt?: string
  token?: string
  path?: string
}
export interface PublicBookingFormLink {
  clientName?: string
  clientEmail?: string
  trekPackage?: string
  formConfig?: BookingFormConfig
  expiresAt: string
}
export interface ContactEmail {
  label: string
  email: string
  note?: string
}
export interface AdminSiteSettings {
  siteName?: string
  /** Extra addresses on the Contact page; undefined until first saved. */
  contactEmails?: ContactEmail[]
  logoUrl?: string
  contactHeroImageUrl?: string
  bookingHeroImageUrl?: string
  phone?: string
  email?: string
  address?: string
  officeHoursWeekdays?: string
  officeHoursWeekend?: string
  mapEmbedUrl?: string
  navigation?: {
    activitiesEnabled?: boolean
  }
  social?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    youtube?: string
    whatsapp?: string
  }
  registrationsAffiliations?: RegistrationDocument[]
}
type RegistrationDetails = {
  /** "registration" = government registration/licence, "membership" = association membership */
  kind: 'registration' | 'membership'
  issuer: string
  referenceNumber: string
  issuedOn: string
  validUntil: string
  verifyUrl: string
  logoUrl: string
}
/** Full document as admins see it (includes the original file link). */
export interface RegistrationDocument extends Partial<RegistrationDetails> {
  _id?: string
  title: string
  code: string
  description: string
  documentUrl: string
  documentType: 'image' | 'pdf'
  uploadedAt: Date | null
  status: 'placeholder' | 'uploaded' | 'pending'
}
/** What visitors get: images only as watermarked previews, no original link. */
export interface PublicRegistrationDocument extends RegistrationDetails {
  code: string
  title: string
  description: string
  status: 'uploaded' | 'pending'
  documentType: 'image' | 'pdf'
  hasFile: boolean
  previewUrl: string
  fullUrl: string
  pdfUrl: string
}
export type RegistrationDocumentPayload = Partial<RegistrationDetails> & {
  title?: string
  code?: string
  description?: string
  documentUrl?: string
  documentType?: 'image' | 'pdf'
  status?: string
}
export interface AdminHero {
  title?: string
  subtitle?: string
  backgroundImage?: string
  overlay?: string
  ctaText?: string
  ctaLink?: string
}
export interface AdminAboutHighlight {
  title: string
  description: string
}
export interface AdminAboutStat {
  label: string
  value: string
}
export interface AdminAboutTeamMember {
  social?: TeamSocialLinks
  name: string
  role: string
  description: string
  imageUrl: string
}
export interface AdminAboutAssociation {
  name: string
  logoUrl: string
}
export interface AdminAbout {
  heroTitle?: string
  heroSubtitle?: string
  heroImageUrl?: string
  missionTitle?: string
  missionBody?: string
  storyTitle?: string
  storyBody?: string
  highlights?: AdminAboutHighlight[]
  whyChooseUs?: string[]
  stats?: AdminAboutStat[]
  teamTitle?: string
  teamMembers?: AdminAboutTeamMember[]
  associations?: AdminAboutAssociation[]
  updatedAt?: string
}
export interface AdminAlert {
  _id?: string
  title: string
  message: string
  icon: 'info' | 'warning' | 'error' | 'success' | 'alert' | 'announcement' | 'critical' | 'neutral'
  type: 'global' | 'destinations'
  isActive: boolean
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  accentColor?: string
  titleColor?: string
  bodyColor?: string
  ctaUrl?: string
  ctaLabel?: string
  priority?: number
  createdAt?: string
  updatedAt?: string
}
export interface AdminInvite {
  _id?: string
  email: string
  role: string
  expiresAt: string
  usedAt?: string | null
  createdAt?: string
  inviteUrl?: string
}
export interface AdminManagedUser {
  _id: string
  email: string
  role: 'editor' | 'superadmin' | 'admin'
  status?: 'active' | 'suspended' | 'disabled'
  createdAt?: string
}
export interface AuditLog {
  _id?: string
  actor?: string
  actorEmail?: string
  action: string
  targetType?: string
  targetId?: string
  targetLabel?: string
  outcome: 'success' | 'failure'
  ip?: string
  userAgent?: string
  meta?: Record<string, any>
  createdAt?: string
}
export interface AdminActivity {
  _id: string
  title: string
  slug: string
  category: 'Day Tour' | 'Adrenaline' | 'Wildlife' | 'Water Sports'
  shortDescription: string
  fullDescription: string
  price: number
  currency: string
  duration: string
  maxAltitude: string
  difficultyLevel: 'Easy' | 'Moderate' | 'Difficult' | 'Technical'
  groupSizeMin: number
  groupSizeMax: number
  mainImage?: string | null
  galleryImages?: string[]
  metaTitle?: string
  metaDescription?: string
  videoUrl?: string
  isFeatured: boolean
  isTopPick: boolean
  isActive: boolean
  displayOrder: number
  itinerary?: Array<{
    day: number
    title: string
    description?: string
  }>
  includes?: string[]
  excludes?: string[]
  tags?: string[]
  description?: string
  date?: string
  image?: string | null
  isPublished?: boolean
}
export interface PublicActivity {
  _id: string
  updatedAt?: string
  title: string
  slug: string
  category: 'Day Tour' | 'Adrenaline' | 'Wildlife' | 'Water Sports'
  shortDescription: string
  fullDescription: string
  price: number
  currency: string
  duration: string
  maxAltitude: string
  difficultyLevel: 'Easy' | 'Moderate' | 'Difficult' | 'Technical'
  groupSizeMin: number
  groupSizeMax: number
  mainImage?: string | null
  galleryImages?: string[]
  metaTitle?: string
  metaDescription?: string
  videoUrl?: string
  isFeatured: boolean
  isActive: boolean
  displayOrder: number
  itinerary?: Array<{
    day: number
    title: string
    description?: string
  }>
  includes?: string[]
  excludes?: string[]
  tags?: string[]
  description?: string
  date?: string
  image?: string | null
}
export interface AdminAnalyticsMetricSummary {
  totalInquiries: number
  inquiriesChangePct: string
  contentItems: number
  contentChangePct: string
  avgGuideViews: number
  totalGuideViews: number
  unreadRate: number
  unreadMessages: number
}
export interface AdminAnalyticsTrendPoint {
  date: string
  inquiries: number
  contentUpdates: number
}
export interface AdminAnalyticsRegion {
  name: string
  count: number
}
export interface AdminAnalyticsContentMixItem {
  name: string
  value: number
}
export interface AdminAnalyticsResponse {
  generatedAt: string
  metrics: AdminAnalyticsMetricSummary
  trends: AdminAnalyticsTrendPoint[]
  regions: AdminAnalyticsRegion[]
  contentMix: AdminAnalyticsContentMixItem[]
}
export interface AdminRiskHealthRedis {
  enabled: boolean
  connected: boolean
  reachable: boolean
  urlConfigured: boolean
  host: string
  port: number
  lastError: string | null
  lastErrorAt: string | null
  lastConnectedAt: string | null
}
export interface AdminRiskHealthResponse {
  message: string
  mode: 'redis' | 'memory-fallback'
  redis: AdminRiskHealthRedis
  memoryProfiles: {
    ip: number
    device: number
  }
}
export interface AdminSslHealthResponse {
  message: string
  status: 'valid' | 'expiring-soon' | 'expired' | 'missing' | 'invalid'
  certPath: string
  warningThresholdDays: number
  validNow: boolean
  validFrom: string | null
  validTo: string | null
  daysRemaining: number | null
  issuer: string | null
  subject: string | null
  serialNumber: string | null
  fingerprint256: string | null
  checkedAt: string
}
interface BackendTrek {
  updatedAt?: string
  _id: string
  name: string
  slug?: string
  description?: string
  overview?: string
  region?: string
  region_description?: string
  image_url?: string
  gallery_images?: string[]
  map_image_url?: string
  highlights?: string[]
  itinerary?: Array<{
    day: number
    title: string
    description?: string
    altitude?: string | number
    distance?: string
    accommodation?: string
  }>
  includes?: string[]
  excludes?: string[]
  what_to_pack?: string[]
  trip_essentials?: AdminTripEssential[]
  best_season?: string
  availability?: AdminAvailabilityRange[]
  start_point?: string
  end_point?: string
  price_usd?: number
  pricing_tiers?: AdminPricingTier[]
  duration_days?: number
  difficulty?: 'Easy' | 'Moderate' | 'Hard'
  group_size_min?: number
  group_size_max?: number
  max_altitude_meters?: number
  trip_length_km?: number
  acclimatization_days?: number
  daily_activity_hours?: string
  wifi_availability?: string
  trek_map_embed_url?: string
  has_offer?: boolean
  offer_type?: string
  offer_title?: string
  offer_description?: string
  discounted_price_gbp?: number
  discounted_price_usd?: number
  offer_valid_from?: string
  offer_valid_to?: string
  offer_discount_percent?: number
  offer_active_now?: boolean
  original_price_gbp?: number
  original_price_usd?: number
  faqs?: Array<{ question: string; answer: string }>
  is_optional?: boolean
  tour_type?: string
  transportation?: string
  itinerary_pdf_url?: string
  season_tag?: string
  is_featured?: boolean
  featured_order?: number
  latitude?: number
  longitude?: number
  location_name?: string
}
interface BackendBlogPost {
  updatedAt?: string
  _id: string
  slug: string
  title: string
  excerpt?: string
  content: string
  coverImage?: string
  author?: string
  hashtags?: string[]
  createdAt?: string
}
const getApiBaseUrl = () => {
  const isServer = typeof window === 'undefined'
  
  if (isServer) {
    // Server-side: use INTERNAL_API_URL for Docker network access
    const url = (globalThis as any).process?.env?.INTERNAL_API_URL || 'http://backend:5000'
    return url.replace(/\/+$/, '')
  } else {
    // Client-side: avoid mixed-content and prefer same-origin proxy when needed.
    const configuredUrl = ((globalThis as any).process?.env?.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '')
    if (!configuredUrl) return ''

    const isHttpsPage = window.location.protocol === 'https:'
    const isConfiguredHttp = configuredUrl.startsWith('http://')

    if (isHttpsPage && isConfiguredHttp) {
      return ''
    }

    return configuredUrl
  }
}

const API_BASE_URL = getApiBaseUrl()
const getApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath
}
export class ApiRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const internalToken = typeof window === 'undefined' ? process.env.INTERNAL_API_TOKEN : undefined
  const response = await fetch(getApiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(internalToken ? { 'x-internal-api-token': internalToken } : {}),
      ...(init?.headers || {}),
    },
    // Send the httpOnly admin session cookie (also when the API is on another
    // origin in local development).
    credentials: 'include',
    cache: 'no-store',
  })
  if (!response.ok) {
    let message = `Request failed: ${response.status} ${response.statusText}`
    try {
      const data = (await response.json()) as { message?: string; error?: string }
      message = data?.message || data?.error || message
    } catch {
      // Ignore JSON parsing errors and keep default message
    }
    throw new ApiRequestError(message, response.status)
  }
  return response.json() as Promise<T>
}
// Admin requests authenticate with the httpOnly session cookie that fetchJson
// sends. `_session` is kept so existing callers need no changes; it is only a
// "logged in" marker, never a credential.
async function fetchAdminJson<T>(path: string, _session: string, init?: RequestInit): Promise<T> {
  return fetchJson<T>(path, init)
}
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
function inferRegion(name: string): Trek['region'] {
  const text = name.toLowerCase()
  if (text.includes('everest') || text.includes('khumbu')) return 'Everest'
  if (text.includes('annapurna')) return 'Annapurna'
  if (text.includes('langtang')) return 'Langtang'
  if (text.includes('mustang')) return 'Mustang'
  if (text.includes('manaslu')) return 'Manaslu'
  return 'Other'
}
function toNumber(value?: string | number): number | undefined {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value.replace(/[^0-9.-]/g, ''), 10)
    if (!Number.isNaN(parsed)) return parsed
  }
  return undefined
}
function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min`
}
function formatDate(value?: string): string {
  if (!value) return new Date().toISOString().slice(0, 10)
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10)
  return date.toISOString().slice(0, 10)
}
function toAvatar(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'GT'
}
function stripListMarker(value: string) {
  return value.trim().replace(/^(?:[-*•]\s+|\d+[.)]\s+)/, "").trim()
}

function normalizeListItems(items?: string[]) {
  return (items || []).map(stripListMarker).filter(Boolean)
}

function mapTrek(trek: BackendTrek): Trek {
  const title = trek.name || 'Untitled Trek'
  const fullDescription = (trek.description || trek.overview || 'Explore this amazing Himalayan trek.').trim()
  const shortDescription = fullDescription.split('.')[0] + '.'
  const knownRegions: Trek['region'][] = ['Everest', 'Annapurna', 'Langtang', 'Mustang', 'Manaslu', 'Other']
  const regionFromDb = trek.region as Trek['region']
  const region: Trek['region'] = knownRegions.includes(regionFromDb)
    ? regionFromDb
    : inferRegion(title)
  const slug = trek.slug?.trim() || slugify(title)
  function normalizeDifficultyFull(level?: string): Trek['difficulty'] {
    if (level === 'Easy') return 'Easy'
    if (level === 'Moderate') return 'Moderate'
    if (level === 'Hard') return 'Challenging'
    return 'Challenging'
  }
  const groupSize =
    trek.group_size_min && trek.group_size_max
      ? `${trek.group_size_min}–${trek.group_size_max}`
      : 'Flexible'
  const transportation =
    trek.transportation?.trim() ||
    [trek.start_point, trek.end_point].filter(Boolean).join(' → ') ||
    'On request'
  const offerActiveNow = trek.offer_active_now ?? true
  const hasOffer = Boolean(trek.has_offer && offerActiveNow)
  const offerDiscountPercent =
    (hasOffer && trek.offer_discount_percent) ||
    (hasOffer && trek.price_usd && trek.discounted_price_usd && trek.discounted_price_usd < trek.price_usd
      ? Math.round(((trek.price_usd - trek.discounted_price_usd) / trek.price_usd) * 100)
      : undefined)
  const originalPrice =
    trek.original_price_usd ||
    (hasOffer && trek.discounted_price_usd && trek.price_usd ? trek.price_usd : undefined)
  const pricingTiers = (trek.pricing_tiers || [])
    .map((tier) => ({
      name: tier.name,
      priceUsd: tier.price_usd || 0,
      priceGbp: tier.price_gbp,
      includes: normalizeListItems(tier.includes),
    }))
    .filter((tier) => tier.name && tier.priceUsd > 0)
  const tierFromPrice = pricingTiers.length > 0
    ? Math.min(...pricingTiers.map((tier) => tier.priceUsd))
    : 0
  const currentPrice =
    hasOffer && trek.discounted_price_usd
      ? trek.discounted_price_usd
      : tierFromPrice || trek.price_usd || 0
  return {
    updatedAt: trek.updatedAt,
    id: trek._id,
    slug,
    title,
    region,
    regionDescription: trek.region_description,
    duration: trek.duration_days || 0,
    difficulty: normalizeDifficultyFull(trek.difficulty),
    maxAltitude: trek.max_altitude_meters || 0,
    tripLengthKm: trek.trip_length_km,
    acclimatizationDays: trek.acclimatization_days,
    dailyActivityHours: trek.daily_activity_hours,
    wifiAvailability: trek.wifi_availability,
    price: currentPrice,
    pricingTiers: pricingTiers.length > 0 ? pricingTiers : undefined,
    groupSize,
    bestSeason: trek.best_season || 'All year',
    availabilityRanges: (trek.availability || [])
      .filter((range) => range.start_date && range.end_date)
      .map((range) => ({
        startDate: range.start_date.slice(0, 10),
        endDate: range.end_date.slice(0, 10),
        status: range.status || 'available',
        note: range.note,
      })),
    transportation,
    startPoint: trek.start_point?.trim() || undefined,
    tourType: trek.tour_type || (trek.is_optional ? 'Optional Trek' : 'Group / Private'),
    shortDescription,
    fullDescription,
    image: trek.image_url || '/images/hero-himalaya.jpg',
    highlights: normalizeListItems(trek.highlights),
    itinerary: (trek.itinerary || []).map((day) => ({
      day: day.day,
      title: day.title,
      description: day.description || '',
      altitude: parseAltitude(day.altitude),
      distance: day.distance,
      accommodation: day.accommodation || 'Teahouse',
    })),
    includes: normalizeListItems(trek.includes),
    excludes: normalizeListItems(trek.excludes),
    whatToPack: normalizeListItems(trek.what_to_pack),
    tripEssentials: (trek.trip_essentials || [])
      .map((item) => ({
        title: item.title?.trim() || '',
        summary: item.summary?.trim() || '',
        detail: item.detail?.trim() || '',
      }))
      .filter((item) => item.title && item.summary && item.detail && !item.title.toLowerCase().includes('tip')),
    faqs: trek.faqs || [],
    gallery:
      trek.gallery_images && trek.gallery_images.length > 0
        ? trek.gallery_images
        : [trek.image_url || '/images/hero-himalaya.jpg'],
    mapEmbed: trek.trek_map_embed_url,
    mapImageUrl: trek.map_image_url,
    itineraryPdfUrl: trek.itinerary_pdf_url,
    hasOffer,
    offerType: trek.offer_type || trek.offer_title,
    offerDescription: trek.offer_description,
    offerDiscountPercent,
    originalPrice,
    discountedPrice: trek.discounted_price_usd,
    isFeatured: trek.is_featured,
    featuredOrder: trek.featured_order || 0,
    offerValidTo: hasOffer && trek.offer_valid_to ? trek.offer_valid_to.slice(0, 10) : undefined,
    latitude: trek.latitude,
    longitude: trek.longitude,
    locationName: trek.location_name,
  }
}
function mapBlog(post: BackendBlogPost): UiBlogPost {
  return {
    id: post._id,
    updatedAt: post.updatedAt || post.createdAt,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || '',
    image: post.coverImage || '/images/blog-guide.jpg',
    category: 'Blog',
    hashtags: post.hashtags || [],
    author: post.author || 'Gele Trek Team',
    date: formatDate(post.createdAt),
    readTime: estimateReadTime(post.content || ''),
    content: post.content || '',
  }
}
export async function getTreks(): Promise<Trek[]> {
  try {
    const data = await fetchJson<BackendTrek[]>('/api/treks')
    return data.map(mapTrek)
  } catch {
    return fallbackTreks
  }
}
export async function getTrekByIdentifier(identifier: string): Promise<Trek | null> {
  try {
    const data = await fetchJson<BackendTrek>(`/api/treks/${encodeURIComponent(identifier)}`)
    if (!data?._id || !data.name) throw new Error('Invalid itinerary response')
    return mapTrek(data)
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return null
    throw error
  }
}
export async function getBlogs(): Promise<UiBlogPost[]> {
  try {
    const data = await fetchJson<BackendBlogPost[]>('/api/blogs')
    return data.map(mapBlog)
  } catch {
    return []
  }
}
export async function getBlogBySlug(slug: string): Promise<UiBlogPost | null> {
  try {
    const data = await fetchJson<BackendBlogPost>(`/api/blogs/${encodeURIComponent(slug)}`)
    return mapBlog(data)
  } catch {
    return null
  }
}
export async function submitContactMessage(payload: {
  name: string
  email: string
  message: string
  website?: string
  formStartedAt?: number
  captchaToken?: string
  source?: string
}): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchJson<{ message?: string }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return {
      success: true,
      message: response.message || 'Thank you for contacting us!',
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send message right now. Please try again shortly.'
    return {
      success: false,
      message,
    }
  }
}
export async function getPrivateBookingFormLink(token: string): Promise<PublicBookingFormLink> {
  return fetchJson<PublicBookingFormLink>("/api/booking-submissions/link/" + encodeURIComponent(token), { credentials: "omit" })
}

export async function submitPreBookingSubmission(payload: {
  formData: BookingFormPayload
  pdfBase64: string
  website?: string
  formStartedAt?: number
  captchaToken?: string
}): Promise<{ success: boolean; message: string; id?: string }> {
  try {
    const response = await fetchJson<{ message?: string; id?: string }>("/api/booking-submissions/pre-booking", {
      method: "POST",
      body: JSON.stringify(payload),
      credentials: "omit",
      cache: "no-store",
    })
    return { success: true, message: response.message || "Your pre-booking form was submitted.", id: response.id }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit pre-booking form right now. Please try again shortly."
    return { success: false, message }
  }
}

export async function submitPrivateBookingSubmission(token: string, payload: {
  formData: BookingFormPayload
  pdfBase64: string
  website?: string
  formStartedAt?: number
  captchaToken?: string
}): Promise<{ success: boolean; message: string; id?: string }> {
  try {
    const response = await fetchJson<{ message?: string; id?: string }>("/api/booking-submissions/link/" + encodeURIComponent(token) + "/submit", {
      method: "POST",
      body: JSON.stringify(payload),
      credentials: "omit",
    })
    return { success: true, message: response.message || "Your booking form was submitted.", id: response.id }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit booking form right now. Please try again shortly."
    return { success: false, message }
  }
}

export async function adminLogin(payload: { email: string; password: string; twoFactorCode?: string }): Promise<{ success: boolean; user?: AdminUser; message?: string; need2FA?: boolean }> {
  try {
    const response = await fetchJson<AdminLoginResponse>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (response.need2FA) {
      return {
        success: false,
        need2FA: true,
        message: response.message || 'Enter your 2FA code to continue.',
      }
    }
    // The session itself arrives as an httpOnly cookie on this response.
    if (!response.user?.role) {
      return { success: false, message: 'Invalid login response' }
    }
    const user: AdminUser = {
      email: response.user?.email || payload.email,
      name: response.user?.name,
      role: response.user.role,
      twoFactorEnabled: response.user?.twoFactorEnabled,
      requiresTwoFactorSetup: response.user?.requiresTwoFactorSetup,
    }
    return {
      success: true,
      user,
      message: response.message,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed'
    return { success: false, message }
  }
}
export async function adminLogout(): Promise<void> {
  try {
    await fetchJson<{ message: string }>('/api/admin/logout', { method: 'POST' })
  } catch {
    // The local session is cleared regardless.
  }
}
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const response = await fetchJson<AuthMeResponse>('/api/auth/me', { method: 'GET' })
    const role = response.user?.role
    const email = response.user?.email
    if (!email || (role !== 'editor' && role !== 'superadmin')) {
      return null
    }
    return {
      email,
      name: response.user?.name,
      role,
      twoFactorEnabled: response.user?.twoFactorEnabled,
      requiresTwoFactorSetup: response.user?.requiresTwoFactorSetup,
    }
  } catch {
    return null
  }
}
export async function getAdminTreks(token: string): Promise<AdminTrek[]> {
  return fetchAdminJson<AdminTrek[]>('/api/treks', token)
}
export async function createAdminTrek(token: string, payload: Partial<AdminTrek>): Promise<AdminTrek> {
  const response = await fetchAdminJson<{ trek: AdminTrek }>('/api/treks', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.trek
}
export async function updateAdminTrek(token: string, id: string, payload: Partial<AdminTrek>): Promise<AdminTrek> {
  const response = await fetchAdminJson<{ trek: AdminTrek }>(`/api/treks/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return response.trek
}
export async function deleteAdminTrek(token: string, id: string): Promise<void> {
  await fetchAdminJson<{ message: string }>(`/api/treks/${id}`, token, {
    method: 'DELETE',
  })
}
export async function getAdminBlogs(token: string): Promise<AdminBlog[]> {
  return fetchAdminJson<AdminBlog[]>('/api/blogs/admin', token)
}
export async function createAdminBlog(token: string, payload: Partial<AdminBlog>): Promise<AdminBlog> {
  return fetchAdminJson<AdminBlog>('/api/blogs', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
export async function updateAdminBlog(token: string, id: string, payload: Partial<AdminBlog>): Promise<AdminBlog> {
  return fetchAdminJson<AdminBlog>(`/api/blogs/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
export async function deleteAdminBlog(token: string, id: string): Promise<void> {
  await fetchAdminJson<{ message: string }>(`/api/blogs/${id}`, token, {
    method: 'DELETE',
  })
}
export async function getAdminGalleryItems(): Promise<AdminGalleryItem[]> {
  return fetchJson<AdminGalleryItem[]>('/api/gallery')
}
export async function createAdminGalleryItem(token: string, payload: Partial<AdminGalleryItem>): Promise<AdminGalleryItem> {
  return fetchAdminJson<AdminGalleryItem>('/api/gallery', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
export async function updateAdminGalleryItem(token: string, id: string, payload: Partial<AdminGalleryItem>): Promise<AdminGalleryItem> {
  return fetchAdminJson<AdminGalleryItem>(`/api/gallery/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
export async function deleteAdminGalleryItem(token: string, id: string): Promise<void> {
  await fetchAdminJson<{ message: string }>(`/api/gallery/${id}`, token, {
    method: 'DELETE',
  })
}
export async function getAdminGalleryHero(): Promise<{ heroImageUrl: string }> {
  return fetchJson<{ heroImageUrl: string }>('/api/gallery/hero')
}
export async function updateAdminGalleryHero(token: string, heroImageUrl: string): Promise<{ heroImageUrl: string }> {
  return fetchAdminJson<{ heroImageUrl: string }>('/api/gallery/hero', token, {
    method: 'PUT',
    body: JSON.stringify({ heroImageUrl }),
  })
}
export async function getAdminMessages(token: string): Promise<AdminContactMessage[]> {
  return fetchAdminJson<AdminContactMessage[]>('/api/contact/admin', token)
}

export async function getAdminNotificationSummary(token: string): Promise<AdminNotificationSummary> {
  return fetchAdminJson<AdminNotificationSummary>('/api/admin/notifications', token)
}

export async function getAdminBookingFormLinks(token: string): Promise<AdminBookingFormLink[]> {
  return fetchAdminJson<AdminBookingFormLink[]>("/api/booking-submissions/admin/links", token)
}

export async function createAdminBookingFormLink(token: string, payload: { clientName?: string; clientEmail?: string; trekPackage?: string; notes?: string; ttlDays?: number; formConfig?: BookingFormConfig }): Promise<AdminBookingFormLink> {
  return fetchAdminJson<AdminBookingFormLink>("/api/booking-submissions/admin/links", token, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function deactivateAdminBookingFormLink(token: string, id: string): Promise<AdminBookingFormLink> {
  return fetchAdminJson<AdminBookingFormLink>("/api/booking-submissions/admin/links/" + id + "/deactivate", token, { method: "PATCH" })
}

export async function deleteAdminBookingFormLink(token: string, id: string): Promise<void> {
  await fetchAdminJson<{ message: string }>("/api/booking-submissions/admin/links/" + id, token, { method: "DELETE" })
}

export async function getAdminBookingSubmissions(token: string): Promise<AdminBookingSubmission[]> {
  return fetchAdminJson<AdminBookingSubmission[]>("/api/booking-submissions/admin", token)
}

export async function markAdminBookingRead(token: string, id: string): Promise<AdminBookingSubmission> {
  return fetchAdminJson<AdminBookingSubmission>("/api/booking-submissions/admin/" + id + "/read", token, { method: "PATCH" })
}

export async function markAdminBookingUnread(token: string, id: string): Promise<AdminBookingSubmission> {
  return fetchAdminJson<AdminBookingSubmission>("/api/booking-submissions/admin/" + id + "/unread", token, { method: "PATCH" })
}

export async function deleteAdminBookingSubmission(token: string, id: string): Promise<void> {
  await fetchAdminJson<{ message: string }>("/api/booking-submissions/admin/" + id, token, { method: "DELETE" })
}

export async function downloadAdminBookingPdf(_session: string, id: string): Promise<Blob> {
  const response = await fetch(getApiUrl("/api/booking-submissions/admin/" + id + "/pdf"), {
    credentials: "include",
    cache: "no-store",
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null
    throw new Error(body?.message || "PDF download failed: " + response.status + " " + response.statusText)
  }
  return response.blob()
}
export async function markAdminMessageRead(token: string, id: string): Promise<AdminContactMessage> {
  return fetchAdminJson<AdminContactMessage>(`/api/contact/admin/${id}/read`, token, {
    method: 'PATCH',
  })
}
export async function markAdminMessageUnread(token: string, id: string): Promise<AdminContactMessage> {
  return fetchAdminJson<AdminContactMessage>(`/api/contact/admin/${id}/unread`, token, {
    method: 'PATCH',
  })
}
export async function deleteAdminMessage(token: string, id: string): Promise<void> {
  await fetchAdminJson<{ message: string }>(`/api/contact/admin/${id}`, token, {
    method: 'DELETE',
  })
}
export async function getAdminAnalytics(token: string): Promise<AdminAnalyticsResponse> {
  return fetchAdminJson<AdminAnalyticsResponse>('/api/admin/analytics', token)
}
export async function getAdminRiskHealth(token: string): Promise<AdminRiskHealthResponse> {
  return fetchAdminJson<AdminRiskHealthResponse>('/api/security/risk-health', token)
}
export async function getAdminSslHealth(token: string): Promise<AdminSslHealthResponse> {
  return fetchAdminJson<AdminSslHealthResponse>('/api/security/ssl-health', token)
}
// Cached copy for site-wide server rendering (structured data). Revalidated
// hourly so it does not force every page into dynamic rendering.
export async function getCachedPublicSettings(): Promise<AdminSiteSettings | null> {
  try {
    const internalToken = typeof window === 'undefined' ? process.env.INTERNAL_API_TOKEN : undefined
    const response = await fetch(getApiUrl('/api/settings'), {
      headers: internalToken ? { 'x-internal-api-token': internalToken } : {},
      next: { revalidate: 3600 },
    })
    if (!response.ok) return null
    return (await response.json()) as AdminSiteSettings
  } catch {
    return null
  }
}
export interface AdminLead {
  _id: string
  email: string
  name?: string
  source: string
  marketingConsent: boolean
  marketingConsentAt?: string | null
  signupCount: number
  lastSignupAt: string
  createdAt: string
}
export async function submitLead(payload: { email: string; name?: string; marketingConsent: boolean; source?: string; website?: string }): Promise<void> {
  await fetchJson<{ ok: boolean }>('/api/leads', { method: 'POST', body: JSON.stringify({ source: 'packing-list', ...payload }) })
}
export async function getAdminLeads(token: string): Promise<AdminLead[]> {
  return fetchAdminJson<AdminLead[]>('/api/leads/admin', token)
}
export async function deleteAdminLead(token: string, id: string): Promise<void> {
  await fetchAdminJson<{ ok: boolean }>(`/api/leads/admin/${id}`, token, { method: 'DELETE' })
}
export function adminLeadsExportUrl(onlyConsented = false) {
  return getApiUrl(`/api/leads/admin/export.csv${onlyConsented ? '?consent=1' : ''}`)
}
export interface ReviewRequestInfo {
  status: 'pending' | 'sent' | 'skipped' | 'failed'
  sentAt: string | null
  error: string
  automaticSendingEnabled: boolean
  scheduledFor: string | null
  preview: { subject: string; text: string }
}
export async function getReviewRequest(token: string, bookingId: string): Promise<ReviewRequestInfo> {
  return fetchAdminJson<ReviewRequestInfo>(`/api/booking-submissions/admin/${bookingId}/review-request`, token)
}
export async function sendReviewRequestNow(token: string, bookingId: string): Promise<void> {
  await fetchAdminJson(`/api/booking-submissions/admin/${bookingId}/review-request/send`, token, { method: 'POST' })
}
export async function setReviewRequestStatus(token: string, bookingId: string, status: 'skipped' | 'pending'): Promise<void> {
  await fetchAdminJson(`/api/booking-submissions/admin/${bookingId}/review-request`, token, { method: 'PATCH', body: JSON.stringify({ status }) })
}
export interface TrustSummary {
  rating: number | null
  reviewCount: number | null
  writeReviewUrl: string | null
  associations: Array<{ name: string; logoUrl: string }>
  verifiedRegistrations: string[]
}
// Trust signals (Google rating, memberships, verified registrations) from admin data.
export async function getTrustSummary(): Promise<TrustSummary | null> {
  try {
    const internalToken = typeof window === 'undefined' ? process.env.INTERNAL_API_TOKEN : undefined
    const response = await fetch(getApiUrl('/api/trust'), {
      headers: internalToken ? { 'x-internal-api-token': internalToken } : {},
      ...(typeof window === 'undefined' ? { next: { revalidate: 1800 } } : {}),
    })
    if (!response.ok) return null
    return (await response.json()) as TrustSummary
  } catch {
    return null
  }
}
export interface SiteReview {
  id: string
  name: string
  rating: number
  text: string
  date: string | null
  url: string | null
  avatar: string | null
}
export interface SiteReviews {
  available: boolean
  averageRating: number | null
  totalReviewCount: number | null
  writeReviewUrl: string | null
  showBranding: boolean
  reviews: SiteReview[]
}
// Google reviews, fetched and cached by our backend (no third-party calls from
// the visitor's browser). Revalidated every 30 minutes.
export async function getSiteReviews(): Promise<SiteReviews | null> {
  try {
    const internalToken = typeof window === 'undefined' ? process.env.INTERNAL_API_TOKEN : undefined
    const response = await fetch(getApiUrl('/api/reviews'), {
      headers: internalToken ? { 'x-internal-api-token': internalToken } : {},
      next: { revalidate: 1800 },
    })
    if (!response.ok) return null
    return (await response.json()) as SiteReviews
  } catch {
    return null
  }
}
export async function getAdminSettings(): Promise<AdminSiteSettings> {
  return fetchJson<AdminSiteSettings>('/api/settings')
}
export async function beginAdminTwoFactorSetup(token: string): Promise<AdminTwoFactorSetupResponse> {
  return fetchAdminJson<AdminTwoFactorSetupResponse>('/api/admin/2fa/setup', token, {
    method: 'POST',
  })
}
export async function verifyAdminTwoFactorSetup(token: string, code: string): Promise<{ message: string }> {
  return fetchAdminJson<{ message: string }>('/api/admin/2fa/verify', token, {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}
export async function disableAdminTwoFactor(token: string, code: string): Promise<{ message: string }> {
  return fetchAdminJson<{ message: string }>('/api/admin/2fa/disable', token, {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}
export async function updateAdminSettings(token: string, payload: AdminSiteSettings): Promise<AdminSiteSettings> {
  return fetchAdminJson<AdminSiteSettings>('/api/settings', token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
export async function getRegistrationsAffiliations(): Promise<PublicRegistrationDocument[]> {
  return fetchJson<PublicRegistrationDocument[]>('/api/settings/registrations-affiliations')
}
export async function getAdminRegistrationsAffiliations(token: string): Promise<RegistrationDocument[]> {
  return fetchAdminJson<RegistrationDocument[]>('/api/settings/registrations-affiliations/admin', token)
}
export async function updateRegistrationDocument(
  token: string,
  code: string,
  payload: RegistrationDocumentPayload
): Promise<RegistrationDocument> {
  return fetchAdminJson<RegistrationDocument>(
    `/api/settings/registrations-affiliations/${code}`,
    token,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  )
}
export async function addRegistrationDocument(
  token: string,
  payload: RegistrationDocumentPayload & { title: string; code: string }
): Promise<RegistrationDocument> {
  return fetchAdminJson<RegistrationDocument>('/api/settings/registrations-affiliations', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
export async function deleteRegistrationDocument(token: string, code: string): Promise<void> {
  return fetchAdminJson<void>(`/api/settings/registrations-affiliations/${code}`, token, {
    method: 'DELETE',
  })
}
export async function getAdminHero(): Promise<AdminHero> {
  return fetchJson<AdminHero>('/api/hero')
}
export async function updateAdminHero(token: string, payload: AdminHero): Promise<AdminHero> {
  return fetchAdminJson<AdminHero>('/api/hero', token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
export async function getAdminAbout(): Promise<AdminAbout> {
  return fetchJson<AdminAbout>('/api/about')
}
export async function updateAdminAbout(token: string, payload: AdminAbout): Promise<AdminAbout> {
  return fetchAdminJson<AdminAbout>('/api/about', token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
export async function getAdminActivities(token: string): Promise<AdminActivity[]> {
  return fetchAdminJson<AdminActivity[]>('/api/activities/admin/all', token)
}
export async function getActivities(): Promise<PublicActivity[]> {
  return fetchJson<PublicActivity[]>('/api/activities')
}
export async function createAdminActivity(token: string, payload: Partial<AdminActivity>): Promise<AdminActivity> {
  const response = await fetchAdminJson<{ activity: AdminActivity }>('/api/activities', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.activity
}
export async function updateAdminActivity(token: string, id: string, payload: Partial<AdminActivity>): Promise<AdminActivity> {
  const response = await fetchAdminJson<{ activity: AdminActivity }>(`/api/activities/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return response.activity
}
export async function deleteAdminActivity(token: string, id: string): Promise<void> {
  await fetchAdminJson<{ message: string }>(`/api/activities/${id}`, token, {
    method: 'DELETE',
  })
}
export interface TravelGuide {
  _id?: string
  id?: string
  title: string
  slug: string
  category: string
  description: string
  icon?: string
  content: string
  order: number
  region?: string
  section?: string
  relatedGuides?: string[]
  isActive: boolean
  viewCount: number
  createdAt?: string
  updatedAt?: string
}
export interface GuideCategory {
  name: string
  count: number
}
export async function getGuides(): Promise<{ guides: TravelGuide[]; categories: GuideCategory[] }> {
  try {
    return await fetchJson<{ guides: TravelGuide[]; categories: GuideCategory[] }>('/api/guides')
  } catch (error) {
    console.error('Error fetching guides:', error)
    return { guides: [], categories: [] }
  }
}
export async function getGuideBySlug(slug: string): Promise<TravelGuide | null> {
  try {
    const data = await fetchJson<{ guide: TravelGuide }>(`/api/guides/slug/${encodeURIComponent(slug)}`)
    if (!data.guide) throw new Error('Invalid guide response')
    return data.guide
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return null
    throw error
  }
}
export async function getAdminGuides(token: string): Promise<TravelGuide[]> {
  const response = await fetchAdminJson<{ guides: TravelGuide[] }>('/api/guides/admin', token)
  return response.guides || []
}
export async function getGuidesByCategory(category: string): Promise<TravelGuide[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/guides/category/${category}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    if (!response.ok) throw new Error(`Failed to fetch guides by category: ${response.status}`)
    const data = await response.json()
    return data.guides || []
  } catch (error) {
    console.error(`Error fetching guides for category ${category}:`, error)
    return []
  }
}
export async function getPermitFees(region?: string): Promise<{ [key: string]: string | number }> {
  try {
    const url = region ? `${API_BASE_URL}/api/guides/permits/${region}` : `${API_BASE_URL}/api/guides/permits`
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    if (!response.ok) throw new Error(`Failed to fetch permit fees: ${response.status}`)
    const data = await response.json()
    return data.fees || {}
  } catch (error) {
    console.error('Error fetching permit fees:', error)
    return {}
  }
}
export async function createGuide(token: string, payload: Partial<TravelGuide>): Promise<TravelGuide> {
  return fetchAdminJson<TravelGuide>('/api/guides', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
export async function updateGuide(token: string, id: string, payload: Partial<TravelGuide>): Promise<TravelGuide> {
  return fetchAdminJson<TravelGuide>(`/api/guides/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
export async function deleteGuide(token: string, id: string): Promise<void> {
  await fetchAdminJson<{ message: string }>(`/api/guides/${id}`, token, {
    method: 'DELETE',
  })
}
export interface AdminFaqItem {
  question: string
  answer: string
  order: number
  /** Topic tab on /faq ('' = guessed from the question). */
  category?: string
}
export interface AdminFaq {
  heroTitle?: string
  heroSubtitle?: string
  heroImageUrl?: string
  faqs?: AdminFaqItem[]
  updatedAt?: string
}
export async function getAdminFaq(): Promise<AdminFaq> {
  return fetchJson<AdminFaq>('/api/faq')
}
export async function updateAdminFaq(token: string, payload: AdminFaq): Promise<AdminFaq> {
  return fetchAdminJson<AdminFaq>('/api/faq', token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

// ============= ALERTS =============
export async function getAlerts(): Promise<AdminAlert[]> {
  try {
    return await fetchJson<AdminAlert[]>('/api/alerts')
  } catch {
    return []
  }
}

export async function getAlertsByType(type: 'global' | 'destinations'): Promise<AdminAlert[]> {
  try {
    return await fetchJson<AdminAlert[]>(`/api/alerts/type/${type}`)
  } catch {
    return []
  }
}

export async function getAdminAlerts(token: string): Promise<AdminAlert[]> {
  try {
    return await fetchAdminJson<AdminAlert[]>('/api/alerts/admin/all', token)
  } catch {
    return []
  }
}

export async function createAlert(token: string, payload: Partial<AdminAlert>): Promise<AdminAlert> {
  return fetchAdminJson<AdminAlert>('/api/alerts', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateAlert(token: string, id: string, payload: Partial<AdminAlert>): Promise<AdminAlert> {
  return fetchAdminJson<AdminAlert>(`/api/alerts/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteAlert(token: string, id: string): Promise<void> {
  await fetchAdminJson<{ message: string }>(`/api/alerts/${id}`, token, {
    method: 'DELETE',
  })
}

// ============= ADMIN USER MANAGEMENT =============
export async function createAdminInvite(token: string, email: string): Promise<AdminInvite> {
  return fetchAdminJson<AdminInvite>('/api/admin/invites', token, {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function listAdminInvites(token: string): Promise<AdminInvite[]> {
  const response = await fetchAdminJson<AdminInvite[] | { invites: AdminInvite[] }>('/api/admin/invites', token)
  if (Array.isArray(response)) return response
  return response.invites || []
}

export async function revokeAdminInvite(token: string, inviteId: string): Promise<{ message: string }> {
  return fetchAdminJson<{ message: string }>(`/api/admin/invites/${inviteId}`, token, {
    method: 'DELETE',
  })
}

export async function listAdminUsers(token: string): Promise<AdminManagedUser[]> {
  return fetchAdminJson<AdminManagedUser[]>('/api/admin/admins', token)
}

export async function disableAdminUser(token: string, userId: string): Promise<{ message: string }> {
  return fetchAdminJson<{ message: string }>(`/api/admin/admins/${userId}`, token, {
    method: 'DELETE',
  })
}

export async function acceptAdminInvite(inviteToken: string, email: string, password: string, name?: string): Promise<{ message: string }> {
  return fetchJson<{ message: string }>('/api/admin/invites/accept', {
    method: 'POST',
    body: JSON.stringify({ token: inviteToken, email, password, name }),
  })
}

export async function updateAdminUserStatus(token: string, userId: string, status: 'active' | 'suspended' | 'disabled'): Promise<{ message: string }> {
  return fetchAdminJson<{ message: string }>(`/api/admin/users/${userId}/status`, token, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export interface AuditLogsResponse {
  logs: AuditLog[]
  total: number
  limit: number
  offset: number
}

export async function listAuditLogs(
  token: string,
  options: { action?: string; actor?: string; outcome?: string; limit?: number; offset?: number } = {}
): Promise<AuditLogsResponse> {
  const params = new URLSearchParams()
  if (options.action) params.append('action', options.action)
  if (options.actor) params.append('actor', options.actor)
  if (options.outcome) params.append('outcome', options.outcome)
  if (options.limit) params.append('limit', String(options.limit))
  if (options.offset) params.append('offset', String(options.offset))

  const queryString = params.toString()
  const url = `/api/admin/audit-logs${queryString ? '?' + queryString : ''}`

  return fetchAdminJson<AuditLogsResponse>(url, token)
}

export { API_BASE_URL }

export async function renameAdminGalleryCategory(token: string, category: string, newCategory: string): Promise<{ category: string; updatedCount: number }> {
  return fetchAdminJson('/api/gallery/categories/rename', token, {
    method: 'PUT',
    body: JSON.stringify({ category, newCategory }),
  })
}
