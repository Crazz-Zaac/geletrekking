import { blogPosts as fallbackBlogPosts, testimonials as fallbackTestimonials, treks as fallbackTreks } from '@/lib/data'
import type { Trek } from '@/lib/data'

export interface UiBlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  image: string
  category: string
  author: string
  date: string
  readTime: string
  content: string
}

export interface UiTestimonial {
  id: string
  name: string
  country: string
  trek: string
  rating: number
  text: string
  date: string
  avatar: string
}

export interface AdminUser {
  email: string
  role: 'admin' | 'superadmin'
}

interface AdminLoginResponse {
  token: string
  role: 'admin' | 'superadmin'
  user?: {
    email: string
    role: 'admin' | 'superadmin'
  }
  message?: string
}

interface AuthMeResponse {
  user?: {
    email?: string
    role?: string
  }
}

export interface AdminTrek {
  _id: string
  name: string
  description: string
  image_url?: string
  duration_days?: number
  difficulty?: 'Easy' | 'Moderate' | 'Hard'
  price_usd?: number
  is_optional?: boolean
  is_active?: boolean
  is_featured?: boolean
  createdAt?: string
}

export interface AdminBlog {
  _id: string
  slug: string
  title: string
  excerpt?: string
  content: string
  coverImage?: string
  author?: string
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
  isRead: boolean
  createdAt: string
}

export interface AdminSiteSettings {
  siteName?: string
  logoUrl?: string
  phone?: string
  email?: string
  address?: string
  social?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
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

export interface AdminAbout {
  heroTitle?: string
  heroSubtitle?: string
  heroImageUrl?: string
  missionTitle?: string
  missionBody?: string
  storyTitle?: string
  storyBody?: string
  highlights?: AdminAboutHighlight[]
  stats?: AdminAboutStat[]
}

export interface AdminActivity {
  _id: string
  title: string
  description: string
  date: string
  image?: string | null
  tags?: string[]
  isPublished: boolean
}

export interface AdminTestimonial {
  _id: string
  name: string
  country?: string
  rating: number
  message: string
  image?: string | null
  isApproved: boolean
}

interface BackendTrek {
  _id: string
  name: string
  description?: string
  overview?: string
  image_url?: string
  gallery_images?: string[]
  highlights?: string[]
  itinerary?: Array<{
    day: number
    title: string
    description?: string
    altitude?: string | number
    distance?: string
  }>
  includes?: string[]
  excludes?: string[]
  best_season?: string
  start_point?: string
  end_point?: string
  price_usd?: number
  duration_days?: number
  difficulty?: 'Easy' | 'Moderate' | 'Hard'
  group_size_min?: number
  group_size_max?: number
  max_altitude_meters?: number
  trek_map_embed_url?: string
  faqs?: Array<{ question: string; answer: string }>
  is_optional?: boolean
}

interface BackendBlogPost {
  _id: string
  slug: string
  title: string
  excerpt?: string
  content: string
  coverImage?: string
  author?: string
  createdAt?: string
}

interface BackendTestimonial {
  _id: string
  name: string
  country?: string
  rating: number
  message: string
  createdAt?: string
}

const configuredApiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '')
const API_BASE_URL = typeof window === 'undefined' ? configuredApiUrl : ''

const getApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

async function fetchAdminJson<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  return fetchJson<T>(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  })
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

