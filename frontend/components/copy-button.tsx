'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Older browsers / non-secure contexts: fall back to a hidden textarea.
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      area.remove()
      return ok
    } catch {
      return false
    }
  }
}

/** Copies `value` (e.g. an email address) and confirms with a short "Copied". */
export function CopyButton({ value, label = 'Copy', className, iconOnly = false }: { value: string; label?: string; className?: string; iconOnly?: boolean }) {
  const [copied, setCopied] = useState(false)

  const onClick = async (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (await copyText(value)) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? `${value} copied` : `Copy ${value}`}
      title={copied ? 'Copied' : `Copy ${value}`}
      className={cn(
        'relative inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        copied && 'border-emerald-300 text-emerald-700',
        className
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
      {!iconOnly && <span aria-live="polite">{copied ? 'Copied' : label}</span>}
      {iconOnly && (
        <span aria-live="polite" className="sr-only">{copied ? 'Copied' : ''}</span>
      )}
      {/* Icon-only buttons have no room for text, so confirm with a small bubble. */}
      {iconOnly && copied && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-full top-1/2 z-10 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-lg"
        >
          Email copied
        </span>
      )}
    </button>
  )
}
