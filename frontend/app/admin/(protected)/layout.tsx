'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Compass,
  Flame,
  Info,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Mountain,
  Newspaper,
  Image as ImageIcon,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { clearAdminSession, getAdminToken, getAdminUser } from '@/lib/admin-auth'
import { getCurrentAdmin, type AdminUser } from '@/lib/api'
import { cn } from '@/lib/utils'

interface ProtectedAdminLayoutProps {
  children: React.ReactNode
}

type NavItem = {
  label: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  available: boolean
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, available: true },
  { label: 'Treks', href: '/admin/treks', icon: Mountain, available: true },
  { label: 'Blogs', href: '/admin/blogs', icon: Newspaper, available: true },
  { label: 'Gallery', href: '/admin/gallery', icon: ImageIcon, available: true },
  { label: 'Hero', href: '/admin/hero', icon: Flame, available: true },
  { label: 'About', href: '/admin/about', icon: Info, available: true },
  { label: 'Activities', href: '/admin/activities', icon: Activity, available: true },
  { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare, available: true },
  { label: 'Messages', href: '/admin/messages', icon: Mail, available: true },
  { label: 'Settings', href: '/admin/settings', icon: Settings, available: true },
]

export default function ProtectedAdminLayout({ children }: ProtectedAdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState<AdminUser | null>(null)

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

      setUser(remoteUser)
      setChecking(false)
    }

    void verifySession()
  }, [router])

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
              {navItems.map((item) => {
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
              <div className="text-sm text-muted-foreground">
                Role: <span className="font-medium text-foreground">{user?.role || localUser?.role || 'admin'}</span>
              </div>
            </div>
          </Card>
          {children}
        </main>
      </div>
    </div>
  )
}
