'use client'

import { useMemo, useState } from 'react'
import { Check, Copy, Link as LinkIcon, Loader2, Mail, MessageCircle, PowerOff, Settings2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState, Field, FieldGrid, TextArea } from '@/components/admin/form-kit'
import type { AdminBookingFormLink } from '@/lib/api'
import { formatBookingDate, linkState, type LinkState } from '@/lib/booking-submission-view'
import { cn } from '@/lib/utils'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const EXPIRY_CHOICES = [7, 14, 30, 60]
const EMPTY_LINK = { clientName: '', clientEmail: '', trekPackage: '', notes: '', ttlDays: 14 }

const STATE_LABEL: Record<LinkState, { label: string; className: string }> = {
  active: { label: 'Active', className: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  submitted: { label: 'Submitted', className: 'border-sky-300 bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300' },
  expired: { label: 'Expired', className: 'border-border bg-muted text-muted-foreground' },
  off: { label: 'Turned off', className: 'border-border bg-muted text-muted-foreground' },
}

export type NewLink = typeof EMPTY_LINK

function CopyButton({ value, label = 'Copy link', variant = 'outline' }: { value: string; label?: string; variant?: 'outline' | 'default' }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', value)
    }
  }
  return (
    <Button size="sm" variant={variant} className="gap-1.5" onClick={() => void copy()}>
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : label}
    </Button>
  )
}

export function LinksTab({
  links,
  trekNames,
  customizedFields,
  onEditFields,
  onCreate,
  onTurnOff,
  onDelete,
}: {
  links: AdminBookingFormLink[]
  trekNames: string[]
  customizedFields: boolean
  onEditFields: () => void
  onCreate: (link: NewLink) => Promise<string | null>
  onTurnOff: (link: AdminBookingFormLink) => void
  onDelete: (link: AdminBookingFormLink) => void
}) {
  const [form, setForm] = useState(EMPTY_LINK)
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState<{ url: string; name: string; email: string } | null>(null)

  const emailProblem = form.clientEmail.trim() && !EMAIL_RE.test(form.clientEmail.trim()) ? 'Enter a valid email address.' : undefined
  const expiresOn = new Date(Date.now() + form.ttlDays * 86400000).toISOString()
  const set = (patch: Partial<NewLink>) => setForm((prev) => ({ ...prev, ...patch }))

  const sorted = useMemo(() => {
    const rank = (link: AdminBookingFormLink) => (linkState(link) === 'active' ? 0 : 1)
    return [...links].sort((a, b) => rank(a) - rank(b))
  }, [links])

  const create = async () => {
    setCreating(true)
    const url = await onCreate(form)
    setCreating(false)
    if (!url) return
    setCreated({ url, name: form.clientName.trim(), email: form.clientEmail.trim() })
    setForm(EMPTY_LINK)
  }

  const greeting = created?.name ? `Hi ${created.name.split(/\s+/)[0]},` : 'Hello,'
  const message = created ? `${greeting}\n\nPlease fill in your booking form for your trek with Gele Trekking using this private link:\n${created.url}\n\nThank you!\nThe Gele Trekking team` : ''

  return (
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
        <div>
          <h2 className="font-semibold text-foreground">Create a private link</h2>
          <p className="text-sm text-muted-foreground">Sends a client their own booking form. Name, email and trek are filled in for them.</p>
        </div>

        {created && (
          <div className="space-y-3 rounded-lg border border-emerald-300 bg-emerald-50/60 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" /> Link ready{created.name ? ` for ${created.name}` : ''}
            </p>
            <p className="break-all rounded-md bg-background px-2.5 py-2 font-mono text-xs text-foreground">{created.url}</p>
            <div className="flex flex-wrap gap-2">
              <CopyButton value={created.url} variant="default" />
              <Button size="sm" variant="outline" className="gap-1.5" asChild>
                <a href={`mailto:${created.email}?subject=${encodeURIComponent('Your Gele Trekking booking form')}&body=${encodeURIComponent(message)}`}>
                  <Mail className="h-3.5 w-3.5" /> Email it
                </a>
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" asChild>
                <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp it
                </a>
              </Button>
            </div>
          </div>
        )}

        <FieldGrid>
          <Field label="Client name">
            <Input className="h-10" autoComplete="off" placeholder="e.g. Anna Müller" value={form.clientName} onChange={(event) => set({ clientName: event.target.value })} />
          </Field>
          <Field label="Client email" error={emailProblem}>
            <Input className="h-10" type="email" autoComplete="off" placeholder="client@example.com" value={form.clientEmail} onChange={(event) => set({ clientEmail: event.target.value })} />
          </Field>
        </FieldGrid>
        <Field label="Trek">
          <Input className="h-10" list="booking-trek-names" placeholder="Pick a trek or type your own" value={form.trekPackage} onChange={(event) => set({ trekPackage: event.target.value })} />
        </Field>
        <datalist id="booking-trek-names">
          {trekNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">Link works for</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Link works for">
            {EXPIRY_CHOICES.map((days) => (
              <button
                key={days}
                type="button"
                role="radio"
                aria-checked={form.ttlDays === days}
                onClick={() => set({ ttlDays: days })}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  form.ttlDays === days ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-muted'
                )}
              >
                {days} days
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Expires {formatBookingDate(expiresOn)}.</p>
        </div>
        <Field label="Internal notes" hint="Only admins see this.">
          <TextArea rows={2} className="min-h-0" placeholder="e.g. Group of 4, private departure on 12 Oct" value={form.notes} onChange={(event) => set({ notes: event.target.value })} />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => void create()} disabled={creating || Boolean(emailProblem)} className="gap-1.5">
            {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LinkIcon className="h-3.5 w-3.5" />}
            {creating ? 'Creating…' : 'Create link'}
          </Button>
          <button type="button" onClick={onEditFields} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline">
            <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
            {customizedFields ? 'Using your custom fields' : 'Using the standard fields'}
          </button>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="font-semibold text-foreground">Links sent ({links.length})</h2>
        {sorted.length === 0 ? (
          <EmptyState icon={<LinkIcon className="h-5 w-5" />} title="No links yet" description="Links you create will appear here." />
        ) : (
          <ul className="max-h-[70vh] divide-y divide-border overflow-auto">
            {sorted.map((link) => {
              const state = linkState(link)
              const path = link.path || (link.token ? `/private-booking/${link.token}` : '')
              const details = [link.clientEmail, link.trekPackage].filter(Boolean).join(' · ')
              return (
                <li key={link._id} className="space-y-2 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{link.clientName || 'Unnamed client'}</p>
                      {details && <p className="truncate text-xs text-muted-foreground">{details}</p>}
                      {state === 'active' && <p className="text-xs text-muted-foreground">Expires {formatBookingDate(link.expiresAt)}</p>}
                      {link.notes && <p className="mt-1 text-xs italic text-muted-foreground">{link.notes}</p>}
                    </div>
                    <Badge variant="outline" className={STATE_LABEL[state].className}>
                      {STATE_LABEL[state].label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {state === 'active' && path && <CopyButton value={`${window.location.origin}${path}`} />}
                    {state === 'active' && (
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onTurnOff(link)}>
                        <PowerOff className="h-3.5 w-3.5" /> Turn off
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => onDelete(link)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
