import { ExternalLink, MessageSquare } from 'lucide-react'

const TRUSTPILOT_PROFILE_URL = 'https://www.trustpilot.com/review/geletrekking.com'

interface TrustpilotWidgetProps {
  className?: string
  variant?: 'boxed' | 'plain'
}

export function TrustpilotWidget({ className, variant = 'boxed' }: TrustpilotWidgetProps) {
  const containerClassName =
    variant === 'plain'
      ? `bg-transparent p-0 shadow-none ${className || ''}`
      : `rounded-2xl border border-border bg-card/90 p-5 shadow-sm ${className || ''}`

  return (
    <section aria-label="Trustpilot reviews" className={containerClassName}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 rounded-xl border border-border bg-background p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00B67A]/10 text-[#00875A]">
          <MessageSquare className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00875A]">Trustpilot</p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">Your trekking story matters</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Visit our Trustpilot profile to read or leave an independent review. Your feedback helps fellow trekkers plan with confidence.
          </p>
        </div>
        <a
          href={TRUSTPILOT_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#00875A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#006B48] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Visit Trustpilot
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
