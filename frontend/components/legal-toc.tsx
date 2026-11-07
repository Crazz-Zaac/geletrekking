'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type TocItem = { id: string; title: string }

/** Highlights the section currently being read. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? '')
  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el))
    if (elements.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-110px 0px -60% 0px' }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])
  return active
}

export function LegalToc({ items }: { items: TocItem[] }) {
  const active = useActiveSection(items.map((item) => item.id))
  return (
    <nav aria-label="On this page">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">On this page</p>
      <ol className="space-y-0.5 border-l border-border">
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? 'location' : undefined}
              className={cn(
                '-ml-px flex gap-2.5 border-l-2 py-1.5 pl-3 pr-2 text-sm transition-colors',
                active === item.id
                  ? 'border-primary font-medium text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              <span className="w-5 shrink-0 tabular-nums text-xs leading-5 opacity-70">{String(index + 1).padStart(2, '0')}</span>
              <span>{item.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Collapsible contents list for phones. */
export function LegalTocMobile({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-border bg-card lg:hidden print:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-foreground"
      >
        Contents · {items.length} sections
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open ? (
        <ol className="border-t border-border px-2 py-2">
          {items.map((item, index) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="flex gap-2.5 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <span className="w-5 shrink-0 tabular-nums text-xs leading-5 opacity-70">{String(index + 1).padStart(2, '0')}</span>
                {item.title}
              </a>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}

export function PrintButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      Print or save as PDF
    </button>
  )
}
