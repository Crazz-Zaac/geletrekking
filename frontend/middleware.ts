import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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

  if (isAdminRoute) {
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    const token = request.cookies.get('gele_admin_token')?.value

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
}