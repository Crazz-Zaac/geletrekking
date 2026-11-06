'use client'

/**
 * Admin form kit: consistent, accessible building blocks for every admin form.
 *
 *   <AdminPageHeader title="Site settings" description="…" />
 *   <FormSection title="Branding" description="…">
 *     <FieldGrid>
 *       <Field label="Site name" required hint="Shown in the browser tab">
 *         <Input value=… onChange=… />
 *       </Field>
 *     </FieldGrid>
 *   </FormSection>
 *   <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={reset} />
 *   <StatusToasts error={error} message={message} />
 */

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import { AlertCircle, ArrowDown, ArrowUp, CheckCircle2, ExternalLink, ImageOff, Loader2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* Page header                                                         */
/* ------------------------------------------------------------------ */

export function AdminPageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sections & layout                                                   */
/* ------------------------------------------------------------------ */

/**
 * A titled group of fields. On wide screens the title/description sit in a
 * left column and the fields in a card on the right (settings-page layout).
 * Use `stacked` for full-width content such as editors and tables.
 */
export function FormSection({
  id,
  title,
  description,
  actions,
  stacked = false,
  children,
  className,
}: {
  id?: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  stacked?: boolean
  children: ReactNode
  className?: string
}) {
  const heading = (
    <div className={cn('min-w-0', stacked && 'flex flex-wrap items-start justify-between gap-3')}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {stacked && actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )

  if (stacked) {
    return (
      <section id={id} className={cn('scroll-mt-24 rounded-xl border border-border bg-card shadow-sm transition-shadow', className)}>
        <div className="border-b border-border px-5 py-4 md:px-6">{heading}</div>
        <div className="space-y-5 p-5 md:p-6">{children}</div>
      </section>
    )
  }

  return (
    <section id={id} className={cn('grid scroll-mt-24 gap-4 rounded-xl transition-shadow lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-8', className)}>
      <div className="lg:pt-1">
        {heading}
        {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
      </div>
      <div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">{children}</div>
    </section>
  )
}

export function FieldGrid({ cols = 2, children, className }: { cols?: 1 | 2 | 3 | 4; children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-x-4 gap-y-5',
        cols === 2 && 'sm:grid-cols-2',
        cols === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
        cols === 4 && 'sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {children}
    </div>
  )
}

/** A sub-panel inside a section, e.g. one item of a repeatable list. */
export function FieldPanel({ title, actions, children, className }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-4 rounded-lg border border-border bg-muted/30 p-4', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3">
          {title && <p className="text-sm font-medium text-foreground">{title}</p>}
          {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Field                                                               */
/* ------------------------------------------------------------------ */

type FieldProps = {
  label: ReactNode
  hint?: ReactNode
  error?: string | null
  required?: boolean
  /** Shows "12 / 160" under the field; colours amber near and red over the limit. */
  count?: { value: string | undefined | null; max: number; recommended?: boolean }
  className?: string
  children: ReactNode
}

/**
 * Label + control + hint/error. The single child control automatically gets
 * an id, aria-describedby and aria-invalid, so the label is clickable and
 * screen readers announce the hint and error.
 */
export function Field({ label, hint, error, required, count, className, children }: FieldProps) {
  const autoId = useId()
  const child = Children.only(children)
  const element = isValidElement(child) ? (child as ReactElement<Record<string, unknown>>) : null
  const controlId = (element?.props.id as string | undefined) || autoId
  const hintId = `${controlId}-hint`
  const errorId = `${controlId}-error`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined

  const control = element
    ? cloneElement(element, {
        id: controlId,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : element.props['aria-invalid'],
        'aria-required': required || undefined,
      })
    : child

  const length = count ? (count.value || '').length : 0
  const over = count ? length > count.max : false
  const near = count ? !over && length > count.max * 0.9 : false

  return (
    <div className={cn('min-w-0 space-y-1.5', className)}>
      <label htmlFor={controlId} className="flex items-baseline gap-1 text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {control}
      {(hint || error || count) && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            {error && (
              <p id={errorId} className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}
            {hint && (
              <p id={hintId} className="text-xs leading-relaxed text-muted-foreground">
                {hint}
              </p>
            )}
          </div>
          {count && (
            <span
              className={cn(
                'shrink-0 text-xs tabular-nums',
                over ? 'font-medium text-destructive' : near ? 'text-amber-600' : 'text-muted-foreground'
              )}
              aria-live="polite"
            >
              {length} / {count.max}
              {count.recommended ? ' recommended' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Controls                                                            */
/* ------------------------------------------------------------------ */

const controlBase =
  'w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow,border-color] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive'

/** Native <select> with the admin look (keeps native mobile pickers). */
export function SelectInput({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <select className={cn(controlBase, 'h-10 cursor-pointer', className)} {...props}>
      {children}
    </select>
  )
}

/** Textarea that grows with its content (field-sizing) up to a max height. */
export function TextArea({ className, rows = 4, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      rows={rows}
      className={cn(controlBase, 'field-sizing-content min-h-24 max-h-[32rem] py-2.5 leading-relaxed', className)}
      {...props}
    />
  )
}

/** A labelled on/off switch row: replaces bare checkboxes. */
export function ToggleField({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
}: {
  label: ReactNode
  description?: ReactNode
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}) {
  const id = useId()
  return (
    <div className={cn('flex items-start justify-between gap-4 rounded-lg border border-border bg-background p-3.5', className)}>
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description && <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{description}</span>}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} className="mt-0.5 shrink-0" />
    </div>
  )
}

/** URL field for an image with a live preview, "open" and "clear" actions. */
export function ImageUrlField({
  label,
  value,
  onChange,
  hint,
  required,
  placeholder = 'https://…',
  aspect = 'wide',
  error,
}: {
  label: ReactNode
  value: string | undefined | null
  onChange: (value: string) => void
  hint?: ReactNode
  required?: boolean
  placeholder?: string
  aspect?: 'wide' | 'square' | 'logo'
  error?: string | null
}) {
  const [broken, setBroken] = useState(false)
  const url = (value || '').trim()
  useEffect(() => setBroken(false), [url])

  return (
    <div className="space-y-3">
      <Field label={label} hint={hint} required={required} error={error}>
        <div className="flex gap-2">
          <input
            type="url"
            inputMode="url"
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className={cn(controlBase, 'h-10')}
          />
          {url && (
            <>
              <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Open image in new tab">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => onChange('')} aria-label="Clear image URL">
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </Field>
      {url && (
        <div
          className={cn(
            'relative overflow-hidden rounded-lg border border-border bg-muted/40',
            aspect === 'wide' && 'aspect-[16/7] w-full',
            aspect === 'square' && 'aspect-square w-40',
            aspect === 'logo' && 'flex h-20 w-20 items-center justify-center p-2'
          )}
        >
          {broken ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
              <ImageOff className="h-5 w-5" aria-hidden="true" />
              Image could not be loaded
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              onError={() => setBroken(true)}
              className={cn('h-full w-full', aspect === 'logo' ? 'object-contain' : 'object-cover')}
            />
          )}
        </div>
      )}
    </div>
  )
}

/** Editable list of short text items (includes, excludes, highlights…). Paste several lines to add them all. */
export function ListEditor({
  items,
  onChange,
  placeholder = 'Add an item…',
  addLabel = 'Add',
  emptyText = 'Nothing added yet.',
}: {
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  addLabel?: string
  emptyText?: string
}) {
  const [draft, setDraft] = useState('')
  const add = (raw = draft) => {
    const next = raw.split(/\r?\n/).map((item) => item.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
    if (next.length === 0) return
    onChange([...items, ...next])
    setDraft('')
  }
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }
  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {items.map((item, index) => (
            <li key={`${index}-${item}`} className="group flex items-center gap-2 bg-background py-1 pl-3 pr-1">
              <input
                value={item}
                onChange={(event) => onChange(items.map((value, i) => (i === index ? event.target.value : value)))}
                aria-label={`Item ${index + 1}`}
                style={{ border: 0, boxShadow: 'none' }}
                className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
              <div className="flex shrink-0 opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label="Remove"><X className="h-3.5 w-3.5" /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              add()
            }
          }}
          onPaste={(event) => {
            const text = event.clipboardData.getData('text')
            if (/\n/.test(text)) {
              event.preventDefault()
              add(text)
            }
          }}
          placeholder={placeholder}
          className={cn(controlBase, 'h-10')}
        />
        <Button type="button" variant="outline" className="h-10 shrink-0 gap-1.5" onClick={() => add()} disabled={!draft.trim()}>
          <Plus className="h-4 w-4" /> {addLabel}
        </Button>
      </div>
    </div>
  )
}

/** Grid of image URLs with thumbnails, add-by-URL and remove. */
export function ImageListField({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const url = draft.trim()
    if (!/^https?:\/\//.test(url)) return
    onChange([...images, url])
    setDraft('')
  }
  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((url, index) => (
            <li key={`${index}-${url}`} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
              <button
                type="button"
                onClick={() => onChange(images.filter((_, i) => i !== index))}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-100 transition-opacity hover:bg-black/80 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          type="url"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              add()
            }
          }}
          placeholder="Paste an image URL and press Enter"
          className={cn(controlBase, 'h-10')}
        />
        <Button type="button" variant="outline" className="h-10 shrink-0 gap-1.5" onClick={add} disabled={!/^https?:\/\//.test(draft.trim())}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
    </div>
  )
}

/** In-page section navigation for long editors ("On this page"). */
export function SectionNav({ sections }: { sections: Array<{ id: string; label: string; invalid?: boolean }> }) {
  return (
    <nav aria-label="On this page" className="hidden xl:block">
      <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">On this page</p>
      <ul className="space-y-0.5">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={(event) => {
                event.preventDefault()
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {section.label}
              {section.invalid && <span className="h-2 w-2 rounded-full bg-destructive" aria-label="has errors" />}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/* Save bar, dirty tracking, notifications                             */
/* ------------------------------------------------------------------ */

/**
 * Sticky bar at the bottom of the viewport with the primary action.
 * Always visible on long forms; highlights when there are unsaved changes.
 */
export function SaveBar({
  dirty = true,
  saving,
  onSave,
  onDiscard,
  saveLabel = 'Save changes',
  discardLabel = 'Discard',
  status,
  disabled,
}: {
  dirty?: boolean
  saving?: boolean
  onSave: () => void
  onDiscard?: () => void
  saveLabel?: string
  discardLabel?: string
  status?: ReactNode
  disabled?: boolean
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 md:-mx-6 lg:-mx-8" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 backdrop-blur md:px-6 lg:px-8',
          dirty ? 'border-primary/30 bg-background/95' : 'border-border bg-background/90'
        )}
      >
        <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          {status ??
            (saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving…
              </>
            ) : dirty ? (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" /> Unsaved changes
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" /> All changes saved
              </>
            ))}
        </p>
        <div className="flex gap-2">
          {onDiscard && (
            <Button type="button" variant="ghost" onClick={onDiscard} disabled={saving}>
              {discardLabel}
            </Button>
          )}
          <Button type="button" onClick={onSave} disabled={saving || disabled || !dirty} className="min-w-28">
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Tracks whether `value` differs from the last saved snapshot.
 * Call `markSaved()` after loading or saving; `baseline` restores it.
 */
export function useDirtyState<T>(value: T) {
  const serialized = useMemo(() => JSON.stringify(value), [value])
  const [saved, setSaved] = useState<string | null>(null)
  const savedValue = useRef<T | null>(null)

  return {
    dirty: saved !== null && saved !== serialized,
    markSaved: (next?: T) => {
      const snapshot = next === undefined ? value : next
      savedValue.current = snapshot
      setSaved(JSON.stringify(snapshot))
    },
    baseline: () => savedValue.current,
  }
}

/** Warn before closing/reloading the tab with unsaved changes. */
export function useUnsavedChangesWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])
}

/**
 * Turns a page's existing error/success strings into toasts, so pages keep
 * their state logic and just render <StatusToasts error={error} message={message} />.
 */
export function StatusToasts({ error, message }: { error?: string | null; message?: string | null }) {
  useEffect(() => {
    if (error) toast.error(error, { duration: 8000 })
  }, [error])
  useEffect(() => {
    if (message) toast.success(message)
  }, [message])
  return null
}

/** Empty state for lists. */
export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
      {icon && <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">{icon}</div>}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/** Section loading placeholder. */
export function FormSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid gap-4 lg:grid-cols-[17rem_1fr] lg:gap-8">
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-48 animate-pulse rounded bg-muted" />
          </div>
          <div className="space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
