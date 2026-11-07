'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { BookOpen, CalendarDays, Check, Link2, Mail, Search, ShieldCheck, Backpack, FileText, X } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { WhatsAppIcon } from '@/components/whatsapp-icon'
import { CONTACT_EMAIL, GELE_CALL_URL, WHATSAPP_URL } from '@/lib/contact-links'
import { FAQ_TOPICS, type FaqTopicId } from '@/lib/faq-topics'
import { cn } from '@/lib/utils'

export type FaqEntry = {
  question: string
  answer: string
  topic: FaqTopicId
  anchor: string
}

/* ---------- light markdown: **bold**, *italic*, [links](url), "- " lists ---------- */

const isSafeHref = (href: string) =>
  href.startsWith('/') || href.startsWith('#') || /^https?:\/\//i.test(href) || /^mailto:/i.test(href) || /^tel:/i.test(href)

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index))
    if (match[2] && match[3]) {
      const href = match[3].trim()
      if (!isSafeHref(href)) nodes.push(match[2])
      else if (href.startsWith('/') || href.startsWith('#'))
        nodes.push(<Link key={match.index} href={href} className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80">{renderInline(match[2])}</Link>)
      else
        nodes.push(<a key={match.index} href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80">{renderInline(match[2])}</a>)
    } else if (match[4]) {
      nodes.push(<strong key={match.index} className="font-semibold text-foreground">{renderInline(match[4])}</strong>)
    } else if (match[5]) {
      nodes.push(<em key={match.index}>{renderInline(match[5])}</em>)
    }
    lastIndex = pattern.lastIndex
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

function Answer({ value }: { value: string }) {
  const lines = value.split(/\n+/).map((line) => line.trim()).filter(Boolean)
  const blocks: ReactNode[] = []
  let list: string[] = []
  const flush = () => {
    if (list.length === 0) return
    blocks.push(
      <ul key={`list-${blocks.length}`} className="list-disc space-y-1.5 pl-5 marker:text-primary">
        {list.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
      </ul>
    )
    list = []
  }
  lines.forEach((line, index) => {
    if (/^[-*]\s+/.test(line)) {
      list.push(line.replace(/^[-*]\s+/, ''))
      return
    }
    flush()
    if (line.startsWith('## ')) blocks.push(<h3 key={index} className="font-bold text-foreground">{renderInline(line.slice(3))}</h3>)
    else if (line.startsWith('> ')) blocks.push(<blockquote key={index} className="border-l-2 border-primary pl-3 italic">{renderInline(line.slice(2))}</blockquote>)
    else blocks.push(<p key={index}>{renderInline(line.replace(/^\d+\.\s+/, ''))}</p>)
  })
  flush()
  return <div className="space-y-3">{blocks}</div>
}

/* ---------- page body ---------- */

function CopyLink({ anchor }: { anchor: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        const url = `${window.location.origin}/faq#${anchor}`
        try {
          await navigator.clipboard.writeText(url)
          setCopied(true)
          window.setTimeout(() => setCopied(false), 2000)
        } catch {
          window.location.hash = anchor
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Link2 className="h-3.5 w-3.5" />}
      {copied ? 'Link copied' : 'Copy link to this answer'}
      <span className="sr-only" aria-live="polite">{copied ? 'Copied' : ''}</span>
    </button>
  )
}

function FaqList({
  items,
  open,
  onOpenChange,
  showTopic = false,
}: {
  items: FaqEntry[]
  open: string[]
  onOpenChange: (value: string[]) => void
  showTopic?: boolean
}) {
  return (
    <Accordion type="multiple" value={open} onValueChange={onOpenChange} className="w-full">
      {items.map((item) => (
        <AccordionItem key={item.anchor} value={item.anchor} id={item.anchor} className="scroll-mt-36 border-border">
          <AccordionTrigger className="py-4 text-left text-base font-semibold leading-snug text-foreground hover:text-primary hover:no-underline md:text-[17px]">
            <span>
              {showTopic ? (
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-primary">
                  {FAQ_TOPICS.find((topic) => topic.id === item.topic)?.label}
                </span>
              ) : null}
              {item.question}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">
            <Answer value={item.answer} />
            <div className="mt-4">
              <CopyLink anchor={item.anchor} />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export function FaqBrowser({ items }: { items: FaqEntry[] }) {
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState<'all' | FaqTopicId>('all')
  const [open, setOpen] = useState<string[]>([])

  const topics = useMemo(
    () =>
      FAQ_TOPICS.map((entry) => ({ ...entry, count: items.filter((item) => item.topic === entry.id).length })).filter(
        (entry) => entry.count > 0
      ),
    [items]
  )

  // Open and scroll to the question named in the URL hash (/faq#travel-insurance).
  const openFromHash = useCallback(() => {
    const anchor = decodeURIComponent(window.location.hash.slice(1))
    if (!anchor || !items.some((item) => item.anchor === anchor)) return
    setQuery('')
    setTopic('all')
    setOpen((current) => (current.includes(anchor) ? current : [...current, anchor]))
    window.setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }, [items])

  useEffect(() => {
    openFromHash()
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [openFromHash])

  const q = query.trim().toLowerCase()
  const results = useMemo(() => {
    if (!q) return []
    const words = q.split(/\s+/)
    return items.filter((item) => {
      const haystack = `${item.question} ${item.answer}`.toLowerCase()
      return words.every((word) => haystack.includes(word))
    })
  }, [items, q])

  const visibleTopics = topic === 'all' ? topics : topics.filter((entry) => entry.id === topic)

  return (
    <>
      <div className="sticky top-16 z-20 -mx-4 mb-6 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search questions, e.g. permits, altitude, payment"
            aria-label="Search frequently asked questions"
            className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-10 text-[15px] shadow-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {!q ? (
          <div
            role="toolbar"
            aria-label="FAQ topics"
            className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {[{ id: 'all' as const, label: 'All questions', count: items.length }, ...topics].map((entry) => (
              <button
                key={entry.id}
                type="button"
                aria-pressed={topic === entry.id}
                onClick={() => setTopic(entry.id)}
                className={cn(
                  'inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors',
                  topic === entry.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5'
                )}
              >
                {entry.label}
                <span className="text-xs opacity-70">{entry.count}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {q ? (
        <section aria-live="polite">
          <p className="mb-2 text-sm text-muted-foreground">
            {results.length === 0
              ? `No answers found for “${query.trim()}”.`
              : `${results.length} answer${results.length === 1 ? '' : 's'} for “${query.trim()}”`}
          </p>
          {results.length > 0 ? (
            <div className="rounded-2xl border border-border bg-card px-5 md:px-6">
              <FaqList items={results} open={open} onOpenChange={setOpen} showTopic />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Try a different word, or ask us directly. We usually reply within a day.
            </div>
          )}
        </section>
      ) : (
        <div className="space-y-8">
          {visibleTopics.map((entry) => (
            <section key={entry.id} aria-labelledby={`topic-${entry.id}`}>
              <h2 id={`topic-${entry.id}`} className="mb-2 text-lg font-bold text-foreground md:text-xl">
                {entry.label}
              </h2>
              <div className="rounded-2xl border border-border bg-card px-5 md:px-6">
                <FaqList items={items.filter((item) => item.topic === entry.id)} open={open} onOpenChange={setOpen} />
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  )
}

export function FaqSidebar() {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl bg-slate-950 p-6 text-white">
        <h2 className="text-lg font-bold">Still have a question?</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/75">
          Ask Gele directly. Tell us your trek, dates and group size and you’ll get a practical, honest answer.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <a
            href={GELE_CALL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
          >
            <CalendarDays className="h-4 w-4" />
            Book a free 15-min call
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white hover:bg-[#1ebe5a]"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp us
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/25 px-4 text-sm font-semibold hover:bg-white/10"
          >
            <Mail className="h-4 w-4" />
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>

      <nav aria-label="Helpful pages" className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Helpful reading</h2>
        <ul className="space-y-1">
          {[
            { href: '/guides', label: 'Trek planning guides', icon: BookOpen },
            { href: '/packing-list', label: 'Packing list', icon: Backpack },
            { href: '/safety', label: 'Safety on the trail', icon: ShieldCheck },
            { href: '/terms', label: 'Booking terms & conditions', icon: FileText },
          ].map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-foreground hover:bg-muted">
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
