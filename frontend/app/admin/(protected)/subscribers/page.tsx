'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, MailCheck, Search, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AdminPageHeader, EmptyState, StatusToasts } from '@/components/admin/form-kit'
import { useConfirm } from '@/components/admin/use-confirm'
import { adminLeadsExportUrl, deleteAdminLead, getAdminLeads, type AdminLead } from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'
import { cn } from '@/lib/utils'

export default function AdminSubscribersPage() {
  const [leads, setLeads] = useState<AdminLead[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'consented'>('all')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [askConfirm, confirmDialog] = useConfirm()
  const token = getAdminToken()

  const refresh = async () => {
    if (!token) return
    setLoading(true)
    try {
      setLeads(await getAdminLeads(token))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscribers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const consentedCount = leads.filter((lead) => lead.marketingConsent).length

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return leads.filter((lead) => {
      if (filter === 'consented' && !lead.marketingConsent) return false
      return !q || lead.email.includes(q) || (lead.name || '').toLowerCase().includes(q)
    })
  }, [leads, filter, query])

  const onDelete = async (lead: AdminLead) => {
    if (!token) return
    if (!(await askConfirm({ title: `Delete ${lead.email}?`, description: 'Use this when someone asks to be removed. This cannot be undone.' }))) return
    setError('')
    setMessage('')
    try {
      await deleteAdminLead(token, lead._id)
      setLeads((prev) => prev.filter((item) => item._id !== lead._id))
      setMessage('Subscriber deleted.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subscriber')
    }
  }

  return (
    <div className="space-y-6">
      {confirmDialog}
      <StatusToasts error={error} message={message} />
      <AdminPageHeader
        title="Subscribers"
        description="People who downloaded the free packing list. Only send marketing emails to those who opted in to trek tips."
        actions={
          <>
            <Button variant="outline" asChild className="gap-2">
              <a href={adminLeadsExportUrl(true)}><Download className="h-4 w-4" /> Export opted-in ({consentedCount})</a>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <a href={adminLeadsExportUrl(false)}><Download className="h-4 w-4" /> Export all</a>
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-lg border border-border bg-card p-1" role="tablist" aria-label="Filter subscribers">
          {([['all', `All (${leads.length})`], ['consented', `Opted in to tips (${consentedCount})`]] as const).map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={filter === key} onClick={() => setFilter(key)} className={cn('rounded-md px-3 py-1.5 text-sm font-medium transition-colors', filter === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input type="search" className="h-10 pl-9" placeholder="Search email or name…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search subscribers" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl border border-border bg-card" />)}</div>
      ) : leads.length === 0 ? (
        <EmptyState icon={<Users className="h-5 w-5" />} title="No subscribers yet" description="Sign-ups from the free packing list (/packing-list) appear here." />
      ) : visible.length === 0 ? (
        <EmptyState icon={<Search className="h-5 w-5" />} title="No matching subscribers" />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {visible.map((lead) => (
            <li key={lead._id} className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{lead.email}</p>
                <p className="text-xs text-muted-foreground">
                  {lead.name ? `${lead.name} · ` : ''}Signed up {new Date(lead.createdAt).toLocaleDateString()}
                  {lead.signupCount > 1 ? ` · ${lead.signupCount} times` : ''}
                </p>
              </div>
              {lead.marketingConsent ? (
                <Badge variant="outline" className="gap-1 border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <MailCheck className="h-3 w-3" /> Opted in{lead.marketingConsentAt ? ` ${new Date(lead.marketingConsentAt).toLocaleDateString()}` : ''}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">List only</Badge>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => void onDelete(lead)} aria-label={`Delete ${lead.email}`}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
