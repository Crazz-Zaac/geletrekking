'use client'

import { useId, useMemo, useRef, useState } from 'react'
import { marked } from 'marked'
import { Bold, Code, Heading2, Heading3, Image as ImageIcon, Italic, Link as LinkIcon, List, ListOrdered, Quote, Strikethrough, Youtube } from 'lucide-react'
import { sanitizeHtml } from '@/lib/sanitize-html'
import { cn } from '@/lib/utils'

type Tool = {
  label: string
  shortcut?: string
  icon: React.ComponentType<{ className?: string }>
  before: string
  after?: string
  placeholder: string
  block?: boolean
}

const TOOLS: Tool[] = [
  { label: 'Bold', shortcut: 'Ctrl+B', icon: Bold, before: '**', after: '**', placeholder: 'bold text' },
  { label: 'Italic', shortcut: 'Ctrl+I', icon: Italic, before: '*', after: '*', placeholder: 'italic text' },
  { label: 'Heading', icon: Heading2, before: '## ', placeholder: 'Heading', block: true },
  { label: 'Subheading', icon: Heading3, before: '### ', placeholder: 'Subheading', block: true },
  { label: 'Bulleted list', icon: List, before: '- ', placeholder: 'List item', block: true },
  { label: 'Numbered list', icon: ListOrdered, before: '1. ', placeholder: 'List item', block: true },
  { label: 'Quote', icon: Quote, before: '> ', placeholder: 'Quote', block: true },
  { label: 'Link', shortcut: 'Ctrl+K', icon: LinkIcon, before: '[', after: '](https://)', placeholder: 'link text' },
]

const EXTENDED_TOOLS: Tool[] = [
  { label: 'Strikethrough', icon: Strikethrough, before: '~~', after: '~~', placeholder: 'text' },
  { label: 'Code block', icon: Code, before: '```\n', after: '\n```', placeholder: 'code', block: true },
]

