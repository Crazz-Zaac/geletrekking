'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import type { Trek } from '@/lib/data'
import { submitContactMessage } from '@/lib/api'
import { TurnstileWidget } from '@/components/turnstile-widget'

interface BookingFormProps {
  trek?: Trek
}

export function BookingForm({ trek }: BookingFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [honeypot, setHoneypot] = useState('')
  const [formStartedAt, setFormStartedAt] = useState<number>(() => Date.now())
  const [captchaToken, setCaptchaToken] = useState('')
  const [turnstileRenderKey, setTurnstileRenderKey] = useState(0)
  const rawTurnstileSiteKey = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '').trim()
  const hasPlaceholderTurnstileKey = /your_turnstile_site_key|your-site-key|changeme|placeholder/i.test(
    rawTurnstileSiteKey
  )
  const turnstileSiteKey = hasPlaceholderTurnstileKey ? '' : rawTurnstileSiteKey
  const requiresCaptcha = Boolean(turnstileSiteKey)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    trek: trek?.title ?? '',
    date: '',
    groupSize: '',
    message: '',
  })
  const isFormReady = Boolean(form.name.trim()) && Boolean(form.email.trim())
  const isCaptchaReady = !requiresCaptcha || Boolean(captchaToken)
  const canSubmit = !submitting && isFormReady && isCaptchaReady

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormReady) {
      setError('Please complete all required fields before submitting.')
      return
    }

    if (requiresCaptcha && !captchaToken) {
      setError('Please complete captcha verification before submitting.')
      return
    }

    setSubmitting(true)
    setError(null)

    const result = await submitContactMessage({
      name: form.name,
      email: form.email,
      message: [
        form.message,
        form.phone ? `Phone: ${form.phone}` : '',
        form.trek ? `Preferred Trek: ${form.trek}` : '',
        form.date ? `Preferred Date: ${form.date}` : '',
        form.groupSize ? `Group Size: ${form.groupSize}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      website: honeypot,
      formStartedAt,
      captchaToken,
    })

    setSubmitting(false)

    if (!result.success) {
      setError(result.message)
      if (result.message.toLowerCase().includes('captcha')) {
        setCaptchaToken('')
        setTurnstileRenderKey((value) => value + 1)
      }
      return
    }

    setSubmitted(true)
    setHoneypot('')
    setFormStartedAt(Date.now())
    setCaptchaToken('')
    setTurnstileRenderKey((value) => value + 1)
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-serif text-xl font-bold text-foreground mb-2">Inquiry Sent!</h3>
        <p className="text-muted-foreground text-sm">
          We&apos;ll get back to you within 24 hours to confirm your booking.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your full name"
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Email Address *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@email.com"
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Phone / WhatsApp</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+1 234 567 890"
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Preferred Trek</label>
          <input
            type="text"
            value={form.trek}
            onChange={(e) => setForm({ ...form, trek: e.target.value })}
            placeholder="Trek name"
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Preferred Start Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Group Size</label>
          <select
            value={form.groupSize}
            onChange={(e) => setForm({ ...form, groupSize: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          >
            <option value="">Select</option>
            <option>1 person</option>
            <option>2 people</option>
            <option>3–5 people</option>
            <option>6–10 people</option>
            <option>11+ people</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Message / Special Requirements</label>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tell us about your trekking experience, any dietary needs, or questions..."
          rows={4}
          className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
        />
      </div>
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        autoComplete="off"
        tabIndex={-1}
        className="hidden"
        aria-hidden="true"
      />
      {requiresCaptcha ? (
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">Security verification</p>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                isCaptchaReady
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
              }`}
            >
              {isCaptchaReady ? 'Verified' : 'Required'}
            </span>
          </div>
          <TurnstileWidget
            key={turnstileRenderKey}
            siteKey={turnstileSiteKey}
            onVerify={(token) => {
              setCaptchaToken(token)
              setError(null)
            }}
            onExpire={() => setCaptchaToken('')}
            onError={() => setCaptchaToken('')}
          />
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {isCaptchaReady
              ? 'Verification complete. You can send your inquiry now.'
              : 'Complete the captcha to enable the send button.'}
          </p>
        </div>
      ) : (
        <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
          {hasPlaceholderTurnstileKey
            ? 'Captcha key is a placeholder. Set a real `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to show verification.'
            : 'Captcha is not configured in this environment.'}
        </p>
      )}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors"
      >
        {submitting ? 'Sending...' : 'Send Inquiry'}
      </button>
      {!isFormReady ? <p className="text-xs text-muted-foreground">Fill required fields to enable submission.</p> : null}
      <p className="text-xs text-muted-foreground text-center">
        We typically reply within 24 hours. Or{' '}
        <a href="https://wa.me/9779851234567" target="_blank" rel="noopener noreferrer" className="text-primary underline">
          WhatsApp us directly
        </a>
        .
      </p>
    </form>
  )
}

interface FAQAccordionProps {
  faqs: { question: string; answer: string }[]
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-muted/50 transition-colors"
          >
            <span className="font-medium text-foreground text-sm pr-4">{faq.question}</span>
            {open === i ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border bg-muted/20">
              <p className="pt-3">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
