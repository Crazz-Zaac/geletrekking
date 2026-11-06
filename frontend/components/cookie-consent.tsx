'use client'

import { createContext, useCallback, useContext, useEffect, useId, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Cookie, ExternalLink, ShieldCheck } from 'lucide-react'
import {
  CONSENT_CATEGORIES,
  COOKIE_CONSENT_KEY,
  LEGACY_COOKIE_CONSENT_KEYS,
  createCookiePreference,
  parseCookiePreference,
  type OptionalConsentCategory,
} from '@/lib/cookie-consent'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

type Choices = Record<OptionalConsentCategory, boolean>
const NONE: Choices = { media: false }
const ALL: Choices = { media: true }

type ConsentContextValue = {
  /** null until the visitor has made a choice (or it expired). */
  choices: Choices | null
  allowed: (category: OptionalConsentCategory) => boolean
  /** Kept for existing callers: true when maps & videos are allowed. */
  externalMedia: boolean
  openPreferences: () => void
  /** Grant a single category (used by "Load content" buttons). */
  allow: (category: OptionalConsentCategory) => void
}

const CookieContext = createContext<ConsentContextValue>({
  choices: null,
  allowed: () => false,
  externalMedia: false,
  openPreferences: () => {},
  allow: () => {},
})
export const useCookieConsent = () => useContext(CookieContext)

const buttonBase =
  'inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
// Accept and Reject use the same style so neither choice is nudged.
const choiceButton = `${buttonBase} bg-primary text-primary-foreground hover:bg-primary/90`
const secondaryButton = `${buttonBase} border border-border bg-background text-foreground hover:bg-muted`

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [choices, setChoices] = useState<Choices | null>(null)
  const [ready, setReady] = useState(false)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [draft, setDraft] = useState<Choices>(NONE)
  const headingId = useId()
  // The admin has no optional third-party content, and the banner would cover its save bar.
  const pathname = usePathname() || ''
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/')

  useEffect(() => {
    const restore = () => {
      let saved = null
      try {
        saved = parseCookiePreference(localStorage.getItem(COOKIE_CONSENT_KEY))
      } catch {
        // Storage blocked: optional content stays off and the banner shows each visit.
      }
      setChoices(saved ? { media: saved.media } : null)
      setReady(true)
    }
    restore()
    const onStorage = (event: StorageEvent) => {
      if (event.key === COOKIE_CONSENT_KEY || event.key === null) restore()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const save = useCallback(
    (next: Choices) => {
      const withdrawn = !!choices && choices.media && !next.media
      try {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(createCookiePreference(next)))
        for (const key of LEGACY_COOKIE_CONSENT_KEYS) localStorage.removeItem(key)
      } catch {
        // Apply the choice for this visit even when it cannot be stored.
      }
      setChoices(next)
      setPreferencesOpen(false)
      // Reload so third-party code that was already running is fully removed.
      if (withdrawn) window.location.reload()
    },
    [choices]
  )

  const openPreferences = useCallback(() => {
    setDraft(choices ?? NONE)
    setPreferencesOpen(true)
  }, [choices])

  const allow = useCallback((category: OptionalConsentCategory) => save({ ...(choices ?? NONE), [category]: true }), [choices, save])

  const value: ConsentContextValue = {
    choices,
    allowed: (category) => !!choices?.[category],
    externalMedia: !!choices?.media,
    openPreferences,
    allow,
  }

  const showBanner = ready && choices === null && !preferencesOpen && !isAdmin

  return (
    <CookieContext.Provider value={value}>
      {children}

      {showBanner && (
        <section
          role="region"
          aria-labelledby={headingId}
          className="fixed inset-x-3 bottom-3 z-[100000] max-h-[85dvh] overflow-y-auto rounded-2xl border border-border bg-background p-5 text-foreground shadow-2xl sm:inset-x-auto sm:left-4 sm:max-w-md md:left-6"
          style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Cookie className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id={headingId} className="text-base font-semibold">We respect your privacy</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                We use essential cookies to run this site. With your permission we also load maps and videos from Google and YouTube,
                which may set their own cookies. We don&apos;t use advertising or tracking cookies.{' '}
                <Link href="/privacy-policy#cookies" className="font-medium text-primary underline underline-offset-4">
                  Privacy policy
                </Link>
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => save(NONE)} className={choiceButton}>
              Reject all
            </button>
            <button type="button" onClick={() => save(ALL)} className={choiceButton}>
              Accept all
            </button>
            <button type="button" onClick={openPreferences} className={cn(secondaryButton, 'col-span-2')}>
              Customize
            </button>
          </div>
        </section>
      )}

      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent className="z-[100001] max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cookie settings</DialogTitle>
            <DialogDescription>
              Choose which optional content we may load. You can change this at any time from “Cookie settings” at the bottom of every page.
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-3">
            {CONSENT_CATEGORIES.map((category) => {
              const switchId = `consent-${category.id}`
              const checked = category.required ? true : draft[category.id as OptionalConsentCategory]
              return (
                <li key={category.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <label htmlFor={switchId} className="min-w-0 cursor-pointer">
                      <span className="block text-sm font-semibold text-foreground">{category.label}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{category.description}</span>
                    </label>
                    {category.required ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Always on
                      </span>
                    ) : (
                      <Switch
                        id={switchId}
                        checked={checked}
                        onCheckedChange={(value) => setDraft((prev) => ({ ...prev, [category.id]: value }))}
                        className="mt-0.5 shrink-0"
                      />
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Providers:</span> {category.providers.join(', ')}
                  </p>
                </li>
              )
            })}
          </ul>

          <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3">
            <button type="button" onClick={() => save(NONE)} className={secondaryButton}>
              Reject all
            </button>
            <button type="button" onClick={() => save(draft)} className={secondaryButton}>
              Save choices
            </button>
            <button type="button" onClick={() => save(ALL)} className={secondaryButton}>
              Accept all
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </CookieContext.Provider>
  )
}

export function CookieSettingsButton({ className }: { className?: string }) {
  const { openPreferences } = useCookieConsent()
  return (
    <button type="button" onClick={openPreferences} className={className}>
      Cookie settings
    </button>
  )
}

/**
 * Renders third-party content only after consent for its category.
 * Until then it shows a placeholder with a one-click "Load" button that
 * grants just this category, plus a link to open the content directly.
 */
export function ConsentGate({
  children,
  label,
  externalUrl,
  externalLabel = 'Open directly',
  loadLabel,
  category = 'media',
  className,
}: {
  children: ReactNode
  label: string
  loadLabel?: string
  externalUrl?: string
  externalLabel?: string
  category?: OptionalConsentCategory
  className?: string
}) {
  const { allowed, allow, openPreferences } = useCookieConsent()
  if (allowed(category)) return children
  const info = CONSENT_CATEGORIES.find((item) => item.id === category)
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background px-5 py-8 text-center text-sm text-foreground', className)}>
      <p className="font-semibold">{label}</p>
      <p className="mt-1.5 max-w-md text-muted-foreground">
        This content is provided by {info?.providers.join(' and ') || 'a third party'}, who may set cookies. It loads only with your permission.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={() => allow(category)} className={cn(buttonBase, 'bg-primary text-primary-foreground hover:bg-primary/90')}>
          {loadLabel || `Load ${label}`}
        </button>
        {externalUrl && (
          <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4">
            {externalLabel} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
      </div>
      <button type="button" onClick={openPreferences} className="mt-3 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
        Cookie settings
      </button>
    </div>
  )
}
