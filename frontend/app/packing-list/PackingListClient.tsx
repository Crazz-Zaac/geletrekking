'use client'

import Link from 'next/link'
import { useEffect, useId, useState } from 'react'
import { CheckCircle2, Loader2, Mail, Printer, RotateCcw } from 'lucide-react'
import { submitLead } from '@/lib/api'
import { cn } from '@/lib/utils'

export type PackingSection = { title: string; items: string[] }

const UNLOCK_KEY = 'gele_packing_list_unlocked'
const CHECKED_KEY = 'gele_packing_list_checked'

export function PackingListClient({ sections }: { sections: PackingSection[] }) {
  const [unlocked, setUnlocked] = useState(false)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [consent, setConsent] = useState(false)
  const [website, setWebsite] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const emailId = useId()
  const nameId = useId()
  const consentId = useId()

  useEffect(() => {
    try {
      setUnlocked(localStorage.getItem(UNLOCK_KEY) === '1')
      setChecked(JSON.parse(localStorage.getItem(CHECKED_KEY) || '{}'))
    } catch {
      // Storage unavailable: the form simply shows each visit.
    }
  }, [])

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      try {
        localStorage.setItem(CHECKED_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const reset = () => {
    setChecked({})
    try {
      localStorage.removeItem(CHECKED_KEY)
    } catch {}
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    setSubmitting(true)
    try {
      await submitLead({ email: email.trim(), name: name.trim() || undefined, marketingConsent: consent, website })
      try {
        localStorage.setItem(UNLOCK_KEY, '1')
      } catch {}
      setUnlocked(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const total = sections.reduce((sum, section) => sum + section.items.length, 0)
  const done = Object.values(checked).filter(Boolean).length

  return (
    <>
      <section className="border-b border-border bg-gradient-to-br from-primary/15 via-accent/10 to-background py-10 md:py-14 print:border-0 print:bg-none print:py-4">
        <div className="container mx-auto max-w-4xl px-4 md:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary print:hidden">Free download</p>
          <h1 className="mt-4 font-serif text-4xl font-bold text-foreground text-balance md:text-5xl print:mt-0 print:text-3xl">Nepal trekking packing list</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg print:hidden">
            {total} essentials for a teahouse trek in the Himalayas, grouped so you can tick them off as you pack. Print it or save it as a PDF.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-14 print:py-2">
        <div className="container mx-auto max-w-4xl px-4 md:px-6">
          {sections.length === 0 ? (
            <p className="text-muted-foreground">
              The packing list is being updated. Meanwhile, see our <Link href="/guides/gear-and-equipment" className="text-primary underline">gear & equipment guide</Link>.
            </p>
          ) : !unlocked ? (
            <div className="grid gap-8 md:grid-cols-[1fr_22rem]">
              <div>
                <h2 className="text-lg font-semibold text-foreground">What&apos;s inside</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {sections.map((section) => (
                    <li key={section.title} className="rounded-xl border border-border bg-card p-4">
                      <p className="font-medium text-foreground">{section.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{section.items.length} items, e.g. {section.items[0].toLowerCase()}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <form onSubmit={onSubmit} className="h-fit space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm" noValidate>
                <div>
                  <p className="text-lg font-semibold text-foreground">Get the checklist</p>
                  <p className="mt-1 text-sm text-muted-foreground">Enter your email to open the printable list. It appears straight away.</p>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor={emailId} className="text-sm font-medium text-foreground">Email</label>
                  <input id={emailId} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="you@example.com" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor={nameId} className="text-sm font-medium text-foreground">First name <span className="font-normal text-muted-foreground">(optional)</span></label>
                  <input id={nameId} autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" />
                </div>
                {/* Honeypot for bots; hidden from people and screen readers. */}
                <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                <label htmlFor={consentId} className="flex cursor-pointer items-start gap-2.5 text-sm text-muted-foreground">
                  <input id={consentId} type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
                  <span>Also send me occasional trek tips and offers. I can unsubscribe at any time.</span>
                </label>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                <button type="submit" disabled={submitting} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  Open the packing list
                </button>
                <p className="text-xs text-muted-foreground">
                  We use your email as described in our <Link href="/privacy-policy" className="underline">privacy policy</Link>. We never sell it.
                </p>
              </form>
            </div>
          ) : (
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  {done} of {total} packed
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
                    <RotateCcw className="h-4 w-4" /> Reset
                  </button>
                  <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                    <Printer className="h-4 w-4" /> Print / Save as PDF
                  </button>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2 print:grid-cols-2 print:gap-3">
                {sections.map((section) => (
                  <section key={section.title} className="break-inside-avoid rounded-2xl border border-border bg-card p-5 print:rounded-none print:border-0 print:p-0">
                    <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
                    <ul className="mt-3 space-y-1.5">
                      {section.items.map((item) => {
                        const key = `${section.title}::${item}`
                        const isChecked = !!checked[key]
                        return (
                          <li key={key}>
                            <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                              <input type="checkbox" checked={isChecked} onChange={() => toggle(key)} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
                              <span className={cn('text-foreground', isChecked && 'text-muted-foreground line-through print:no-underline')}>{item}</span>
                            </label>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                ))}
              </div>
              <p className="mt-8 text-sm text-muted-foreground print:mt-4 print:text-xs">
                Gear advice in detail: geletrekking.com/guides/gear-and-equipment · Questions? geletrekking.com/contact
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
