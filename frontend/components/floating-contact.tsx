'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CalendarDays, Mail, X } from 'lucide-react'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { getContactLinks } from '@/lib/contact-links'
import { WhatsAppIcon } from '@/components/whatsapp-icon'

export function FloatingContact() {
  const pathname = usePathname()
  const { settings, social } = useSiteSettings()
  const links = getContactLinks(settings.email, social.whatsapp, settings.phone)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  const closePanel = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) return null

  return (
    <div
      ref={containerRef}
      className="fixed left-4 z-[60] md:left-6"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)' }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation()
          closePanel()
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open contact options: WhatsApp, email, or book a call"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#128C4A] text-white shadow-xl hover:bg-[#0F753E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </button>

      <div
        id={panelId}
        role="region"
        aria-label="Contact Gele"
        hidden={!open}
        className="absolute bottom-full left-0 mb-3 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-background p-4 shadow-2xl"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">Talk to Gele</p>
            <p className="mt-1 text-xs text-muted-foreground">Let’s plan your Himalayan adventure.</p>
          </div>
          <button type="button" aria-label="Close contact options" onClick={closePanel} className="rounded-md p-1 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <a href={links.whatsappUrl} target="_blank" rel="noopener noreferrer" className="mb-2 flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <WhatsAppIcon className="h-5 w-5 shrink-0 text-[#128C4A]" />
          <span className="text-sm font-semibold">Chat on WhatsApp</span>
        </a>
        <a href={links.emailUrl} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <Mail className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0"><span className="block text-sm font-semibold">Email us</span><span className="block break-all text-xs text-muted-foreground">{links.email}</span></span>
        </a>
        <a href={links.callUrl} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <CalendarDays className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <span><span className="block text-sm font-semibold">Book a 15-minute call with Gele</span><span className="block text-xs text-muted-foreground">Choose a time on Cal.com</span></span>
        </a>
      </div>
    </div>
  )
}
