import Link from 'next/link'
import { Wrench, RefreshCw, Clock3 } from 'lucide-react'

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
          <Wrench className="h-8 w-8 text-primary" />
        </div>

        <h1 className="text-3xl font-bold text-foreground md:text-4xl">We’re currently under maintenance</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          We are performing important upgrades to improve performance, reliability, and your overall experience.
          Please check back shortly.
        </p>

        <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4 text-left">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <RefreshCw className="h-4 w-4 text-primary" />
              Upgrade in progress
            </div>
            <p className="text-xs text-muted-foreground md:text-sm">
              We are applying updates and validating everything before going live again.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 text-left">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock3 className="h-4 w-4 text-primary" />
              Expected downtime
            </div>
            <p className="text-xs text-muted-foreground md:text-sm">
              Usually short. Thanks for your patience while we complete the improvements.
            </p>
          </div>
        </div>

        <p className="mt-8 text-xs text-muted-foreground md:text-sm">
          Need urgent support?{' '}
          <Link href="/contact" className="font-semibold text-primary hover:text-primary/80">
            Contact us
          </Link>
          .
        </p>
      </div>
    </main>
  )
}