type MarkdownEditorProps = {
  value: string
  onChange: (value: string) => void
  id?: string
  rows?: number
  placeholder?: string
  /** Extra classes for the preview (e.g. to match the public page). */
  previewClassName?: string
  /** Adds strikethrough, code, image and YouTube tools (for long-form content). */
  extended?: boolean
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

/**
 * Markdown textarea with a formatting toolbar, keyboard shortcuts and a
 * Write / Preview toggle. Preview is sanitized the same way as the public site.
 */
export function MarkdownEditor({ value, onChange, id, rows = 8, placeholder, previewClassName, extended = false, ...aria }: MarkdownEditorProps) {
  const autoId = useId()
  const textareaId = id || autoId
  const ref = useRef<HTMLTextAreaElement>(null)
  const [mode, setMode] = useState<'write' | 'preview'>('write')
  const [panel, setPanel] = useState<'image' | 'video' | null>(null)
  const [media, setMedia] = useState({ url: '', alt: '', width: '', title: '' })
  const tools = extended ? [...TOOLS, ...EXTENDED_TOOLS] : TOOLS

  const words = useMemo(() => (value.trim() ? value.trim().split(/\s+/).length : 0), [value])
  const previewHtml = useMemo(
    () => (mode === 'preview' ? sanitizeHtml(marked.parse(value || '', { async: false }) as string) : ''),
    [mode, value]
  )

  const apply = (tool: Tool) => {
    const textarea = ref.current
    if (!textarea) return
    const start = textarea.selectionStart ?? value.length
    const end = textarea.selectionEnd ?? value.length
    const selected = value.slice(start, end) || tool.placeholder
    // Block tools start on their own line.
    const needsNewline = tool.block && start > 0 && value[start - 1] !== '\n'
    const prefix = `${needsNewline ? '\n' : ''}${tool.before}`
    const insertion = `${prefix}${selected}${tool.after || ''}`
    const next = value.slice(0, start) + insertion + value.slice(end)
    onChange(next)
    window.requestAnimationFrame(() => {
      textarea.focus()
      const selStart = start + prefix.length
      textarea.setSelectionRange(selStart, selStart + selected.length)
    })
  }

  const insertRaw = (text: string) => {
    const textarea = ref.current
    const start = textarea?.selectionStart ?? value.length
    const end = textarea?.selectionEnd ?? value.length
    const needsNewline = start > 0 && value[start - 1] !== '\n'
    const insertion = `${needsNewline ? '\n' : ''}${text}\n`
    onChange(value.slice(0, start) + insertion + value.slice(end))
    window.requestAnimationFrame(() => {
      textarea?.focus()
      const cursor = start + insertion.length
      textarea?.setSelectionRange(cursor, cursor)
    })
  }

  const insertMedia = () => {
    const url = media.url.trim()
    if (!/^https?:\/\//.test(url)) return
    if (panel === 'image') {
      const size = media.width.trim() ? `{width=${media.width.trim()}}` : ''
      insertRaw(`![${media.alt.trim() || 'Image'}](${url})${size}`)
    } else {
      insertRaw(`::youtube${media.title.trim() ? `[${media.title.trim()}]` : ''}(${url})`)
    }
    setMedia({ url: '', alt: '', width: '', title: '' })
    setPanel(null)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(event.ctrlKey || event.metaKey)) return
    const key = event.key.toLowerCase()
    const tool = key === 'b' ? TOOLS[0] : key === 'i' ? TOOLS[1] : key === 'k' ? TOOLS[7] : null
    if (tool) {
      event.preventDefault()
      event.stopPropagation()
      apply(tool)
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background shadow-xs focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/20">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-2 py-1.5">
        <div className="flex flex-wrap items-center gap-0.5" role="toolbar" aria-label="Formatting" aria-controls={textareaId}>
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.label}
                type="button"
                onClick={() => apply(tool)}
                disabled={mode === 'preview'}
                title={tool.shortcut ? `${tool.label} (${tool.shortcut})` : tool.label}
                aria-label={tool.label}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
          {extended && (
            <>
              <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
              {([['image', ImageIcon, 'Insert image'], ['video', Youtube, 'Embed YouTube video']] as const).map(([kind, Icon, label]) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setPanel(panel === kind ? null : kind)}
                  disabled={mode === 'preview'}
                  title={label}
                  aria-label={label}
                  aria-pressed={panel === kind}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40',
                    panel === kind ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:bg-background hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </>
          )}
        </div>
        <div className="flex rounded-md bg-background p-0.5 text-xs font-medium shadow-xs" role="tablist" aria-label="Editor mode">
          {(['write', 'preview'] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={mode === item}
              onClick={() => setMode(item)}
              className={cn(
                'rounded px-2.5 py-1 capitalize transition-colors',
                mode === item ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {panel && mode === 'write' && (
        <div className="flex flex-wrap items-end gap-2 border-b border-border bg-muted/20 p-3">
          <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs font-medium text-muted-foreground">
            {panel === 'image' ? 'Image URL' : 'YouTube URL'}
            <input
              type="url"
              autoFocus
              value={media.url}
              onChange={(event) => setMedia((prev) => ({ ...prev, url: event.target.value }))}
              onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); insertMedia() } }}
              placeholder="https://…"
              className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground"
            />
          </label>
          {panel === 'image' ? (
            <>
              <label className="flex min-w-36 flex-1 flex-col gap-1 text-xs font-medium text-muted-foreground">
                Alt text (describe the image)
                <input value={media.alt} onChange={(event) => setMedia((prev) => ({ ...prev, alt: event.target.value }))} className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground" />
              </label>
              <label className="flex w-24 flex-col gap-1 text-xs font-medium text-muted-foreground">
                Width (px)
                <input inputMode="numeric" value={media.width} onChange={(event) => setMedia((prev) => ({ ...prev, width: event.target.value.replace(/\D/g, '') }))} placeholder="auto" className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground" />
              </label>
            </>
          ) : (
            <label className="flex min-w-36 flex-1 flex-col gap-1 text-xs font-medium text-muted-foreground">
              Title (optional)
              <input value={media.title} onChange={(event) => setMedia((prev) => ({ ...prev, title: event.target.value }))} className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground" />
            </label>
          )}
          <div className="flex gap-1.5">
            <button type="button" onClick={() => setPanel(null)} className="h-9 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted">Cancel</button>
            <button type="button" onClick={insertMedia} disabled={!/^https?:\/\//.test(media.url.trim())} className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50">Insert</button>
          </div>
        </div>
      )}

      {mode === 'write' ? (
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          rows={rows}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          {...aria}
          // Border/ring come from the wrapper.
          style={{ border: 0, boxShadow: 'none', borderRadius: 0 }}
          className="field-sizing-content block max-h-[36rem] min-h-32 w-full resize-y bg-transparent px-3.5 py-3 font-mono text-[13px] leading-relaxed outline-none"
        />
      ) : (
        <div
          className={cn(
            'md-preview min-h-32 px-4 py-3',
            previewClassName
          )}
          // Sanitized with DOMPurify (lib/sanitize-html).
          dangerouslySetInnerHTML={{ __html: previewHtml || '<p class="text-muted-foreground">Nothing to preview yet.</p>' }}
        />
      )}

      <div className="flex items-center justify-between border-t border-border bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground">
        <span>Markdown supported</span>
        <span className="tabular-nums">{words} words</span>
      </div>
    </div>
  )
}
