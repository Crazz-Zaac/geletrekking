import Link from 'next/link'
import { ArrowRight, ClipboardCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Promotes the free printable packing list (email sign-up).
 * Lays out by its own width (container query), not the viewport, so it also
 * fits narrow sidebars: stacked below 28rem, one row above.
 */
export function PackingListCta({ className }: { className?: string }) {
  return (
    <div className={cn('@container', className)}>
      <aside className="flex flex-col items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 @md:flex-row @md:items-center @md:p-6">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ClipboardCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 @md:flex-1">
          <p className="font-semibold text-foreground">Free printable packing list</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Everything you need for a Himalayan trek, in one tick-off checklist.</p>
        </div>
        <Link href="/packing-list" className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 @md:w-auto">
          Get the checklist <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </aside>
    </div>
  )
}
