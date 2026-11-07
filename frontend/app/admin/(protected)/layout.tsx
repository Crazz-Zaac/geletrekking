'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import {
  Bell,
  ChevronsLeft,
  ChevronsRight,
  AtSign,
  ExternalLink,
  LogOut,
  Menu,
  Mountain,
  Search,
  ShieldCheck, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { AdminCommandMenu } from '@/components/admin/admin-command-menu'
import { Toaster } from '@/components/ui/sonner'
import { findActiveItem, visibleNav, type AdminRole } from '@/components/admin/admin-nav'
import { clearAdminSession, getAdminToken, getAdminUser, saveAdminSession } from '@/lib/admin-auth'
import {
  adminLogout,
  getAdminNotificationSummary,
  getCurrentAdmin,
  type AdminNotificationSummary,
  type AdminUser,
} from '@/lib/api'
import { cn } from '@/lib/utils'

const COLLAPSED_KEY = 'gele_admin_sidebar_collapsed'

function formatCount(value: number) {
  return value > 99 ? '99+' : String(value)
}

function initials(user: AdminUser | null) {
  const source = user?.name || user?.email || 'A'
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

type SidebarNavProps = {
  role?: AdminRole
  pathname: string
  collapsed: boolean
  notifications: AdminNotificationSummary | null
  onNavigate?: () => void
}

function SidebarNav({ role, pathname, collapsed, notifications, onNavigate }: SidebarNavProps) {
  const active = findActiveItem(pathname)

  return (
    <nav aria-label="Admin" className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
      {visibleNav(role).map((group) => (
        <div key={group.label}>
          {collapsed ? (
            <div className="mx-auto mb-2 h-px w-6 bg-border" aria-hidden="true" />
          ) : (
            <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              {group.label}
            </p>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = active?.item.href === item.href
              const count = item.badge && notifications
                ? item.badge === 'messages' ? notifications.unreadMessages : notifications.unreadBookings
                : 0
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    aria-current={isActive ? 'page' : undefined}
                    title={collapsed ? `${item.label}${count ? ` (${count} unread)` : ''}` : undefined}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      collapsed && 'justify-center px-0',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!collapsed && item.external && <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" aria-label="opens in a new tab" />}
                    {count > 0 && (
                      collapsed ? (
                        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                      ) : (
                        <span
                          className={cn(
                            'min-w-5 rounded-full px-1.5 text-center text-[11px] font-semibold leading-5',
                            isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-red-500 text-white'
                          )}
                        >
                          {formatCount(count)}
                          <span className="sr-only"> unread</span>
                        </span>
                      )
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/admin"
      className={cn('flex items-center gap-2.5 rounded-lg px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', collapsed && 'justify-center px-0')}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Mountain className="h-5 w-5" aria-hidden="true" />
      </span>
      {!collapsed && (
        <span className="leading-tight">
          <span className="block text-sm font-semibold text-foreground">Gele Trekking</span>
          <span className="block text-xs text-muted-foreground">Admin</span>
        </span>
      )}
    </Link>
  )
}

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [notifications, setNotifications] = useState<AdminNotificationSummary | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === '1')
    } catch {
      // Storage unavailable; keep the default.
    }
    setUser(getAdminUser())
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, value ? '0' : '1')
      } catch {
        // Ignore storage errors.
      }
      return !value
    })
  }

  useEffect(() => {
    const verifySession = async () => {
      // The session is an httpOnly cookie; the server is the source of truth.
      const remoteUser = await getCurrentAdmin()
      if (!remoteUser) {
        clearAdminSession()
        router.replace('/admin/login')
        return
      }
      saveAdminSession(remoteUser)

      if (remoteUser.requiresTwoFactorSetup && pathname !== '/admin/account-security') {
        router.replace('/admin/account-security')
        return
      }

      setUser(remoteUser)
      setChecking(false)
    }

    void verifySession()
  }, [pathname, router])

  useEffect(() => {
    const token = getAdminToken()
    if (!token || checking) return

    let cancelled = false
    const loadNotifications = async () => {
      try {
        const summary = await getAdminNotificationSummary(token)
        if (!cancelled) setNotifications(summary)
      } catch {
        if (!cancelled) setNotifications(null)
      }
    }

    void loadNotifications()
    const intervalId = window.setInterval(loadNotifications, 30000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [checking, pathname])

  const onLogout = useCallback(async () => {
    await adminLogout()
    clearAdminSession()
    router.replace('/admin/login')
  }, [router])

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30" aria-busy="true">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
        <span className="sr-only">Checking your session…</span>
      </main>
    )
  }

  const role = user?.role
  const active = findActiveItem(pathname)
  const unread = notifications?.totalUnread || 0

  return (
    <div className="admin-ui min-h-screen bg-muted/30 text-foreground">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-3">
          <Brand collapsed={collapsed} />
        </div>
        <SidebarNav role={role} pathname={pathname} collapsed={collapsed} notifications={notifications} />
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className={cn('w-full justify-start gap-2 text-muted-foreground', collapsed && 'justify-center px-0')}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SheetDescription className="sr-only">Pages in the admin dashboard</SheetDescription>
          <div className="flex h-16 items-center border-b border-border px-3">
            <Brand collapsed={false} />
          </div>
          <SidebarNav
            role={role}
            pathname={pathname}
            collapsed={false}
            notifications={notifications}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className={cn('flex min-h-screen flex-col transition-[padding] duration-200', collapsed ? 'lg:pl-[72px]' : 'lg:pl-64')}>
        {/* Top bar */}
        <header
          className="sticky z-20 flex h-16 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 md:px-6"
          style={{ top: 'env(safe-area-inset-top, 0px)' }}
        >
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </Button>

          <div className="min-w-0 flex-1">
            {active && (
              <p className="hidden text-xs text-muted-foreground sm:block">{active.group.label}</p>
            )}
            <p className="truncate text-sm font-semibold text-foreground sm:text-base">{active?.item.label || 'Admin'}</p>
          </div>

          <Button
            variant="outline"
            onClick={() => setSearchOpen(true)}
            className="h-9 gap-2 text-muted-foreground sm:w-56 sm:justify-start md:w-72"
            aria-label="Search admin pages and settings"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search…</span>
            <kbd className="pointer-events-none ml-auto hidden rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium md:inline">
              Ctrl K
            </kbd>
          </Button>

          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {formatCount(unread)}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
              <div className="border-b border-border p-3">
                <p className="text-sm font-semibold">Notifications</p>
                <p className="text-xs text-muted-foreground">
                  {unread
                    ? `${notifications?.unreadMessages || 0} message(s), ${notifications?.unreadBookings || 0} booking form(s)`
                    : 'All caught up'}
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto p-1.5">
                {notifications?.items?.length ? (
                  notifications.items.map((item) => (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={item.href}
                      onClick={() => setNotificationsOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                    >
                      <span className="font-medium">{item.description}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {item.title} · {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nothing new.</p>
                )}
              </div>
              <div className="grid grid-cols-2 border-t border-border text-xs font-medium">
                <Link href="/admin/messages" onClick={() => setNotificationsOpen(false)} className="p-3 text-center hover:bg-muted">Messages</Link>
                <Link href="/admin/bookings" onClick={() => setNotificationsOpen(false)} className="border-l border-border p-3 text-center hover:bg-muted">Bookings</Link>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 px-1.5" aria-label="Account menu">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {initials(user)}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="font-normal">
                <span className="block truncate text-sm font-medium">{user?.name || user?.email}</span>
                <span className="block truncate text-xs text-muted-foreground">{user?.email}</span>
                <span className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 text-[11px] capitalize text-muted-foreground">{role}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/account-security"><ShieldCheck className="h-4 w-4" />Account security</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/" target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" />View website</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="https://mail.zoho.com" target="_blank" rel="noopener noreferrer"><AtSign className="h-4 w-4" />Email inbox (Zoho)</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="https://app.cal.com/bookings/upcoming" target="_blank" rel="noopener noreferrer"><CalendarClock className="h-4 w-4" />Call bookings (Cal.com)</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => void onLogout()} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" />Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main id="admin-main" className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>

      <Toaster position="top-right" richColors closeButton />
      <AdminCommandMenu open={searchOpen} onOpenChange={setSearchOpen} role={role} onLogout={() => void onLogout()} />
    </div>
  )
}
