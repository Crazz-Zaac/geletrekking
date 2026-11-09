'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Ban, ChevronDown, Loader2, Pencil, RotateCcw, Send, Star, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Field, TextArea } from '@/components/admin/form-kit'
import { useConfirm } from '@/components/admin/use-confirm'
import {
  getReviewEmailTemplate,
  getReviewRequest,
  resetReviewEmailTemplate,
  resetReviewRequestEmail,
  sendReviewRequestNow,
  setReviewRequestStatus,
  updateReviewEmailTemplate,
  updateReviewRequestEmail,
  type ReviewRequestInfo,
} from '@/lib/api'
import { cn } from '@/lib/utils'

const STATUS: Record<ReviewRequestInfo['status'], { label: string; className: string }> = {
  pending: { label: 'Scheduled', className: 'border-sky-300 bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300' },
  sent: { label: 'Sent', className: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  skipped: { label: "Won't send", className: 'border-border bg-muted text-muted-foreground' },
  failed: { label: 'Failed', className: 'border-destructive/40 bg-destructive/5 text-destructive' },
}

const PLACEHOLDERS = [
  { token: '{name}', label: 'Guest name' },
  { token: '{trek}', label: 'Trek name' },
  { token: '{reviewLink}', label: 'Review link' },
]

type Draft = { scope: 'booking' | 'all'; subject: string; text: string; customized: boolean }

/** Post-trek Google review request for one booking: status, editable email, actions. */
export function ReviewRequestPanel({ token, bookingId, email }: { token: string; bookingId: string; email: string }) {
  const [info, setInfo] = useState<ReviewRequestInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const [askConfirm, confirmDialog] = useConfirm()

  const load = async () => {
    try {
      setInfo(await getReviewRequest(token, bookingId))
    } catch {
      setInfo(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setInfo(null)
    setLoading(true)
    setShowPreview(false)
    setDraft(null)
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true)
    try {
      await action()
      toast.success(success)
      await load()
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      return false
    } finally {
      setBusy(false)
    }
  }

  const sendNow = async () => {
    if (!(await askConfirm({ title: `Email ${email} now?`, description: 'They will receive the review request below. It is sent only once.', confirmLabel: 'Send email' }))) return
    await run(() => sendReviewRequestNow(token, bookingId), 'Review request sent.')
  }

  const saveDraft = async () => {
    if (!draft) return
    const email = { subject: draft.subject, text: draft.text }
    const saved =
      draft.scope === 'all'
        ? await run(() => updateReviewEmailTemplate(token, email), 'Standard email saved.')
        : await run(() => updateReviewRequestEmail(token, bookingId, email), 'Email saved for this booking.')
    if (saved) setDraft(null)
  }

  const resetEmail = async () => {
    if (!(await askConfirm({ title: 'Go back to the standard email?', description: 'Your edits to this email will be removed.', confirmLabel: 'Use standard email' }))) return
    await run(() => resetReviewRequestEmail(token, bookingId), 'Back to the standard email.')
  }

  const editForAll = async () => {
    setBusy(true)
    try {
      setDraft({ scope: 'all', ...(await getReviewEmailTemplate(token)) })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const resetStandard = async () => {
    if (!(await askConfirm({ title: 'Restore the original wording?', description: 'Your standard email will be replaced for every booking not edited individually.', confirmLabel: 'Restore original' }))) return
    if (await run(() => resetReviewEmailTemplate(token), 'Original wording restored.')) setDraft(null)
  }

  const insertPlaceholder = (placeholder: string) => {
    if (!draft) return
    const start = messageRef.current?.selectionStart ?? draft.text.length
    const end = messageRef.current?.selectionEnd ?? draft.text.length
    setDraft({ ...draft, text: draft.text.slice(0, start) + placeholder + draft.text.slice(end) })
    requestAnimationFrame(() => {
      messageRef.current?.focus()
      messageRef.current?.setSelectionRange(start + placeholder.length, start + placeholder.length)
    })
  }

  // Holds the panel's height so the booking below doesn't jump while this loads.
  if (!info) return loading ? <div className="h-[7.5rem] animate-pulse rounded-md border border-border bg-muted/30" aria-hidden="true" /> : null
  const status = STATUS[info.status]
  const canEdit = info.status !== 'sent'
  const reviewLinkMissing = draft ? !draft.text.includes(info.reviewUrl) && !(draft.scope === 'all' && /\{reviewlink\}/i.test(draft.text)) : false

  let explanation = ''
  if (info.status === 'sent') explanation = `Sent ${info.sentAt ? new Date(info.sentAt).toLocaleString() : ''}.`
  else if (info.status === 'skipped') explanation = 'This booking will not be emailed.'
  else if (info.status === 'failed') explanation = `Sending failed${info.error ? `: ${info.error}` : ''}. You can try again.`
  else if (!info.automaticSendingEnabled) explanation = `Automatic sending is off${info.scheduledFor ? ` (would send on ${info.scheduledFor})` : ''}. You can still send it manually.`
  else explanation = info.scheduledFor ? `Will be sent automatically on ${info.scheduledFor} (2 days after the trek ends).` : 'No trek end date, so it will not be sent automatically.'

  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      {confirmDialog}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Star className="h-4 w-4 text-amber-500" aria-hidden="true" /> Google review request
        </p>
        <Badge variant="outline" className={status.className}>{status.label}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{explanation}</p>

      <div className="flex flex-wrap gap-2">
        {info.status !== 'sent' && (
          <Button size="sm" className="gap-1.5" disabled={busy || Boolean(draft)} title={draft ? 'Save or cancel your edits first' : undefined} onClick={() => void sendNow()}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Send now
          </Button>
        )}
        {(info.status === 'pending' || info.status === 'failed') && (
          <Button size="sm" variant="outline" className="gap-1.5" disabled={busy} onClick={() => void run(() => setReviewRequestStatus(token, bookingId, 'skipped'), "This booking won't be emailed.")}>
            <Ban className="h-3.5 w-3.5" /> Don&apos;t send
          </Button>
        )}
        {info.status === 'skipped' && (
          <Button size="sm" variant="outline" className="gap-1.5" disabled={busy} onClick={() => void run(() => setReviewRequestStatus(token, bookingId, 'pending'), 'Review request scheduled again.')}>
            <Undo2 className="h-3.5 w-3.5" /> Schedule again
          </Button>
        )}
        <Button size="sm" variant="ghost" className="gap-1" disabled={Boolean(draft)} onClick={() => setShowPreview((value) => !value)} aria-expanded={showPreview}>
          Preview email <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showPreview && 'rotate-180')} />
        </Button>
      </div>

      {showPreview && !draft && (
        <div className="rounded-md border border-border bg-muted/30 p-3 text-xs">
          <p className="font-medium text-foreground">Subject: {info.preview.subject}</p>
          <pre className="mt-2 whitespace-pre-wrap break-words font-sans leading-relaxed text-muted-foreground">{info.preview.text}</pre>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <Button size="sm" variant="outline" className="gap-1.5" disabled={busy} onClick={() => void editForAll()}>
              <Pencil className="h-3.5 w-3.5" /> Edit for all bookings
            </Button>
            {canEdit && (
              <Button size="sm" variant="outline" className="gap-1.5" disabled={busy} onClick={() => setDraft({ scope: 'booking', ...info.preview, customized: info.customized })}>
                <Pencil className="h-3.5 w-3.5" /> Edit for this booking
              </Button>
            )}
            {canEdit && info.customized && (
              <Button size="sm" variant="ghost" className="gap-1.5" disabled={busy} onClick={() => void resetEmail()}>
                <RotateCcw className="h-3.5 w-3.5" /> Use standard email
              </Button>
            )}
            {info.customized && <span className="text-muted-foreground">Edited for this booking, so changes for all bookings won&apos;t affect it</span>}
          </div>
        </div>
      )}

      {draft && (
        <div className="space-y-3 rounded-md border border-border bg-muted/30 p-3">
          <p className="text-sm font-medium text-foreground">{draft.scope === 'all' ? 'Standard email for all bookings' : 'Email for this booking only'}</p>
          <Field label="Subject" count={{ value: draft.subject, max: 150 }}>
            <Input className="h-10" maxLength={150} value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} />
          </Field>
          {draft.scope === 'all' && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              Insert in message:
              {PLACEHOLDERS.map(({ token: placeholder, label }) => (
                <Button key={placeholder} type="button" size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => insertPlaceholder(placeholder)}>
                  {label}
                </Button>
              ))}
            </div>
          )}
          <Field
            label="Message"
            hint={
              draft.scope === 'all'
                ? 'Used for every review email not yet sent, except bookings edited individually. Words in { } are filled in for each guest, in the subject too.'
                : 'Used for this booking only, whether it is sent automatically or with Send now.'
            }
            count={{ value: draft.text, max: 5000 }}
          >
            <TextArea ref={messageRef} rows={12} maxLength={5000} value={draft.text} onChange={(event) => setDraft({ ...draft, text: event.target.value })} />
          </Field>
          {reviewLinkMissing && (
            <p role="status" className="flex items-start gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              The Google review link is no longer in this message, so guests would have no way to leave a review.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="gap-1.5" disabled={busy || !draft.subject.trim() || !draft.text.trim()} onClick={() => void saveDraft()}>
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save email
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setDraft(null)}>Cancel</Button>
            {draft.scope === 'all' && draft.customized && (
              <Button size="sm" variant="ghost" className="gap-1.5" disabled={busy} onClick={() => void resetStandard()}>
                <RotateCcw className="h-3.5 w-3.5" /> Restore original wording
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
