'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  CalendarCheck,
  ExternalLink,
  FileText,
  Inbox,
  Lock,
  Mail,
  Mountain,
  Newspaper,
  Plus,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { visibleNav } from '@/components/admin/admin-nav'
import { getAdminToken, getAdminUser } from '@/lib/admin-auth'
import {
  getAdminBlogs,
  getAdminNotificationSummary,
  getAdminSslHealth,
  getAdminTreks,
  listAuditLogs,
  type AdminBlog,
  type AdminNotificationSummary,
  type AdminSslHealthResponse,
  type AuditLog,
} from '@/lib/api'

type DashboardData = {
  notifications: AdminNotificationSummary | null
  trekCount: number | null
  blogs: AdminBlog[] | null
  ssl: AdminSslHealthResponse | null
  failedLogins: AuditLog[] | null
}

const EMPTY: DashboardData = {
  notifications: null,
  trekCount: null,
  blogs: null,
  ssl: null,
  failedLogins: null,
}

function settledValue<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === 'fulfilled' ? result.value : null
}

function timeAgo(value?: string) {
  if (!value) return ''
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

function StatCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
  highlight = false,
}: {
  label: string
  value: number | null
  hint: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  highlight?: boolean
}) {
  return (
    <Link href={href} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
      <Card className={`h-full transition-colors group-hover:border-primary/50 ${highlight ? 'border-primary/40 bg-primary/5' : ''}`}>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center justify-between text-xs uppercase tracking-wide">
            <span className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </span>
            <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
          </CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums">
            {value === null ? <Skeleton className="h-9 w-12" /> : value}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-muted-foreground">{hint}</CardContent>
      </Card>
    </Link>
  )
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>(EMPTY)
  const [loaded, setLoaded] = useState(false)
  const [isSuperadmin, setIsSuperadmin] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const token = getAdminToken()
    const user = getAdminUser()
    const superadmin = user?.role === 'superadmin'
    setIsSuperadmin(superadmin)
    setUserName(user?.name || '')
    if (!token) return

    const load = async () => {
      const [notifications, treks, blogs, ssl, audit] = await Promise.allSettled([
        getAdminNotificationSummary(token),
        getAdminTreks(token),
        getAdminBlogs(token),
        superadmin ? getAdminSslHealth(token) : Promise.reject(new Error('not permitted')),
        superadmin
          ? listAuditLogs(token, { outcome: 'failure', limit: 5 })
          : Promise.reject(new Error('not permitted')),
      ])

      setData({
        notifications: settledValue(notifications),
        trekCount: settledValue(treks)?.length ?? null,
        blogs: settledValue(blogs),
        ssl: settledValue(ssl),
        failedLogins: settledValue(audit)?.logs ?? null,
      })
      setLoaded(true)
    }

    void load()
  }, [])

  const drafts = (data.blogs || []).filter((blog) => !blog.isPublished)
  const publishedCount = data.blogs ? data.blogs.length - drafts.length : null
  const unreadItems = data.notifications?.items || []
  const sslWarning = data.ssl && data.ssl.status !== 'valid'

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{userName ? `Welcome back, ${userName.split(' ')[0]}` : 'Dashboard'}</h1>
          <p className="text-sm text-muted-foreground">What needs your attention today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/admin/treks"><Plus className="mr-1 h-4 w-4" />New trek</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/blogs"><Plus className="mr-1 h-4 w-4" />New blog post</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/" target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-1 h-4 w-4" />View site</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {sslWarning && (
          <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold text-foreground">SSL certificate needs attention ({data.ssl?.status})</p>
              <p className="text-muted-foreground">
                {data.ssl?.daysRemaining !== null && data.ssl?.daysRemaining !== undefined
                  ? `${data.ssl.daysRemaining} days remaining. `
                  : ''}
                Install a new Cloudflare Origin Certificate on the server (see docker/SSL_SETUP.md).
              </p>
            </div>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Unread messages"
            value={data.notifications ? data.notifications.unreadMessages : loaded ? 0 : null}
            hint="Contact form enquiries"
            href="/admin/messages"
            icon={Mail}
            highlight={(data.notifications?.unreadMessages || 0) > 0}
          />
          <StatCard
            label="New bookings"
            value={data.notifications ? data.notifications.unreadBookings : loaded ? 0 : null}
            hint="Unread booking forms"
            href="/admin/bookings"
            icon={CalendarCheck}
            highlight={(data.notifications?.unreadBookings || 0) > 0}
          />
          <StatCard label="Treks" value={data.trekCount ?? (loaded ? 0 : null)} hint="Trekking packages" href="/admin/treks" icon={Mountain} />
          <StatCard
            label="Blog posts"
            value={publishedCount ?? (loaded ? 0 : null)}
            hint={drafts.length ? `${drafts.length} draft${drafts.length === 1 ? '' : 's'} waiting` : 'Published articles'}
            href="/admin/blogs"
            icon={Newspaper}
          />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Inbox className="h-5 w-5 text-primary" />
                Needs attention
              </CardTitle>
              <CardDescription>Unread enquiries and booking forms, newest first.</CardDescription>
            </CardHeader>
            <CardContent>
              {!loaded ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : unreadItems.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  All caught up. No unread messages or bookings.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {unreadItems.map((item) => (
                    <li key={`${item.type}-${item.id}`}>
                      <Link href={item.href} className="flex items-center gap-3 py-3 hover:text-primary">
                        {item.type === 'booking' ? (
                          <CalendarCheck className="h-4 w-4 shrink-0 text-primary" />
                        ) : (
                          <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">{item.description}</span>
                          <span className="block text-xs text-muted-foreground">{item.title}</span>
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(item.createdAt)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Drafts
              </CardTitle>
              <CardDescription>Posts not yet published. Fresh content helps search ranking.</CardDescription>
            </CardHeader>
            <CardContent>
              {!loaded ? (
                <Skeleton className="h-20 w-full" />
              ) : drafts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No drafts. Start a new post to keep the blog active.</p>
              ) : (
                <ul className="space-y-2">
                  {drafts.slice(0, 5).map((draft) => (
                    <li key={draft._id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">{draft.title || 'Untitled'}</span>
                      <Badge variant="secondary" className="shrink-0">Draft</Badge>
                    </li>
                  ))}
                </ul>
              )}
              <Button asChild variant="outline" size="sm" className="mt-4 w-full justify-between">
                <Link href="/admin/blogs">Manage blog <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {isSuperadmin && (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  SSL certificate
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {!loaded ? (
                  <Skeleton className="h-10 w-full" />
                ) : data.ssl ? (
                  <div className="space-y-1">
                    <Badge variant={data.ssl.status === 'valid' ? 'secondary' : 'destructive'}>{data.ssl.status}</Badge>
                    {data.ssl.daysRemaining !== null && (
                      <p className="text-muted-foreground">{data.ssl.daysRemaining} days remaining</p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Status unavailable.</p>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="h-5 w-5 text-primary" />
                  Recent failed sign-ins
                </CardTitle>
                <CardDescription>Repeated failures from one IP may indicate password guessing.</CardDescription>
              </CardHeader>
              <CardContent>
                {!loaded ? (
                  <Skeleton className="h-16 w-full" />
                ) : !data.failedLogins || data.failedLogins.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No failed sign-ins recorded.</p>
                ) : (
                  <ul className="divide-y divide-border text-sm">
                    {data.failedLogins.map((log, index) => (
                      <li key={log._id || index} className="flex flex-wrap items-center justify-between gap-2 py-2">
                        <span className="truncate">{log.actorEmail || 'unknown account'}</span>
                        <span className="text-xs text-muted-foreground">
                          {String(log.meta?.reason || log.action).replace(/_/g, ' ')} · {log.ip || 'unknown IP'} · {timeAgo(log.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/audit-logs">Audit logs <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/performance"><TrendingUp className="mr-1 h-4 w-4" />Performance</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>

      <section aria-labelledby="manage-heading" className="space-y-4">
        <div>
          <h2 id="manage-heading" className="text-lg font-semibold text-foreground">Manage your site</h2>
          <p className="text-sm text-muted-foreground">
            Everything in one place. Tip: press <kbd className="rounded border border-border bg-muted px-1 font-mono text-[11px]">Ctrl K</kbd> to search any page or setting.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleNav(isSuperadmin ? 'superadmin' : 'editor')
            .filter((group) => group.label !== 'Overview')
            .map((group) => (
              <Card key={group.label} className="gap-0 py-0">
                <CardHeader className="px-5 pb-2 pt-4">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</CardTitle>
                </CardHeader>
                <CardContent className="px-2 pb-2">
                  <ul>
                    {group.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-foreground">{item.label}</span>
                              <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
                            </span>
                            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </CardContent>
              </Card>
            ))}
        </div>
      </section>
    </div>
  )
}
