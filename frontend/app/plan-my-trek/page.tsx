'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Mail, MapPinned, Plane, Send, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { TurnstileWidget } from '@/components/turnstile-widget'
import { submitContactMessage } from '@/lib/api'

type Region = 'everest' | 'annapurna' | 'langtang' | 'manaslu'
type Fitness = 'easy' | 'moderate' | 'strong'
type Transport = 'jeep' | 'flight'
type Comfort = 'standard' | 'gentle'

const regionOptions: Record<Region, { label: string; baseDays: number; note: string }> = {
  everest: {
    label: 'Everest region',
    baseDays: 14,
    note: 'Best for high-altitude scenery, Sherpa culture, and classic Himalayan viewpoints.',
  },
  annapurna: {
    label: 'Annapurna region',
    baseDays: 11,
    note: 'A flexible choice with villages, forests, viewpoints, and several route lengths.',
  },
  langtang: {
    label: 'Langtang region',
    baseDays: 9,
    note: 'A shorter, quieter mountain journey with strong cultural and landscape variety.',
  },
  manaslu: {
    label: 'Manaslu region',
    baseDays: 15,
    note: 'A remote circuit-style trek suited to travellers who want a wilder route.',
  },
}

const fitnessAdjustments: Record<Fitness, { label: string; days: number; note: string }> = {
  easy: {
    label: 'Easy pace',
    days: 2,
    note: 'Adds recovery time and shorter walking days.',
  },
  moderate: {
    label: 'Moderate fitness',
    days: 0,
    note: 'Balanced daily walking pace for most active travellers.',
  },
  strong: {
    label: 'Strong fitness',
    days: -1,
    note: 'Can handle longer walking days where the route allows it.',
  },
}

const transportAdjustments: Record<Transport, { label: string; days: number; note: string }> = {
  flight: {
    label: 'Flight where available',
    days: -1,
    note: 'Fastest access, but weather can affect mountain flights.',
  },
  jeep: {
    label: 'Jeep / road transfer',
    days: 1,
    note: 'More flexible and scenic, usually adds road travel time.',
  },
}

const comfortAdjustments: Record<Comfort, { label: string; days: number; note: string }> = {
  standard: {
    label: 'Standard itinerary',
    days: 0,
    note: 'Keeps the plan efficient while preserving acclimatization basics.',
  },
  gentle: {
    label: 'Gentler itinerary',
    days: 2,
    note: 'Adds buffer time for acclimatization, weather, and slower mornings.',
  },
}

const seasonLabels = {
  spring: 'Spring: March to May',
  autumn: 'Autumn: September to November',
  winter: 'Winter: December to February',
  monsoon: 'Monsoon/Summer: June to August',
}

