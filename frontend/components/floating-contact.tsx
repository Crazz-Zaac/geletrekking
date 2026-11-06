'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, CalendarDays, Clock, Mail, MessageCircle, X } from 'lucide-react'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { getContactLinks } from '@/lib/contact-links'
import { WhatsAppIcon } from '@/components/whatsapp-icon'

function nepalTime() {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kathmandu',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date())
  } catch {
    return ''
  }
}

type ActionProps = {
  href: string
  external?: boolean
  icon: React.ReactNode
  tileClass: string
  title: string
  subtitle: string
  onClick?: () => void
}

function ContactAction({ href, external, icon, tileClass, title, subtitle, onClick }: ActionProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group flex items-center gap-3.5 rounded-2xl border border-border/70 bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tileClass}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
      </span>
      <ArrowUpRight
        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none"
        aria-hidden="true"
      />
    </a>
  )
}

const HINT_SEEN_KEY = 'gele_contact_hint_seen'

export function FloatingContact() {
  const pathname = usePathname()
  const { settings, social } = useSiteSettings()
  const links = getContactLinks(settings.email, social.whatsapp, settings.phone)
  const [open, setOpen] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [time, setTime] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstActionRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const titleId = useId()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return
    setTime(nepalTime())
    const timer = window.setInterval(() => setTime(nepalTime()), 30000)
    // Move focus into the panel for keyboard and screen-reader users.
    const frame = window.requestAnimationFrame(() => {
      firstActionRef.current?.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true })
    })

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      window.clearInterval(timer)
      window.cancelAnimationFrame(frame)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [open])

  // Show the hint once per visitor, ~12 s in, and only when nothing else is
  // asking for attention (cookie banner unanswered, a dialog or panel open).
  useEffect(() => {
    if (pathname === '/admin' || pathname.startsWith('/admin/')) return
    let seen = true
    try {
      seen = localStorage.getItem(HINT_SEEN_KEY) === '1'
    } catch {}
    if (seen) return
    const showTimer = window.setTimeout(() => {
      let cookieChoiceMade = false
      try {
        cookieChoiceMade = localStorage.getItem('gele-cookie-consent') !== null
      } catch {}
      if (!cookieChoiceMade || document.querySelector('[role="dialog"]')) return
      setShowHint(true)
      try {
        localStorage.setItem(HINT_SEEN_KEY, '1')
      } catch {}
    }, 12000)
    return () => window.clearTimeout(showTimer)
  }, [pathname])

  // Hide the hint again after a while if it is ignored.
  useEffect(() => {
    if (!showHint) return
    const hideTimer = window.setTimeout(() => setShowHint(false), 15000)
    return () => window.clearTimeout(hideTimer)
  }, [showHint])

  const closePanel = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) return null

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
      className={`fixed left-4 md:left-6 ${open ? 'z-[80]' : 'z-[60]'}`}
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)' }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation()
          closePanel()
        }
      }}
    >
      <AnimatePresence>
        {open && (
          <>
            {/* Dim the page behind the bottom sheet on phones */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="panel"
              id={panelId}
              role="dialog"
              aria-modal="false"
              aria-labelledby={titleId}
              {...panelMotion}
              transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'bottom left' }}
              className={[
                'overflow-hidden bg-background text-foreground shadow-2xl',
                // Phone: bottom sheet
                'fixed inset-x-0 bottom-0 rounded-t-3xl pb-[env(safe-area-inset-bottom)]',
                // Tablet/desktop: floating card above the button
                'sm:absolute sm:inset-x-auto sm:bottom-full sm:left-0 sm:mb-4 sm:w-[22rem] sm:rounded-3xl sm:border sm:border-border sm:pb-0',
              ].join(' ')}
            >
              <div className="relative bg-gradient-to-br from-primary to-[oklch(0.45_0.11_195)] px-5 pb-5 pt-3 text-primary-foreground sm:pt-5">
                <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/40 sm:hidden" aria-hidden="true" />
                <button
                  type="button"
                  aria-label="Close contact options"
                  onClick={closePanel}
                  className="absolute right-3 top-3 rounded-full p-1.5 text-primary-foreground/80 transition-colors hover:bg-white/15 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
                <div className="flex items-center gap-3">
                  <span className="relative">
                    <img
                      src="/geletrekking.png"
                      alt=""
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full bg-white object-contain p-1 ring-2 ring-white/40"
                    />
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-primary bg-emerald-400" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p id={titleId} className="text-base font-semibold leading-tight">Talk to Gele Trekking</p>
                    <p className="mt-0.5 text-xs text-primary-foreground/80">Usually replies within a few hours</p>
                  </div>
                </div>
                {time && (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium">
                    <Clock className="h-3 w-3" aria-hidden="true" /> It&apos;s {time} in Nepal
                  </p>
                )}
              </div>

              <div ref={firstActionRef} className="space-y-2.5 p-4">
                <p className="px-1 text-xs font-medium text-muted-foreground">How would you like to reach us?</p>
                <ContactAction
                  href={links.whatsappUrl}
                  external
                  icon={<WhatsAppIcon className="h-6 w-6" />}
                  tileClass="bg-[#25D366]/15 text-[#128C4A]"
                  title="Chat on WhatsApp"
                  subtitle="Fastest way to get an answer"
                  onClick={() => setOpen(false)}
                />
                <ContactAction
                  href={links.emailUrl}
                  icon={<Mail className="h-5 w-5" aria-hidden="true" />}
                  tileClass="bg-accent/15 text-[oklch(0.55_0.16_55)]"
                  title="Email us"
                  subtitle={links.email}
                  onClick={() => setOpen(false)}
                />
                <ContactAction
                  href={links.callUrl}
                  external
                  icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
                  tileClass="bg-primary/10 text-primary"
                  title="Book a free 15-min call"
                  subtitle="Pick a time that suits you"
                  onClick={() => setOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* One-time hint so visitors know there are three ways to reach us */}
      <AnimatePresence>
        {showHint && !open && (
          <motion.div
            key="hint"
            role="status"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ transformOrigin: 'bottom left' }}
            className="absolute bottom-full left-0 mb-3 w-[min(17rem,calc(100vw-2rem))] rounded-2xl border border-border bg-background p-3.5 pr-9 text-sm text-foreground shadow-xl"
          >
            <button type="button" onClick={() => { setShowHint(false); setOpen(true) }} className="text-left">
              <span className="block font-semibold">Questions about a trek?</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">Chat on WhatsApp, email us, or book a free 15-minute call.</span>
            </button>
            <button type="button" onClick={() => setShowHint(false)} aria-label="Dismiss" className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45 border-b border-r border-border bg-background" aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? 'Close contact options' : 'Contact us: WhatsApp, email, or book a free call'}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setShowHint(false)
          setOpen((value) => !value)
        }}
        className={`group relative items-center rounded-full bg-gradient-to-br from-[#25D366] to-[#128C4A] text-white shadow-[0_10px_30px_-6px_rgba(18,140,74,0.6)] transition-transform hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 motion-reduce:transition-none motion-reduce:hover:scale-100 ${
          open ? 'hidden h-14 w-14 justify-center sm:flex' : 'flex h-14 w-14 justify-center md:w-auto md:justify-start md:gap-3 md:py-2 md:pl-2 md:pr-5'
        }`}
      >
        <span className={`relative flex h-14 w-14 shrink-0 items-center justify-center ${open ? '' : 'md:h-10 md:w-10 md:rounded-full md:bg-white/20'}`}>
          <AnimatePresence initial={false} mode="wait">
            {open ? (
              <motion.span
                key="close"
                initial={reduceMotion ? false : { rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={reduceMotion ? undefined : { rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={reduceMotion ? false : { rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={reduceMotion ? undefined : { rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <MessageCircle className="h-6 w-6 md:h-5 md:w-5" aria-hidden="true" />
              </motion.span>
            )}
          </AnimatePresence>
          {!open && <span className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-300 md:right-0 md:top-0 md:h-3 md:w-3" aria-hidden="true" />}
        </span>
        {/* Desktop: spell out the options */}
        {!open && (
          <span className="hidden text-left leading-tight md:block">
            <span className="block text-sm font-semibold">Questions? Let&apos;s talk</span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/90">
              <WhatsAppIcon className="h-3 w-3" /> WhatsApp
              <span aria-hidden="true">·</span>
              <Mail className="h-3 w-3" aria-hidden="true" /> Email
              <span aria-hidden="true">·</span>
              <CalendarDays className="h-3 w-3" aria-hidden="true" /> Free call
            </span>
          </span>
        )}
      </button>
    </div>
  )
}
