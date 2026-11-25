import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Secret, unguessable path that serves the admin login page (e.g. "/k7Qx2mP9vR4tW8zB").
 * When set, the well-known /admin/login returns 404 and signed-out visits to /admin/*
 * return 404 instead of redirecting, so nothing reveals where the login lives.
 * When unset (local dev), /admin/login keeps working as before.
 */
const ADMIN_LOGIN_PATH = (() => {
  const raw = (process.env.ADMIN_LOGIN_PATH || '').trim().replace(/\/+$/, '')
  if (!raw) return null
  const value = raw.startsWith('/') ? raw : `/${raw}`
  if (!/^\/[A-Za-z0-9_-]{16,}$/.test(value) || value.startsWith('/admin') || value.startsWith('/api')) {
    console.warn('ADMIN_LOGIN_PATH ignored: use a single segment of at least 16 letters, digits, "-" or "_".')
    return null
  }
  return value
})()

const notFound = (request: NextRequest) => {
  const response = NextResponse.rewrite(new URL('/__not-found', request.url))
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}

/** Sensitive admin pages: never cached, never indexed, and the URL never leaks via Referer. */
const withPrivateHeaders = (response: NextResponse) => {
  response.headers.set('Cache-Control', 'no-store, private, max-age=0')
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  return response
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams, hostname } = request.nextUrl

  if (ADMIN_LOGIN_PATH && pathname === ADMIN_LOGIN_PATH) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin/login'
    return withPrivateHeaders(NextResponse.rewrite(loginUrl))
  }

  if (hostname === 'www.geletrekking.com') {
    const canonicalUrl = request.nextUrl.clone()
    canonicalUrl.hostname = 'geletrekking.com'
    return NextResponse.redirect(canonicalUrl, 308)
  }

  if (pathname === '/blog' && searchParams.has('tag') && !searchParams.get('tag')?.trim()) {
    const canonicalUrl = request.nextUrl.clone()
    canonicalUrl.searchParams.delete('tag')
    return NextResponse.redirect(canonicalUrl, 308)
  }

  const maintenanceMode =
    process.env.MAINTENANCE_MODE === 'true' ||
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'

  const maintenanceBypassRoutes = [
    '/maintenance',
    '/admin',
    '/api',
    '/_next',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
  ]

  const isBypassRoute = maintenanceBypassRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (maintenanceMode && !isBypassRoute) {
    const maintenanceUrl = new URL('/maintenance', request.url)
    return NextResponse.redirect(maintenanceUrl)
  }

  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')

  if (pathname === '/private-booking' || pathname.startsWith('/private-booking/')) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, private, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Referrer-Policy', 'no-referrer')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
    return response
  }

  if (isAdminRoute) {
    if (pathname === '/admin/login') {
      // The real login lives at the secret path; the well-known one does not exist.
      return ADMIN_LOGIN_PATH ? notFound(request) : withPrivateHeaders(NextResponse.next())
    }

    // Invite acceptance is protected by its one-time token, not by a session.
    if (pathname === '/admin/invite') {
      return withPrivateHeaders(NextResponse.next())
    }

    // httpOnly session cookie set by the backend at login (validated by the API).
    const token = request.cookies.get('gele_admin_session')?.value

    if (!token) {
      if (ADMIN_LOGIN_PATH) return notFound(request)
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    return withPrivateHeaders(NextResponse.next())
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
}