export default function PlanMyTrekPage() {
  const [plan, setPlan] = useState({
    region: 'everest' as Region,
    fitness: 'moderate' as Fitness,
    transport: 'flight' as Transport,
    comfort: 'standard' as Comfort,
    season: 'autumn',
    groupSize: '2',
    interests: {
      culture: true,
      views: true,
      wildlife: false,
      comfort: false,
    },
  })
  const [contact, setContact] = useState({ name: '', email: '', phone: '', notes: '' })
  const [honeypot, setHoneypot] = useState('')
  const [formStartedAt, setFormStartedAt] = useState<number>(() => Date.now())
  const [captchaToken, setCaptchaToken] = useState('')
  const [turnstileRenderKey, setTurnstileRenderKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const rawTurnstileSiteKey = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '').trim()
  const hasPlaceholderTurnstileKey = /your_turnstile_site_key|your-site-key|changeme|placeholder/i.test(
    rawTurnstileSiteKey
  )
  const turnstileSiteKey = hasPlaceholderTurnstileKey ? '' : rawTurnstileSiteKey
  const requiresCaptcha = Boolean(turnstileSiteKey)
  const isContactReady = Boolean(contact.name.trim()) && Boolean(contact.email.trim())
  const isCaptchaReady = !requiresCaptcha || Boolean(captchaToken)
  const canSubmit = !submitting && isContactReady && isCaptchaReady

  const estimate = useMemo(() => {
    const base = regionOptions[plan.region].baseDays
    const total = Math.max(
      6,
      base + fitnessAdjustments[plan.fitness].days + transportAdjustments[plan.transport].days + comfortAdjustments[plan.comfort].days
    )
    const low = Math.max(5, total - 1)
    const high = total + 1
    const interests = Object.entries(plan.interests)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key)

    return {
      low,
      high,
      total,
      interests,
      summary: `${regionOptions[plan.region].label} trek, ${low}-${high} days, ${fitnessAdjustments[plan.fitness].label.toLowerCase()}, ${transportAdjustments[plan.transport].label.toLowerCase()}.`,
    }
  }, [plan])

  const planMessage = useMemo(() => {
    return [
      'Custom trek planning request',
      '',
      `Estimated duration: ${estimate.low}-${estimate.high} days`,
      `Region: ${regionOptions[plan.region].label}`,
      `Fitness / pace: ${fitnessAdjustments[plan.fitness].label}`,
      `Transport preference: ${transportAdjustments[plan.transport].label}`,
      `Itinerary style: ${comfortAdjustments[plan.comfort].label}`,
      `Preferred season: ${seasonLabels[plan.season as keyof typeof seasonLabels]}`,
      `Group size: ${plan.groupSize || 'Not specified'}`,
      `Interests: ${estimate.interests.length > 0 ? estimate.interests.join(', ') : 'Not specified'}`,
      '',
      'Planner notes:',
      regionOptions[plan.region].note,
      fitnessAdjustments[plan.fitness].note,
      transportAdjustments[plan.transport].note,
      comfortAdjustments[plan.comfort].note,
      '',
      contact.phone ? `Phone / WhatsApp: ${contact.phone}` : '',
      contact.notes ? `Traveller notes: ${contact.notes}` : '',
    ].filter((line, index, lines) => line !== '' || lines[index - 1] !== '')
      .join('\n')
  }, [contact.notes, contact.phone, estimate, plan])

  const setInterest = (key: keyof typeof plan.interests) => {
    setPlan((current) => ({
      ...current,
      interests: {
        ...current.interests,
        [key]: !current.interests[key],
      },
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!isContactReady) {
      setSubmitError('Please add your name and email so we can send the plan back to you.')
      return
    }

    if (requiresCaptcha && !captchaToken) {
      setSubmitError('Please complete captcha verification before emailing this plan.')
      return
    }

    setSubmitting(true)
    setSubmitError('')

    const result = await submitContactMessage({
      name: contact.name,
      email: contact.email,
      message: planMessage,
      website: honeypot,
      formStartedAt,
      captchaToken,
    })

    setSubmitting(false)

    if (!result.success) {
      setSubmitError(result.message)
      if (result.message.toLowerCase().includes('captcha')) {
        setCaptchaToken('')
        setTurnstileRenderKey((value) => value + 1)
      }
      return
    }

    setSubmitted(true)
    setCaptchaToken('')
    setFormStartedAt(Date.now())
    setTurnstileRenderKey((value) => value + 1)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <section className="border-b border-border bg-gradient-to-br from-primary/15 via-accent/10 to-background py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl">
              <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                Trek planner
              </p>
              <h1 className="mt-4 font-serif text-4xl font-bold text-foreground text-balance md:text-5xl">
                Plan the right trek before you book
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Compare pace, transport, season, and comfort preferences to get a realistic trip length, then send the plan to our team for a custom quote.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto grid gap-8 px-4 md:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-lg border border-border bg-card p-5 shadow-sm md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <MapPinned className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Route basics</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-foreground">
                    Trek region
                    <select
                      value={plan.region}
                      onChange={(event) => setPlan({ ...plan, region: event.target.value as Region })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {Object.entries(regionOptions).map(([value, option]) => (
                        <option key={value} value={value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-foreground">
                    Preferred season
                    <select
                      value={plan.season}
                      onChange={(event) => setPlan({ ...plan, season: event.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {Object.entries(seasonLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-foreground">
                    Fitness level
                    <select
                      value={plan.fitness}
                      onChange={(event) => setPlan({ ...plan, fitness: event.target.value as Fitness })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {Object.entries(fitnessAdjustments).map(([value, option]) => (
                        <option key={value} value={value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-foreground">
                    Group size
                    <input
                      value={plan.groupSize}
                      onChange={(event) => setPlan({ ...plan, groupSize: event.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="2"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-5 shadow-sm md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Travel style</h2>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(transportAdjustments).map(([value, option]) => {
                    const Icon = value === 'flight' ? Plane : Truck
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPlan({ ...plan, transport: value as Transport })}
                        className={`rounded-lg border p-4 text-left transition-colors ${
                          plan.transport === value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background hover:bg-muted/50'
                        }`}
                      >
                        <Icon className="mb-3 h-5 w-5" />
                        <span className="block text-sm font-semibold">{option.label}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{option.note}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {Object.entries(comfortAdjustments).map(([value, option]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPlan({ ...plan, comfort: value as Comfort })}
                      className={`rounded-lg border p-4 text-left transition-colors ${
                        plan.comfort === value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background hover:bg-muted/50'
                      }`}
                    >
                      <span className="block text-sm font-semibold">{option.label}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{option.note}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-5 shadow-sm md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Trip interests</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {([
                    ['culture', 'Local culture and villages'],
                    ['views', 'Big mountain viewpoints'],
                    ['wildlife', 'Nature and wildlife'],
                    ['comfort', 'Comfortable lodges where possible'],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-3 text-sm">
                      <input
                        type="checkbox"
                        checked={plan.interests[key]}
                        onChange={() => setInterest(key)}
                        className="h-4 w-4 accent-primary"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-5 shadow-sm md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Email this plan</h2>
                </div>
                {submitted ? (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="mb-2 h-5 w-5" />
                    Your trek plan has been sent. Our team will review it and reply with practical route options.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        value={contact.name}
                        onChange={(event) => setContact({ ...contact, name: event.target.value })}
                        className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Full name *"
                        required
                      />
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(event) => setContact({ ...contact, email: event.target.value })}
                        className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Email address *"
                        required
                      />
                    </div>
                    <input
                      value={contact.phone}
                      onChange={(event) => setContact({ ...contact, phone: event.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Phone / WhatsApp"
                    />
                    <textarea
                      value={contact.notes}
                      onChange={(event) => setContact({ ...contact, notes: event.target.value })}
                      className="min-h-28 w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Anything we should know about dates, budget, previous altitude experience, or travel constraints?"
                    />
                    <input
                      type="text"
                      name="website"
                      value={honeypot}
                      onChange={(event) => setHoneypot(event.target.value)}
                      autoComplete="off"
                      tabIndex={-1}
                      className="hidden"
                      aria-hidden="true"
                    />
                    {requiresCaptcha ? (
                      <div className="rounded-lg bg-muted/30 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          Security verification
                        </div>
                        <TurnstileWidget
                          key={turnstileRenderKey}
                          siteKey={turnstileSiteKey}
                          onVerify={(token) => {
                            setCaptchaToken(token)
                            setSubmitError('')
                          }}
                          onExpire={() => setCaptchaToken('')}
                          onError={() => {
                            setCaptchaToken('')
                            setSubmitError('Captcha failed to load. Verify Turnstile site key domain settings and disable ad blockers for this site.')
                          }}
                        />
                      </div>
                    ) : null}
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send className="h-4 w-4" />
                      {submitting ? 'Sending plan...' : 'Email This Plan'}
                    </button>
                  </div>
                )}
              </div>
            </form>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-lg border border-border bg-card p-5 shadow-sm md:p-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Estimated plan</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="font-serif text-5xl font-bold text-foreground">{estimate.low}-{estimate.high}</span>
                  <span className="pb-2 text-sm font-semibold text-muted-foreground">days</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{estimate.summary}</p>
                <div className="mt-6 space-y-3 text-sm">
                  {[
                    regionOptions[plan.region].note,
                    fitnessAdjustments[plan.fitness].note,
                    transportAdjustments[plan.transport].note,
                    comfortAdjustments[plan.comfort].note,
                  ].map((item) => (
                    <div key={item} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-lg bg-muted/40 p-4">
                  <p className="text-sm font-semibold text-foreground">Not a final quote yet</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    The final itinerary depends on exact route, permits, weather buffers, lodge availability, and your arrival/departure dates.
                  </p>
                </div>
                <Link
                  href="/book"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Ready to book instead
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
