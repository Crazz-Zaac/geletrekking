'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowRight, FileText, Image as ImageIcon, Mountain, Newspaper, ShieldCheck, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { API_BASE_URL } from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

type Metric = {
  label: string
  value: string
  hint: string
  icon: React.ComponentType<{ className?: string }>
}

export default function AdminDashboardPage() {
  const [trekCount, setTrekCount] = useState<number | null>(null)
  const [blogCount, setBlogCount] = useState<number | null>(null)
  const [testimonialCount, setTestimonialCount] = useState<number | null>(null)

  useEffect(() => {
    const loadCounts = async () => {
      const token = getAdminToken()
      const authHeaders: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {}

      const [treksRes, blogsRes, testimonialsRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/treks`, { cache: 'no-store' }),
        fetch(`${API_BASE_URL}/api/blogs`, { cache: 'no-store' }),
        fetch(`${API_BASE_URL}/api/testimonials`, {
          cache: 'no-store',
          headers: authHeaders,
        }),
      ])

      if (treksRes.status === 'fulfilled' && treksRes.value.ok) {
        const data = (await treksRes.value.json()) as unknown[]
        setTrekCount(Array.isArray(data) ? data.length : 0)
      }

      if (blogsRes.status === 'fulfilled' && blogsRes.value.ok) {
        const data = (await blogsRes.value.json()) as unknown[]
        setBlogCount(Array.isArray(data) ? data.length : 0)
      }

      if (testimonialsRes.status === 'fulfilled' && testimonialsRes.value.ok) {
        const data = (await testimonialsRes.value.json()) as unknown[]
        setTestimonialCount(Array.isArray(data) ? data.length : 0)
      }
    }

    void loadCounts()
  }, [])

  const metrics: Metric[] = useMemo(
    () => [
      {
        label: 'Treks',
        value: trekCount === null ? '—' : String(trekCount),
        hint: 'Public trekking packages',
        icon: Mountain,
      },
      {
        label: 'Blog Posts',
        value: blogCount === null ? '—' : String(blogCount),
        hint: 'Published articles',
        icon: Newspaper,
      },
      {
        label: 'Testimonials',
        value: testimonialCount === null ? '—' : String(testimonialCount),
        hint: 'Approved public reviews',
        icon: FileText,
      },
      {
        label: 'Auth Status',
        value: 'Active',
        hint: 'Session verified',
        icon: ShieldCheck,
      },
    ],
    [trekCount, blogCount, testimonialCount]
  )

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className="border-border bg-card/90">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wide">
                  <Icon className="w-3.5 h-3.5" />
                  {metric.label}
                </CardDescription>
                <CardTitle className="text-3xl font-bold">{metric.value}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">{metric.hint}</CardContent>
            </Card>
          )
        })}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="w-5 h-5 text-primary" />
              Admin Workflow
            </CardTitle>
            <CardDescription>
              This dashboard mirrors the old admin style with a cleaner shell, better spacing, and responsive navigation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Use the left sidebar for modules. Coming-soon modules are visible but intentionally disabled until migrated.</p>
            <p>Current integration keeps authentication strict and centralized with route protection and server identity checks.</p>
            <p>Next step is migrating each old module page (Treks, Blogs, Gallery, Messages, Settings) into this shell.</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Fast links while module migration is in progress.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/" className="block">
              <Button variant="outline" className="w-full justify-between">
                View Website
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/admin/performance" className="block">
              <Button variant="outline" className="w-full justify-between">
                Performance Analytics
                <TrendingUp className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/blog" className="block">
              <Button variant="outline" className="w-full justify-between">
                Open Public Blog
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/gallery" className="block">
              <Button variant="outline" className="w-full justify-between">
                Open Public Gallery
                <ImageIcon className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
