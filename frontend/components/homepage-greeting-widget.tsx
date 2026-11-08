'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Star, X } from 'lucide-react'
import { useScrolledPastHero } from '@/hooks/use-scrolled-past-hero'
import styles from './homepage-greeting-widget.module.css'

const GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJR_d6frYf6zkR0HAm4EnYRkI'
const TRUSTPILOT_REVIEW_URL = 'https://www.trustpilot.com/review/geletrekking.com'

function GoogleLogo() {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
      <path fill="#FBBC05" d="M10.4 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.9-4.7l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  )
}

function TrustpilotLogo() {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24">
      <path fill="#00b67a" d="M12 1.5l3 7.6h8l-6.5 4.8 2.5 7.8L12 17l-7 4.7 2.5-7.8L1 9.1h8z" />
    </svg>
  )
}

function ReviewLink({ href, logo, title, subtitle, onClick }: { href: string; logo: React.ReactNode; title: string; subtitle: string; onClick: () => void }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">{logo}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground">{subtitle}</span>
      </span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none" aria-hidden="true" />
    </a>
  )
}

export function HomepageGreetingWidget() {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const titleId = useId()
  const reduceMotion = useReducedMotion()
  const pastHero = useScrolledPastHero(true)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  const close = (returnFocus = true) => {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  const toggle = () => {
    setOpen((value) => {
      if (!value) {
        // Focus the first option when opened from the button.
        window.requestAnimationFrame(() => panelRef.current?.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true }))
      }
      return !value
    })
  }

  const panelMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 16, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 12, scale: 0.98 },
      }

  return (
    <div
      ref={containerRef}
      className={`${styles.widget} ${open ? 'open' : ''} ${pastHero || open ? '' : 'max-sm:invisible'}`}
      style={{ zIndex: open ? 80 : 60 }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation()
          close()
        }
      }}
    >
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => close(false)}
              aria-hidden="true"
            />
            <motion.div
              key="panel"
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-modal="false"
              aria-labelledby={titleId}
              {...panelMotion}
              transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'bottom right' }}
              className={[
                'overflow-hidden bg-background text-left text-foreground shadow-2xl',
                'fixed inset-x-0 bottom-0 rounded-t-3xl pb-[env(safe-area-inset-bottom)]',
                'sm:absolute sm:inset-x-auto sm:bottom-full sm:right-0 sm:mb-3 sm:w-[21rem] sm:rounded-3xl sm:border sm:border-border sm:pb-0',
              ].join(' ')}
            >
              <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-border sm:hidden" aria-hidden="true" />
              <button
                type="button"
                aria-label="Close"
                onClick={() => close()}
                className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="px-5 pb-1 pt-5 text-center sm:pt-6">
                <div className="flex justify-center gap-1" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <motion.span
                      key={index}
                      initial={reduceMotion ? false : { opacity: 0, y: 6, scale: 0.6 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: reduceMotion ? 0 : 0.08 + index * 0.06, type: 'spring', stiffness: 400, damping: 18 }}
                    >
                      <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                    </motion.span>
                  ))}
                </div>
                <p id={titleId} className="mt-3 text-lg font-semibold text-foreground">Trekked with us?</p>
                <p className="mx-auto mt-1 max-w-[16rem] text-sm text-muted-foreground">
                  A short review helps future trekkers choose with confidence. <span className="whitespace-nowrap">Dhanyabad! 🙏</span>
                </p>
              </div>

              <div className="space-y-2.5 p-4">
                <ReviewLink href={GOOGLE_REVIEW_URL} logo={<GoogleLogo />} title="Review on Google" subtitle="Takes about a minute" onClick={() => close(false)} />
                <ReviewLink href={TRUSTPILOT_REVIEW_URL} logo={<TrustpilotLogo />} title="Review on Trustpilot" subtitle="Share your trek story" onClick={() => close(false)} />
              </div>

              <div className="border-t border-border bg-muted/40 p-4">
                <p className="mb-2 text-center text-xs text-muted-foreground">Planning your next adventure?</p>
                <Link
                  href="/book"
                  onClick={() => close(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Book your next trek
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <button
        type="button"
        className="gt-char"
        aria-label={open ? 'Close review options' : 'Rate us or book a trek'}
        ref={triggerRef}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        <span className="gt-tag">🙏 Rate us!</span>
        <svg aria-hidden="true" viewBox="0 0 120 140" width="120" height="140">
          <ellipse cx="60" cy="136" rx="28" ry="4" fill="rgba(0,0,0,.2)"/>
          <path d="M44 100h32l-3 28H62l-2-14-2 14H47z" fill="#f1ead8"/>
          <path d="M48 112q4 3 8 0M64 112q4 3 8 0M48 118q4 3 8 0M64 118q4 3 8 0" stroke="#d8cfb4" strokeWidth="1.5" fill="none"/>
          <rect x="44" y="125" width="17" height="9" rx="4.5" fill="#3b2a1c"/><rect x="59" y="125" width="17" height="9" rx="4.5" fill="#3b2a1c"/>
          <g className="gt-bow">
            <path d="M38 70q0-10 12-10h20q12 0 12 10v34q0 6-6 6H44q-6 0-6-6z" fill="#f6f0df"/>
            <path d="M38 98h44" stroke="#e2d9bd" strokeWidth="2"/>
            <path d="M54 61L76 86" stroke="#cfc4a3" strokeWidth="2.5" fill="none"/>
            <circle cx="60" cy="68" r="1.6" fill="#b8ab85"/><circle cx="66" cy="75" r="1.6" fill="#b8ab85"/><circle cx="72" cy="82" r="1.6" fill="#b8ab85"/>
            <path d="M77 86l5 6M77 86l-2 8" stroke="#cfc4a3" strokeWidth="2" strokeLinecap="round"/>
            <path d="M38 72q0-10 11-11l2 0-6 46h-1q-6 0-6-6z" fill="#23232b"/>
            <path d="M82 72q0-10-11-11l-2 0 6 46h1q6 0 6-6z" fill="#23232b"/>
            <circle cx="60" cy="40" r="18" fill="#f2c29b"/>
            <circle cx="42" cy="42" r="3.5" fill="#f2c29b"/><circle cx="78" cy="42" r="3.5" fill="#f2c29b"/>
            <g className="gt-blink"><circle cx="53" cy="42" r="2.3" fill="#222"/><circle cx="67" cy="42" r="2.3" fill="#222"/></g>
            <path d="M52 49Q60 57 68 49" stroke="#a0522d" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
            <circle cx="47" cy="48" r="3" fill="#ff9e8a" opacity=".55"/><circle cx="73" cy="48" r="3" fill="#ff9e8a" opacity=".55"/>
            <circle cx="60" cy="35" r="1.8" fill="#d32f2f"/>
            <path d="M40 33L43 15Q52 10 63 8L77 10L80 33Q60 27 40 33Z" fill="#1a1a1f"/>
            <path d="M43 15Q52 10 63 8L77 10L76 14Q62 11 44 19Z" fill="#33333b"/>
            <path d="M41 28Q60 22 79 28M42 23Q60 17 78 23" stroke="#2c2c34" strokeWidth="1" fill="none"/>
            <path d="M58 11V19" stroke="#f5c518" strokeWidth="1"/>
            <path d="M58 11L63 14.5L60.5 15.5L63 18L58 18Z" fill="#d32f2f"/>
            <path d="M52 14Q58 23 68 21M69 14Q63 23 53 21" stroke="#f5c518" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
            <path d="M51 22Q61 28 71 22L71 24.5Q61 30.5 51 24.5Z" fill="#f5c518"/>
            <path d="M53 24.6Q61 28.4 69 24.6" stroke="#d32f2f" strokeWidth="1.6" fill="none"/>
            <path d="M43 70Q44 86 57 80" stroke="#f6f0df" strokeWidth="11" strokeLinecap="round" fill="none"/>
            <path d="M77 70Q76 86 63 80" stroke="#f6f0df" strokeWidth="11" strokeLinecap="round" fill="none"/>
            <path d="M43 70Q44 86 57 80M77 70Q76 86 63 80" stroke="#e2d9bd" strokeWidth="1" fill="none" opacity=".6"/>
            <path d="M60 68Q66 76 60 86Q54 76 60 68Z" fill="#f2c29b" stroke="#d9a074" strokeWidth="1"/>
            <path d="M60 69V85" stroke="#d9a074" strokeWidth="1"/>
          </g>
        </svg>
      </button>
    </div>
  )
}
