'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, Download, Inbox, Loader2, Mail, MailOpen, MessageCircle, Phone, RefreshCw, Search, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/admin/form-kit'
import { ReviewRequestPanel } from '@/components/admin/review-request-panel'
import type { AdminBookingFormLink, AdminBookingSubmission } from '@/lib/api'
import { buildSubmissionSections, formatBookingDate, isPreBooking, whatsappDigits } from '@/lib/booking-submission-view'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'unread'

const fullName = (item: AdminBookingSubmission) => `${item.firstName} ${item.lastName}`.trim()

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-md border border-border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="break-words text-sm font-medium text-foreground">{children}</p>
    </div>
  )
}

function SubmissionDetail({
  item,
  token,
  linkConfig,
  downloading,
  onDownload,
  onToggleRead,
  onDelete,
}: {
  item: AdminBookingSubmission
  token: string
  linkConfig?: AdminBookingFormLink['formConfig']
  downloading: boolean
  onDownload: () => void
  onToggleRead: () => void
  onDelete: () => void
}) {
  const sections = useMemo(() => buildSubmissionSections(item.formData as Record<string, unknown>, linkConfig), [item.formData, linkConfig])
  const whatsapp = whatsappDigits(item.mobileWhatsapp)
  const dates = [formatBookingDate(item.trekStartDate), formatBookingDate(item.trekEndDate)].filter(Boolean).join(' to ')

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">{fullName(item)}</h2>
            {isPreBooking(item.formData as Record<string, unknown>) && <Badge variant="outline">Pre-booking</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">Submitted {formatBookingDate(item.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.pdfPurgedAt ? (
            <span className="inline-flex items-center rounded-md border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground">
              PDF removed {formatBookingDate(item.pdfPurgedAt)} (retention policy)
            </span>
          ) : (
            <Button size="sm" className="gap-1.5" disabled={downloading} onClick={onDownload}>
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} Download PDF
            </Button>
          )}
          <Button size="sm" variant="outline" className="gap-1.5" onClick={onToggleRead}>
            <MailOpen className="h-3.5 w-3.5" /> {item.isRead ? 'Mark unread' : 'Mark read'}
          </Button>
          <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700" aria-label={`Delete booking from ${fullName(item)}`} onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="gap-1.5" asChild>
          <a href={`mailto:${item.email}`}>
            <Mail className="h-3.5 w-3.5" /> {item.email}
          </a>
        </Button>
        {whatsapp && (
          <Button size="sm" variant="outline" className="gap-1.5" asChild>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          </Button>
        )}
        {item.mobileWhatsapp && (
          <Button size="sm" variant="outline" className="gap-1.5" asChild>
            <a href={`tel:${item.mobileWhatsapp.replace(/[^+\d]/g, '')}`}>
              <Phone className="h-3.5 w-3.5" /> {item.mobileWhatsapp}
            </a>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Fact label="Trek">{item.trekPackage}</Fact>
        <Fact label="Trek dates">{dates || 'Not given'}</Fact>
      </div>

      <ReviewRequestPanel token={token} bookingId={item._id} email={item.email} />

      {item.formDataPurgedAt ? (
        <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          Form answers were removed on {formatBookingDate(item.formDataPurgedAt)} under the data retention policy.
        </p>
      ) : null}

      <div className="space-y-5">
        {!item.formDataPurgedAt && sections.map((section) => (
          <section key={section.title}>
            <h3 className="border-b border-border pb-1.5 text-sm font-semibold text-foreground">{section.title}</h3>
            <dl className="mt-2.5 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {section.rows.map((row) => (
                <div key={row.label} className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{row.label}</dt>
                  <dd className="whitespace-pre-wrap break-words text-sm font-medium text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  )
}

export function SubmissionsTab({
  items,
  links,
  token,
  loading,
  downloadingId,
  onRefresh,
  onDownload,
  onSetRead,
  onDelete,
}: {
  items: AdminBookingSubmission[]
  links: AdminBookingFormLink[]
  token: string | null
  loading: boolean
  downloadingId: string | null
  onRefresh: () => void
  onDownload: (item: AdminBookingSubmission) => void
  onSetRead: (item: AdminBookingSubmission, isRead: boolean) => void
  onDelete: (item: AdminBookingSubmission) => void
}) {
  const [picked, setPicked] = useState<string | null>(null)
  const [showingDetail, setShowingDetail] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  const unreadCount = items.filter((item) => !item.isRead).length
  const filtered = useMemo(() => {
    const byStatus = filter === 'unread' ? items.filter((item) => !item.isRead) : items
    const q = query.trim().toLowerCase()
    if (!q) return byStatus
    return byStatus.filter((item) => [item.firstName, item.lastName, item.email, item.mobileWhatsapp, item.trekPackage].some((value) => (value || '').toLowerCase().includes(q)))
  }, [filter, items, query])

  // Desktop shows the newest booking straight away; that doesn't count as having read it.
  const selected = items.find((item) => item._id === picked) ?? items[0] ?? null

  const open = (item: AdminBookingSubmission) => {
    setPicked(item._id)
    setShowingDetail(true)
    // Only phones swap screens; side by side, the reader keeps their place.
    if (window.matchMedia('(max-width: 1023px)').matches) window.scrollTo({ top: 0 })
    if (!item.isRead) onSetRead(item, true)
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <div className={cn('space-y-3 rounded-xl border border-border bg-card p-3 lg:sticky lg:top-20', showingDetail && 'hidden lg:block')}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email, phone or trek" aria-label="Search bookings" className="h-10 pl-9" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {(
              [
                ['all', `All (${items.length})`],
                ['unread', `Unread (${unreadCount})`],
              ] as const
            ).map(([value, label]) => (
              <Button key={value} size="sm" variant={filter === value ? 'default' : 'outline'} aria-pressed={filter === value} onClick={() => setFilter(value)}>
                {label}
              </Button>
            ))}
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Refresh bookings" disabled={loading} onClick={onRefresh}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        </div>

        {loading && items.length === 0 ? (
          <div className="space-y-2" aria-busy="true" aria-label="Loading bookings">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-16 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-muted-foreground">{items.length === 0 ? 'No bookings yet.' : 'No bookings match.'}</p>
        ) : (
          <ul className="max-h-[70vh] space-y-1 overflow-auto lg:max-h-[calc(100vh-18rem)]">
            {filtered.map((item) => {
              const active = selected?._id === item._id
              return (
                <li key={item._id}>
                  <button
                    type="button"
                    onClick={() => open(item)}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'w-full rounded-md border p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      active ? 'border-transparent hover:bg-muted/50 lg:border-primary lg:bg-primary/5' : 'border-transparent hover:bg-muted/50'
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className={cn('truncate text-sm', item.isRead ? 'font-medium' : 'font-bold')}>{fullName(item)}</span>
                      <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                        {formatBookingDate(item.createdAt)}
                        {!item.isRead && <span className="h-2 w-2 rounded-full bg-sky-500" role="img" aria-label="Unread" />}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.trekPackage}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className={cn('rounded-xl border border-border bg-card p-4 sm:p-5', !showingDetail && 'hidden lg:block')}>
        {showingDetail && (
          <Button size="sm" variant="ghost" className="mb-3 -ml-2 gap-1.5 lg:hidden" onClick={() => setShowingDetail(false)}>
            <ArrowLeft className="h-4 w-4" /> All bookings
          </Button>
        )}
        {selected && token ? (
          <SubmissionDetail
            key={selected._id}
            item={selected}
            token={token}
            linkConfig={links.find((link) => link._id === selected.formLink)?.formConfig}
            downloading={downloadingId === selected._id}
            onDownload={() => onDownload(selected)}
            onToggleRead={() => onSetRead(selected, !selected.isRead)}
            onDelete={() => onDelete(selected)}
          />
        ) : (
          <EmptyState icon={<Inbox className="h-5 w-5" />} title="No booking selected" description="Submitted booking forms appear here." />
        )}
      </div>
    </div>
  )
}
