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

export function FloatingContact() {
  const pathname = usePathname()
  const { settings, social } = useSiteSettings()
  const links = getContactLinks(settings.email, social.whatsapp, settings.phone)
  const [open, setOpen] = useState(false)
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

      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? 'Close contact options' : 'Contact us: WhatsApp, email, or book a call'}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={`group relative h-14 w-14 items-center justify-center rounded-full ${open ? 'hidden sm:flex' : 'flex'}  bg-gradient-to-br from-[#25D366] to-[#128C4A] text-white shadow-[0_10px_30px_-6px_rgba(18,140,74,0.6)] transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 motion-reduce:transition-none motion-reduce:hover:scale-100`}
      >
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
              <MessageCircle className="h-6 w-6" aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <>
            <span className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-300" aria-hidden="true" />
            <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:block">
              Need help planning?
            </span>
          </>
        )}
      </button>
    </div>
  )
}
