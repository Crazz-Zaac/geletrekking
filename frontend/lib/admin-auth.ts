import type { AdminUser } from '@/lib/api'

const TOKEN_KEY = 'gele_admin_token'
const USER_KEY = 'gele_admin_user'
const COOKIE_KEY = 'gele_admin_token'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function setCookieToken(token: string): void {
  if (!isBrowser()) return
  const maxAge = 60 * 60 * 24 * 7
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`
}

function clearCookieToken(): void {
  if (!isBrowser()) return
  document.cookie = `${COOKIE_KEY}=; path=/; max-age=0; samesite=lax`
}

export function saveAdminSession(token: string, user: AdminUser): void {
  if (!isBrowser()) return
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  setCookieToken(token)
  // save role as a cookie so middleware can read it
  const maxAge = 60 * 60 * 24 * 7
  document.cookie = `gele_admin_role=${user.role}; path=/; max-age=${maxAge}; samesite=lax`
}

export function getAdminToken(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(TOKEN_KEY)
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
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  clearCookieToken()
  document.cookie = `gele_admin_role=; path=/; max-age=0; samesite=lax`
}
export function isAdminRole(user: AdminUser | null): boolean {
  return !!user && (user.role === 'admin' || user.role === 'superadmin')
}
