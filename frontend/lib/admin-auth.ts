import type { AdminUser } from '@/lib/api'

// The session token is an httpOnly cookie set by the backend; page scripts
// never see it. Only the non-secret user profile (email, role) is kept here
// so the UI can render instantly.
const USER_KEY = 'gele_admin_user'

// Returned by getAdminToken() while a session exists. It is NOT a credential:
// admin API calls authenticate with the cookie. Pages use it only as a
// "logged in" flag and pass it through to the API helpers.
export const COOKIE_SESSION = 'cookie-session'

// Leftovers from the previous localStorage/JS-cookie token storage.
const LEGACY_TOKEN_KEY = 'gele_admin_token'
const LEGACY_COOKIES = ['gele_admin_token', 'gele_admin_role']

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function clearLegacyStorage(): void {
  localStorage.removeItem(LEGACY_TOKEN_KEY)
  for (const name of LEGACY_COOKIES) {
    document.cookie = `${name}=; path=/; max-age=0; samesite=lax`
  }
}

export function saveAdminSession(user: AdminUser): void {
  if (!isBrowser()) return
  clearLegacyStorage()
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getAdminToken(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(USER_KEY) ? COOKIE_SESSION : null
}

export function getAdminUser(): AdminUser | null {
  if (!isBrowser()) return null
  const value = localStorage.getItem(USER_KEY)
  if (!value) return null

  try {
    return JSON.parse(value) as AdminUser
  } catch {
    return null
  }
}

export function clearAdminSession(): void {
  if (!isBrowser()) return
  localStorage.removeItem(USER_KEY)
  clearLegacyStorage()
}

export function isAdminRole(user: AdminUser | null): boolean {
  return !!user && (user.role === 'editor' || user.role === 'superadmin')
}
