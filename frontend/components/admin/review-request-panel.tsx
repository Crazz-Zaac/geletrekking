'use client'

import { useEffect, useState } from 'react'
import { Ban, ChevronDown, Loader2, Send, Star, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useConfirm } from '@/components/admin/use-confirm'
import { getReviewRequest, sendReviewRequestNow, setReviewRequestStatus, type ReviewRequestInfo } from '@/lib/api'
import { cn } from '@/lib/utils'

const STATUS: Record<ReviewRequestInfo['status'], { label: string; className: string }> = {
  pending: { label: 'Scheduled', className: 'border-sky-300 bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300' },
  sent: { label: 'Sent', className: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  skipped: { label: "Won't send", className: 'border-border bg-muted text-muted-foreground' },
  failed: { label: 'Failed', className: 'border-destructive/40 bg-destructive/5 text-destructive' },
}

/** Post-trek Google review request for one booking: status, preview, actions. */
export function ReviewRequestPanel({ token, bookingId, email }: { token: string; bookingId: string; email: string }) {
  const [info, setInfo] = useState<ReviewRequestInfo | null>(null)
  const [busy, setBusy] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [askConfirm, confirmDialog] = useConfirm()

  const load = async () => {
    try {
      setInfo(await getReviewRequest(token, bookingId))
    } catch {
      setInfo(null)
    }
  }

  useEffect(() => {
    setInfo(null)
    setShowPreview(false)
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true)
    try {
      await action()
      toast.success(success)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const sendNow = async () => {
    if (!(await askConfirm({ title: `Email ${email} now?`, description: 'They will receive the review request below. It is sent only once.', confirmLabel: 'Send email' }))) return
    await run(() => sendReviewRequestNow(token, bookingId), 'Review request sent.')
  }

  if (!info) return null
  const status = STATUS[info.status]

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
          <Button size="sm" className="gap-1.5" disabled={busy} onClick={() => void sendNow()}>
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
        <Button size="sm" variant="ghost" className="gap-1" onClick={() => setShowPreview((value) => !value)} aria-expanded={showPreview}>
          Preview email <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showPreview && 'rotate-180')} />
        </Button>
      </div>

      {showPreview && (
        <div className="rounded-md border border-border bg-muted/30 p-3 text-xs">
          <p className="font-medium text-foreground">Subject: {info.preview.subject}</p>
          <pre className="mt-2 whitespace-pre-wrap font-sans leading-relaxed text-muted-foreground">{info.preview.text}</pre>
        </div>
      )}
    </div>
  )
}
