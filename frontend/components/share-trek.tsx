'use client'

import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Check, Link2, Mail, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { WhatsAppIcon } from '@/components/whatsapp-icon'
import { cn } from '@/lib/utils'

// Cards are links as a whole, so a click here must not open the trek as well.
const stayOnCard = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
}

/** Phones get their own share sheet; computers get WhatsApp, email and copy link. */
export function ShareTrek({ title, path, variant = 'card' }: { title: string; path: string; variant?: 'bar' | 'card' }) {
  const [nativeShare, setNativeShare] = useState(false)
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef<number | undefined>(undefined)
  const message = `Take a look at the ${title} with Gele Trekking`
  const url = () => `${window.location.origin}${path}`

  useEffect(() => {
    setNativeShare(typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches)
    return () => window.clearTimeout(copiedTimer.current)
  }, [])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url())
      setCopied(true)
      window.clearTimeout(copiedTimer.current)
      copiedTimer.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', url())
    }
  }

  const Icon = copied ? Check : Share2
  const label = copied ? 'Link copied' : `Share ${title}`
  const button = (onClick: (event: MouseEvent) => void) =>
    variant === 'bar' ? (
      <Button size="sm" variant="outline" aria-label={label} onClick={onClick} className="shrink-0 gap-1.5 border-primary text-primary hover:bg-primary/10 hover:text-primary">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {copied ? 'Copied' : 'Share'}
      </Button>
    ) : (
      <button
        type="button"
        aria-label={label}
        title={copied ? 'Link copied' : 'Share this trek'}
        onClick={onClick}
        className={cn('inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </button>
    )

  if (nativeShare) {
    return button((event) => {
      stayOnCard(event)
      // Closing the share sheet counts as a rejection, which needs no message.
      navigator.share({ title, text: message, url: url() }).catch(() => undefined)
    })
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>{button(stayOnCard)}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={stayOnCard}>
        <DropdownMenuItem onSelect={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${message}: ${url()}`)}`, '_blank', 'noopener,noreferrer')}>
          <WhatsAppIcon className="h-4 w-4" /> WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => { window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${message}: ${url()}`)}` }}>
          <Mail className="h-4 w-4" aria-hidden="true" /> Email
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void copyLink()}>
          <Link2 className="h-4 w-4" aria-hidden="true" /> Copy link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