function normalizeDifficulty(level?: BackendTrek['difficulty']): Trek['difficulty'] {
  if (level === 'Easy') return 'Easy'
  if (level === 'Moderate') return 'Moderate'
  return 'Challenging'
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

function mapTrek(trek: BackendTrek): Trek {
  const title = trek.name || 'Untitled Trek'
  const fullDescription = (trek.description || trek.overview || 'Explore this amazing Himalayan trek.').trim()
  const shortDescription = fullDescription.split('.')[0] + '.'

  return {
    id: trek._id,
    slug: slugify(title),
    title,
    region: inferRegion(title),
    duration: trek.duration_days || 0,
    difficulty: normalizeDifficulty(trek.difficulty),
    maxAltitude: trek.max_altitude_meters || 0,
    price: trek.price_usd || 0,
    groupSize: `${trek.group_size_min || 1}–${trek.group_size_max || 15}`,
    bestSeason: trek.best_season || 'All year',
    transportation: [trek.start_point, trek.end_point].filter(Boolean).join(' → ') || 'On request',
    tourType: trek.is_optional ? 'Optional Trek' : 'Group / Private',
    shortDescription,
    fullDescription,
    image: trek.image_url || '/images/hero-himalaya.jpg',
    highlights: trek.highlights || [],
    itinerary: (trek.itinerary || []).map((day) => ({
      day: day.day,
      title: day.title,
      description: day.description || '',
      altitude: toNumber(day.altitude),
      distance: day.distance,
      accommodation: 'Teahouse',
    })),
    includes: trek.includes || [],
    excludes: trek.excludes || [],
    faqs: trek.faqs || [],
    gallery: trek.gallery_images && trek.gallery_images.length > 0
      ? trek.gallery_images
      : [trek.image_url || '/images/hero-himalaya.jpg'],
    mapEmbed: trek.trek_map_embed_url,
  }
}

function mapBlog(post: BackendBlogPost): UiBlogPost {
  return {
    id: post._id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || '',
    image: post.coverImage || '/images/blog-guide.jpg',
    category: 'Blog',
    author: post.author || 'Gele Trek Team',
    date: formatDate(post.createdAt),
    readTime: estimateReadTime(post.content || ''),
    content: post.content || '',
  }
}

function mapTestimonial(item: BackendTestimonial): UiTestimonial {
  return {
    id: item._id,
    name: item.name,
    country: item.country || 'Nepal',
    trek: 'Himalayan Trek',
    rating: item.rating,
    text: item.message,
    date: formatDate(item.createdAt),
    avatar: toAvatar(item.name),
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

export async function getBlogs(): Promise<UiBlogPost[]> {
  try {
    const data = await fetchJson<BackendBlogPost[]>('/api/blogs')
    return data.map(mapBlog)
  } catch {
    return fallbackBlogPosts
  }
}

export async function getBlogBySlug(slug: string): Promise<UiBlogPost | null> {
  try {
    const data = await fetchJson<BackendBlogPost>(`/api/blogs/${slug}`)
    return mapBlog(data)
  } catch {
    const fallback = fallbackBlogPosts.find((post) => post.slug === slug)
    return fallback || null
  }
}

export async function getTestimonials(): Promise<UiTestimonial[]> {
  try {
    const data = await fetchJson<BackendTestimonial[]>('/api/testimonials')
    return data.map(mapTestimonial)
  } catch {
    return fallbackTestimonials
  }
}

export async function submitContactMessage(payload: { name: string; email: string; message: string }): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchJson<{ message?: string }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    return {
      success: true,
      message: response.message || 'Thank you for contacting us!',
    }
  } catch {
    return {
      success: false,
      message: 'Unable to send message right now. Please try again shortly.',
    }
  }
}

export async function adminLogin(payload: { email: string; password: string }): Promise<{ success: boolean; token?: string; user?: AdminUser; message?: string }> {
  try {
    const response = await fetchJson<AdminLoginResponse>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (!response.token) {
      return { success: false, message: 'Invalid login response' }
    }

    const user: AdminUser = {
      email: response.user?.email || payload.email,
      role: response.user?.role || response.role,
    }

    return {
      success: true,
      token: response.token,
      user,
      message: response.message,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed'
    return { success: false, message }
  }
}

export async function getCurrentAdmin(token: string): Promise<AdminUser | null> {
  try {
    const response = await fetchJson<AuthMeResponse>('/api/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const role = response.user?.role
    const email = response.user?.email

    if (!email || (role !== 'admin' && role !== 'superadmin')) {
      return null
    }

    return {
      email,
      role,
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

export async function getAdminSettings(): Promise<AdminSiteSettings> {
  return fetchJson<AdminSiteSettings>('/api/settings')
}

export async function updateAdminSettings(token: string, payload: AdminSiteSettings): Promise<AdminSiteSettings> {
  return fetchAdminJson<AdminSiteSettings>('/api/settings', token, {
    method: 'PUT',
    body: JSON.stringify(payload),
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

export async function getAdminTestimonials(token: string): Promise<AdminTestimonial[]> {
  return fetchAdminJson<AdminTestimonial[]>('/api/testimonials/admin', token)
}

export async function createAdminTestimonial(token: string, payload: Partial<AdminTestimonial>): Promise<void> {
  await fetchAdminJson<{ testimonialId: string }>('/api/testimonials', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateAdminTestimonial(token: string, id: string, payload: Partial<AdminTestimonial>): Promise<AdminTestimonial> {
  return fetchAdminJson<AdminTestimonial>(`/api/testimonials/admin/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteAdminTestimonial(token: string, id: string): Promise<void> {
  await fetchAdminJson<{ message: string }>(`/api/testimonials/admin/${id}`, token, {
    method: 'DELETE',
  })
}

export { API_BASE_URL }
