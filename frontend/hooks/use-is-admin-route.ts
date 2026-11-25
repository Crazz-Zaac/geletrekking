'use client'

import { usePathname, useSelectedLayoutSegment } from 'next/navigation'

/**
 * True on any admin page, including the login page served from the secret
 * ADMIN_LOGIN_PATH (a proxy rewrite, so the browser URL does not start with
 * /admin). The selected layout segment reflects the route actually rendered.
 * Must be called from a component rendered by the root layout.
 */
export function useIsAdminRoute(): boolean {
  const segment = useSelectedLayoutSegment()
  const pathname = usePathname() || ''
  return segment === 'admin' || pathname === '/admin' || pathname.startsWith('/admin/')
}
