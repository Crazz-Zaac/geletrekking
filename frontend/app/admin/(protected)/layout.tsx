'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Bell,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileText,
  Flame,
  Info,
  LayoutDashboard,
  LogOut,
  Mail,
  Mountain,
  Newspaper,
  Image as ImageIcon,
  Settings,
  BookOpen,
  HelpCircle,
  Building2, 
  ShieldCheck,
  Users,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { clearAdminSession, getAdminToken, getAdminUser } from '@/lib/admin-auth'
import { getAdminNotificationSummary, getCurrentAdmin, type AdminNotificationSummary, type AdminUser } from '@/lib/api'
import { cn } from '@/lib/utils'

interface ProtectedAdminLayoutProps {
  children: React.ReactNode
}

type NavItem = {
  label: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  available: boolean
  roles?: Array<'editor' | 'superadmin'>
}
const navItems: NavItem[] = [
  // Primary Navigation
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, available: true },
  { label: 'Destinations', href: '/admin/treks', icon: Mountain, available: true },
  { label: 'Activities', href: '/admin/activities', icon: Activity, available: true },
  { label: 'Blogs', href: '/admin/blogs', icon: Newspaper, available: true },
  
  // Media & Gallery
  { label: 'Gallery', href: '/admin/gallery', icon: ImageIcon, available: true },
  
  // Page Management
  { label: 'Hero', href: '/admin/hero', icon: Flame, available: true },
  { label: 'About', href: '/admin/about', icon: Info, available: true },
  { label: 'FAQ', href: '/admin/faq', icon: HelpCircle, available: true },
  { label: 'Trip Plan', href: '/admin/trip-plan', icon: BookOpen, available: true },
  
  // Community & Feedback
  { label: 'Bookings', href: '/admin/bookings', icon: FileText, available: true },
  { label: 'Messages', href: '/admin/messages', icon: Mail, available: true },
  
  // Settings
  { label: 'Company', href: '/admin/company', icon: Building2, available: true },
  { label: 'Account Security', href: '/admin/account-security', icon: ShieldCheck, available: true, roles: ['editor', 'superadmin'] },
  { label: 'Site Settings', href: '/admin/settings', icon: Settings, available: true },
  
  // Admin & Security
  { label: 'Users', href: '/admin/users', icon: Users, available: true, roles: ['superadmin'] },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: BarChart3, available: true, roles: ['superadmin'] },
]

export default function ProtectedAdminLayout({ children }: ProtectedAdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [notifications, setNotifications] = useState<AdminNotificationSummary | null>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    const verifySession = async () => {
      const token = getAdminToken()
      if (!token) {
        router.replace('/admin/login')
        return
      }

      const remoteUser = await getCurrentAdmin(token)
      if (!remoteUser) {
        clearAdminSession()
        router.replace('/admin/login')
        return
      }

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

  const localUser = useMemo(() => getAdminUser(), [])

  const onLogout = () => {
    clearAdminSession()
    router.replace('/admin/login')
  }

  if (checking) {
    return <main className="min-h-screen bg-background" />
  }

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            'sticky top-0 h-screen border-r border-border bg-card transition-all duration-300',
            sidebarOpen ? 'w-64' : 'w-16'
          )}
        >
          <div className="h-full flex flex-col p-3">
            <div className={cn('mb-4', sidebarOpen ? 'px-2' : 'px-0')}>
              <Link href="/admin" className="inline-flex items-center gap-2 font-semibold text-primary">
                <Compass className="w-5 h-5" />
                {sidebarOpen ? <span>Gele Admin</span> : null}
              </Link>
              {sidebarOpen ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {user?.email || localUser?.email || 'Admin'}
                </p>
              ) : null}
            </div>

            <nav className="space-y-1 flex-1">
              {navItems.filter((item) => !item.roles || item.roles.includes((user?.role || localUser?.role) as AdminUser['role'])).map((item) => {
                const Icon = item.icon
                const active = !!item.href && pathname === item.href

                if (!item.available || !item.href) {
                  return (
                    <div
                      key={item.label}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-2 py-2 text-sm text-muted-foreground/80',
                        !sidebarOpen && 'justify-center px-0'
                      )}
                      title={`${item.label} (coming soon)`}
                    >
                      <Icon className="w-4 h-4" />
                      {sidebarOpen ? <span>{item.label}</span> : null}
                    </div>
                  )
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
                      !sidebarOpen && 'justify-center px-0',
                      active
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4" />
                    {sidebarOpen ? <span>{item.label}</span> : null}
                  </Link>
                )
              })}
            </nav>

            <div className="pt-3 border-t border-border space-y-2">
              <Button
                variant="outline"
                onClick={onLogout}
                className={cn('w-full', !sidebarOpen && 'px-0')}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                {sidebarOpen ? <span>Logout</span> : null}
              </Button>

              <Button
                variant="ghost"
                onClick={() => setSidebarOpen((value) => !value)}
                className={cn('w-full', !sidebarOpen && 'px-0')}
                title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                {sidebarOpen ? <span>Collapse</span> : null}
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6">
          <Card className="border-border p-4 mb-4 bg-background/80 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin Console</p>
                <h1 className="text-lg font-semibold">Content Management Dashboard</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNotificationsOpen((value) => !value)}
                    className="relative gap-2"
                    aria-label="Admin notifications"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="hidden sm:inline">Notifications</span>
                    {notifications?.totalUnread ? (
                      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white">
                        {notifications.totalUnread > 99 ? '99+' : notifications.totalUnread}
                      </span>
                    ) : null}
                  </Button>
                  {notificationsOpen ? (
                    <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-background shadow-lg">
                      <div className="border-b border-border p-3">
                        <p className="text-sm font-semibold text-foreground">Dashboard notifications</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {notifications?.totalUnread ? `${notifications.unreadMessages} message(s), ${notifications.unreadBookings} booking form(s)` : 'No unread notifications'}
                        </p>
                      </div>
                      <div className="max-h-80 overflow-y-auto p-2">
                        {notifications?.items?.length ? notifications.items.map((item) => (
                          <Link
                            key={`${item.type}-${item.id}`}
                            href={item.href}
                            onClick={() => setNotificationsOpen(false)}
                            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                          >
                            <span className="font-medium text-foreground">{item.title}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">{item.description}</span>
                            <span className="mt-1 block text-[11px] text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</span>
                          </Link>
                        )) : (
                          <p className="px-3 py-6 text-center text-sm text-muted-foreground">All caught up.</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 border-t border-border text-xs font-medium">
                        <Link href="/admin/messages" onClick={() => setNotificationsOpen(false)} className="p-3 text-center hover:bg-muted">Messages</Link>
                        <Link href="/admin/bookings" onClick={() => setNotificationsOpen(false)} className="border-l border-border p-3 text-center hover:bg-muted">Bookings</Link>
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="text-sm text-muted-foreground">
                  Role: <span className="font-medium text-foreground">{user?.role || localUser?.role || 'admin'}</span>
                </div>
              </div>
            </div>
          </Card>
          {children}
        </main>
      </div>
    </div>
  )
}
