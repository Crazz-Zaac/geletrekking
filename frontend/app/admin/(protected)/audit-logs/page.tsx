'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { listAuditLogs, type AuditLog } from '@/lib/api'
import { getAdminToken, getAdminUser } from '@/lib/admin-auth'
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACTIONS = [
  'auth.login',
  'auth.logout',
  'auth.2fa.setup',
  'auth.2fa.disable',
  'admin.invite.create',
  'admin.invite.accept',
  'admin.user.status',
  'trek.create',
  'trek.update',
  'trek.delete',
  'blog.create',
  'blog.update',
  'blog.delete',
  'activity.create',
  'activity.update',
  'activity.delete',
  'gallery.create',
  'gallery.update',
  'gallery.delete',
]

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  const [user, setUser] = useState<any>(null)
  
  const [action, setAction] = useState('')
  const [outcome, setOutcome] = useState('')
  const [limit, setLimit] = useState(50)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const t = getAdminToken()
    const u = getAdminUser()
    setToken(t || '')
    setUser(u)

    if (t && u?.role === 'superadmin') {
      loadLogs(t, 0)
    } else {
      setLoading(false)
    }
  }, [])

  const loadLogs = async (t: string, off: number) => {
    setLoading(true)
    setError('')
    try {
      const data = await listAuditLogs(t, {
        action: action || undefined,
        outcome: outcome || undefined,
        limit,
        offset: off,
      })
      setLogs(data.logs)
      setTotal(data.total)
      setOffset(off)
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const onFilter = () => {
    loadLogs(token, 0)
  }

  const onNextPage = () => {
    loadLogs(token, offset + limit)
  }

  const onPrevPage = () => {
    loadLogs(token, Math.max(0, offset - limit))
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  const getActionLabel = (act: string) => {
    const parts = act.split('.')
    return parts[parts.length - 1].replace(/_/g, ' ')
  }

  if (!user || user.role !== 'superadmin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">View security and activity logs</p>
        </div>
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Only superadmins can view audit logs.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">Security and activity logs for compliance and monitoring</p>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter logs by action and outcome</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Action</label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  {ACTIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Outcome</label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger>
                  <SelectValue placeholder="All outcomes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All outcomes</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Results per page</label>
              <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={onFilter} disabled={loading} className="w-full">
            {loading ? 'Loading...' : 'Apply Filters'}
          </Button>
        </CardContent>
      </Card>

      {/* Logs List */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading logs...</p>
          </CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No logs found matching your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>
              Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {logs.map((log, idx) => (
                <div
                  key={log._id || idx}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border',
                    log.outcome === 'success'
                      ? 'border-green-200/50 bg-green-50/30 dark:border-green-800/30 dark:bg-green-950/10'
                      : 'border-red-200/50 bg-red-50/30 dark:border-red-800/30 dark:bg-red-950/10'
                  )}
                >
                  <div className="shrink-0 mt-1">
                    {log.outcome === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{log.action}</span>
                      {log.targetLabel && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                          {log.targetLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {log.actorEmail || 'System'} • {formatDate(log.createdAt)}
                    </p>
                    {log.ip && (
                      <p className="text-xs text-muted-foreground">
                        IP: {log.ip}
                      </p>
                    )}
                    {log.meta && Object.keys(log.meta).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Meta: {JSON.stringify(log.meta).substring(0, 100)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevPage}
              disabled={offset === 0 || loading}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={offset + limit >= total || loading}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-base">ℹ️ About Audit Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>What's logged:</strong> All admin authentication events (login, 2FA), user management actions (invites, status changes), and content mutations (create, update, delete).
          </p>
          <p>
            <strong>Information captured:</strong> Actor email, action type, target resource, outcome (success/failure), timestamp, IP address, and user-agent.
          </p>
          <p>
            <strong>Purpose:</strong> Security monitoring, compliance audits, and accountability. Only superadmins can access these logs.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
