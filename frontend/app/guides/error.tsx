'use client'

import Link from 'next/link'

export default function GuideError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="max-w-lg space-y-4 text-center">
        <h1 className="font-serif text-3xl font-bold">Guide temporarily unavailable</h1>
        <p className="text-muted-foreground">We couldn’t load this guide right now. Please try again in a moment.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground">Try again</button>
          <Link href="/guides" className="rounded-lg border border-border px-4 py-3 font-semibold">Browse guides</Link>
        </div>
      </div>
    </main>
  )
}
