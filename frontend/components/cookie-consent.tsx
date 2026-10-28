'use client'

import { createContext, useContext, useEffect, useId, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { COOKIE_CONSENT_KEY, parseCookiePreference } from '@/lib/cookie-consent'

const CookieContext = createContext({ externalMedia: false, openPreferences: () => {} })
export const useCookieConsent = () => useContext(CookieContext)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [externalMedia, setExternalMedia] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [allowMedia, setAllowMedia] = useState(false)
  const headingId = useId()

  useEffect(() => {
    const restore = () => {
      let saved = null
      try { saved = parseCookiePreference(localStorage.getItem(COOKIE_CONSENT_KEY)) } catch { /* Browsing remains available if storage is blocked. */ }
      setExternalMedia(saved?.externalMedia ?? false)
      setAllowMedia(saved?.externalMedia ?? false)
      setShowBanner(!saved)
    }
    restore()
    const onStorage = (event: StorageEvent) => { if (event.key === COOKIE_CONSENT_KEY || event.key === null) restore() }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const save = (enabled: boolean) => {
    try { localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ version: 1, externalMedia: enabled, savedAt: Date.now() })) } catch { /* Apply the choice for this visit even when it cannot be saved. */ }
    setAllowMedia(enabled)
    setExternalMedia(enabled)
    setShowBanner(false)
    // A reload also stops any third-party code loaded before consent was withdrawn.
    if (externalMedia && !enabled) window.location.reload()
  }

  return (
    <CookieContext.Provider value={{ externalMedia, openPreferences: () => { setAllowMedia(externalMedia); setShowBanner(true) } }}>
      {children}
      {showBanner && (
        <section role="region" aria-labelledby={headingId} className="fixed inset-x-0 bottom-0 z-[100000] max-h-[85dvh] overflow-y-auto border-t border-border bg-background px-4 py-5 text-foreground shadow-2xl md:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
            <div className="flex-1 space-y-2">
              <h2 id={headingId} className="text-base font-semibold">Your cookie choices</h2>
              <p className="text-sm text-muted-foreground">
                Essential storage keeps forms, security, and your preferences working. Optional maps and videos connect to third-party providers and load only if you allow them. Google reviews load on every visit independently of this choice.{' '}
                <Link href="/privacy-policy#cookies" className="font-medium text-primary underline underline-offset-4">Privacy policy</Link>
              </p>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={allowMedia} onChange={(event) => setAllowMedia(event.target.checked)} className="h-4 w-4 accent-primary" />
                Allow optional external content
              </label>
            </div>
            <div className="flex flex-wrap gap-2 lg:max-w-sm">
              <button type="button" onClick={() => save(false)} className="min-h-11 flex-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted">Reject optional</button>
              <button type="button" onClick={() => save(true)} className="min-h-11 flex-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted">Accept optional</button>
              <button type="button" onClick={() => save(allowMedia)} className="min-h-11 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Save my choices</button>
            </div>
          </div>
        </section>
      )}
    </CookieContext.Provider>
  )
}

export function CookieSettingsButton({ className }: { className?: string }) {
  const { openPreferences } = useCookieConsent()
  return <button type="button" onClick={openPreferences} className={className}>Cookie settings</button>
}

export function ConsentGate({ children, label, externalUrl }: { children: ReactNode; label: string; externalUrl?: string }) {
  const { externalMedia, openPreferences } = useCookieConsent()
  if (externalMedia) return children
  return (
    <div className="rounded-xl border border-border bg-background p-5 text-sm text-foreground">
      <p className="font-semibold">{label}</p>
      <p className="mt-2 text-muted-foreground">This external content is off until you allow optional content in your cookie settings.</p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <button type="button" onClick={openPreferences} className="rounded-lg border border-border px-3 py-2 font-medium hover:bg-muted">Cookie settings</button>
        {externalUrl && <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">Open directly</a>}
      </div>
    </div>
  )
}
