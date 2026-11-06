import Link from 'next/link'
import { ArrowRight, ClipboardCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Promotes the free printable packing list (email sign-up). */
export function PackingListCta({ className }: { className?: string }) {
  return (
    <aside className={cn('flex flex-col items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:p-6', className)}>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <ClipboardCheck className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">Free printable packing list</p>
        <p className="mt-0.5 text-sm text-muted-foreground">Everything you need for a Himalayan trek, in one tick-off checklist.</p>
      </div>
      <Link href="/packing-list" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
        Get the checklist <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </aside>
  )
}
