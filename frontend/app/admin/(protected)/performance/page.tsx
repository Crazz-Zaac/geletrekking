'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAdminAnalytics, getAdminRiskHealth, type AdminRiskHealthResponse } from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Users,
  TrendingUp,
  Globe,
  MapPin,
  Clock,
  Activity,
  Eye,
  Download,
  ShieldCheck,
  Database,
  AlertTriangle,
} from 'lucide-react'

type PerformanceMetric = {
  label: string
  value: string | number
  change: string
  changeHint?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

type VisitorData = {
  date: string
  inquiries: number
  contentUpdates: number
}

type RegionData = {
  name: string
  count: number
}

type DeviceData = {
  name: string
  value: number
}

const REGION_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']

export default function PerformancePage() {
  const [visitorData, setVisitorData] = useState<VisitorData[]>([])
  const [regionData, setRegionData] = useState<RegionData[]>([])
  const [deviceData, setDeviceData] = useState<DeviceData[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [riskHealth, setRiskHealth] = useState<AdminRiskHealthResponse | null>(null)
  const [isRiskRefreshing, setIsRiskRefreshing] = useState(false)
  const [autoRefreshRisk, setAutoRefreshRisk] = useState(true)
  const [riskRefreshIntervalSec, setRiskRefreshIntervalSec] = useState<number>(20)
  const [lastRiskRefreshAt, setLastRiskRefreshAt] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')

      try {
        const token = getAdminToken()
        if (!token) {
          setError('Missing admin token. Please log in again.')
          setLoading(false)
          return
        }

        const [analytics, security] = await Promise.all([
          getAdminAnalytics(token),
          getAdminRiskHealth(token),
        ])

        const liveMetrics: PerformanceMetric[] = [
          {
            label: 'Total Inquiries',
            value: analytics.metrics.totalInquiries.toLocaleString(),
            change: analytics.metrics.inquiriesChangePct,
            changeHint: 'vs previous 7 days',
            icon: Users,
            color: 'text-blue-600 dark:text-blue-400',
          },
          {
            label: 'Content Items',
            value: analytics.metrics.contentItems.toLocaleString(),
            change: analytics.metrics.contentChangePct,
            changeHint: 'new items vs previous 7 days',
            icon: Eye,
            color: 'text-purple-600 dark:text-purple-400',
          },
          {
            label: 'Avg. Guide Views',
            value: analytics.metrics.avgGuideViews.toLocaleString(),
            change: `${analytics.metrics.totalGuideViews.toLocaleString()} total`,
            changeHint: 'across travel guides',
            icon: Clock,
            color: 'text-emerald-600 dark:text-emerald-400',
          },
          {
            label: 'Unread Rate',
            value: `${analytics.metrics.unreadRate.toFixed(1)}%`,
            change: `${analytics.metrics.unreadMessages} unread`,
            changeHint: 'contact inbox health',
            icon: TrendingUp,
            color: 'text-orange-600 dark:text-orange-400',
          },
        ]

        setVisitorData(analytics.trends)
        setRegionData(analytics.regions)
        setDeviceData(analytics.contentMix)
        setMetrics(liveMetrics)
        setRiskHealth(security)
        setLastRiskRefreshAt(new Date().toISOString())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics data.')
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [])

  useEffect(() => {
    if (!autoRefreshRisk) return

    const timer = window.setInterval(async () => {
      try {
        const token = getAdminToken()
        if (!token) return
        const security = await getAdminRiskHealth(token)
        setRiskHealth(security)
        setLastRiskRefreshAt(new Date().toISOString())
      } catch {}
    }, Math.max(5, riskRefreshIntervalSec) * 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [autoRefreshRisk, riskRefreshIntervalSec])

  const refreshRiskHealth = async () => {
    if (isRiskRefreshing) return
    setIsRiskRefreshing(true)
    try {
      const token = getAdminToken()
      if (!token) {
        setError('Missing admin token. Please log in again.')
        return
      }
      const security = await getAdminRiskHealth(token)
      setRiskHealth(security)
      setLastRiskRefreshAt(new Date().toISOString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to refresh risk status right now.')
    } finally {
      setIsRiskRefreshing(false)
    }
  }

  const handleExport = () => {
    const csv = [
      ['Metric', 'Value', 'Change'],
      ...metrics.map((m) => [m.label, m.value, m.change]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Website Performance</h1>
        </div>
        <p className="text-muted-foreground">Loading analytics data...</p>
      </div>
    )
  }

  const topRegion = regionData[0]
  const strongestContent = deviceData[0]
  const inquiriesMetric = metrics.find((item) => item.label === 'Total Inquiries')
  const unreadMetric = metrics.find((item) => item.label === 'Unread Rate')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Website Performance
          </h1>
          <p className="text-muted-foreground mt-1">Live analytics generated from current admin data and inquiry activity.</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-4">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className="border-border bg-gradient-to-br from-background to-muted/30 hover:shadow-lg transition">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs font-medium uppercase tracking-wide">
                    {metric.label}
                  </CardDescription>
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{metric.change}</p>
                  <p className="text-[11px] text-muted-foreground">{metric.changeHint || 'latest window'}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {riskHealth && (
        <Card className="border-border bg-gradient-to-br from-slate-50/40 via-zinc-50/30 to-emerald-50/30 dark:from-slate-950/30 dark:via-zinc-950/20 dark:to-emerald-950/20">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Security Risk Store Status
                </CardTitle>
                <CardDescription>Live anti-abuse storage health from backend behavior analysis pipeline</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={autoRefreshRisk}
                    onChange={(event) => setAutoRefreshRisk(event.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  Auto refresh
                </label>
                <select
                  value={riskRefreshIntervalSec}
                  onChange={(event) => setRiskRefreshIntervalSec(Number(event.target.value))}
                  disabled={!autoRefreshRisk}
                  className="h-9 rounded-md border border-border bg-background px-2 text-xs"
                >
                  <option value={10}>Every 10s</option>
                  <option value={20}>Every 20s</option>
                  <option value={30}>Every 30s</option>
                  <option value={60}>Every 60s</option>
                </select>
                <Button variant="outline" size="sm" onClick={refreshRiskHealth} disabled={isRiskRefreshing}>
                  {isRiskRefreshing ? 'Refreshing...' : 'Refresh Now'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-xs text-muted-foreground">
              Last updated: {lastRiskRefreshAt ? new Date(lastRiskRefreshAt).toLocaleTimeString() : '—'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border border-border bg-background/80">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Current Mode</p>
                <p className={`mt-2 text-lg font-bold ${riskHealth.mode === 'redis' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {riskHealth.mode === 'redis' ? 'Redis Active' : 'Memory Fallback'}
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-background/80">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Redis Reachability</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {riskHealth.redis.reachable ? 'Reachable' : 'Unreachable'}
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-background/80">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Memory Profiles</p>
                <p className="mt-2 text-sm text-foreground font-semibold">
                  IP: {riskHealth.memoryProfiles.ip.toLocaleString()} · Device: {riskHealth.memoryProfiles.device.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-background/80">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Last Error</p>
                <p className="mt-2 text-sm text-foreground">
                  {riskHealth.redis.lastError ? (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      {riskHealth.redis.lastError}
                    </span>
                  ) : (
                    'No active errors'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Visitor Trends */}
        <Card className="border-border xl:col-span-2 bg-gradient-to-br from-blue-50/30 to-cyan-50/30 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Visitor Trends
            </CardTitle>
            <CardDescription>Last 7 days inquiry and content update activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visitorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="inquiries" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="contentUpdates" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card className="border-border bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Content Mix
            </CardTitle>
            <CardDescription>Distribution of currently published content</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={REGION_COLORS[index % REGION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card className="border-border bg-gradient-to-br from-emerald-50/30 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Geographic Distribution
          </CardTitle>
          <CardDescription>Trek distribution by region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* List View */}
            <div className="space-y-3">
              {regionData.map((region, index) => (
                <div key={region.name} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: REGION_COLORS[index % REGION_COLORS.length] }}
                    />
                    <span className="font-medium text-sm text-foreground">{region.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">{region.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card className="border-border bg-gradient-to-br from-amber-50/30 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/20">
        <CardHeader>
          <CardTitle className="text-lg">Performance Insights</CardTitle>
          <CardDescription>Automated insights based on live data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white dark:bg-slate-950 border border-border">
              <h4 className="font-semibold text-sm text-foreground mb-2">📨 Inquiry Momentum</h4>
              <p className="text-xs text-muted-foreground">
                Total inquiries are currently {inquiriesMetric?.value ?? '0'} with a {inquiriesMetric?.change ?? '0.0%'} trend in the recent weekly window.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-slate-950 border border-border">
              <h4 className="font-semibold text-sm text-foreground mb-2">📍 Regional Coverage</h4>
              <p className="text-xs text-muted-foreground">
                {topRegion
                  ? `${topRegion.name} currently leads with ${topRegion.count} trek entries. Consider adding more content for underrepresented regions.`
                  : 'No region data available yet. Add trek entries with region tags to unlock this insight.'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-slate-950 border border-border">
              <h4 className="font-semibold text-sm text-foreground mb-2">📦 Content Focus</h4>
              <p className="text-xs text-muted-foreground">
                {strongestContent
                  ? `${strongestContent.name} represents ${strongestContent.value}% of your content mix. Balance this with supporting formats to improve discoverability.`
                  : 'Publish treks, blogs, and guides to generate content distribution insights.'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-slate-950 border border-border">
              <h4 className="font-semibold text-sm text-foreground mb-2">📬 Inbox Health</h4>
              <p className="text-xs text-muted-foreground">
                {unreadMetric
                  ? `${unreadMetric.change} (${unreadMetric.value}) in your contact inbox. Keep response turnaround tight to improve lead quality.`
                  : 'No contact inbox activity yet.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
