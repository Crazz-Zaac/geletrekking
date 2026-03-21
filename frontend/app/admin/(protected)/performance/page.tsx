'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
} from 'lucide-react'

type PerformanceMetric = {
  label: string
  value: string | number
  change: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

type VisitorData = {
  date: string
  visitors: number
  pageViews: number
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching analytics data
    // In production, this would call your actual analytics API
    const loadData = async () => {
      // Mock visitor data for the last 7 days
      const mockVisitors: VisitorData[] = [
        { date: 'Mon', visitors: 2400, pageViews: 5200 },
        { date: 'Tue', visitors: 1398, pageViews: 4210 },
        { date: 'Wed', visitors: 9800, pageViews: 12290 },
        { date: 'Thu', visitors: 3908, pageViews: 6200 },
        { date: 'Fri', visitors: 4800, pageViews: 7300 },
        { date: 'Sat', visitors: 3490, pageViews: 5900 },
        { date: 'Sun', visitors: 4300, pageViews: 6800 },
      ]

      // Mock region data
      const mockRegions: RegionData[] = [
        { name: 'Nepal', count: 3420 },
        { name: 'India', count: 2210 },
        { name: 'USA', count: 1890 },
        { name: 'UK', count: 1240 },
        { name: 'Australia', count: 890 },
        { name: 'Others', count: 1450 },
      ]

      // Mock device data
      const mockDevices: DeviceData[] = [
        { name: 'Mobile', value: 45 },
        { name: 'Desktop', value: 40 },
        { name: 'Tablet', value: 15 },
      ]

      // Mock metrics
      const mockMetrics: PerformanceMetric[] = [
        {
          label: 'Total Visitors',
          value: '28,518',
          change: '+12.5%',
          icon: Users,
          color: 'text-blue-600 dark:text-blue-400',
        },
        {
          label: 'Page Views',
          value: '47,892',
          change: '+8.2%',
          icon: Eye,
          color: 'text-purple-600 dark:text-purple-400',
        },
        {
          label: 'Avg. Session Duration',
          value: '3m 42s',
          change: '+5.1%',
          icon: Clock,
          color: 'text-emerald-600 dark:text-emerald-400',
        },
        {
          label: 'Bounce Rate',
          value: '32.4%',
          change: '-2.3%',
          icon: TrendingUp,
          color: 'text-orange-600 dark:text-orange-400',
        },
      ]

      setVisitorData(mockVisitors)
      setRegionData(mockRegions)
      setDeviceData(mockDevices)
      setMetrics(mockMetrics)
      setLoading(false)
    }

    setTimeout(() => {
      void loadData()
    }, 500)
  }, [])

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Website Performance
          </h1>
          <p className="text-muted-foreground mt-1">Real-time analytics and key performance indicators</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

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
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {metric.change} from last week
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Visitor Trends */}
        <Card className="border-border xl:col-span-2 bg-gradient-to-br from-blue-50/30 to-cyan-50/30 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Visitor Trends
            </CardTitle>
            <CardDescription>Last 7 days visitor and page view analytics</CardDescription>
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
                <Line type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="pageViews" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card className="border-border bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Device Type
            </CardTitle>
            <CardDescription>User distribution by device</CardDescription>
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
          <CardDescription>Visitor distribution by region/country</CardDescription>
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
          <CardDescription>Recommendations for website optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white dark:bg-slate-950 border border-border">
              <h4 className="font-semibold text-sm text-foreground mb-2">✓ Strong Engagement</h4>
              <p className="text-xs text-muted-foreground">Mobile users show 45% of traffic. Ensure mobile experience is optimized.</p>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-slate-950 border border-border">
              <h4 className="font-semibold text-sm text-foreground mb-2">📍 Regional Growth</h4>
              <p className="text-xs text-muted-foreground">Nepal leads with 3,420 visitors. Localize content for top regions.</p>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-slate-950 border border-border">
              <h4 className="font-semibold text-sm text-foreground mb-2">⚡ Session Quality</h4>
              <p className="text-xs text-muted-foreground">Avg. session duration: 3m 42s. Improve with longer-form content.</p>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-slate-950 border border-border">
              <h4 className="font-semibold text-sm text-foreground mb-2">🎯 Bounce Rate</h4>
              <p className="text-xs text-muted-foreground">32.4% bounce rate is healthy. Consider A/B testing CTAs.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
