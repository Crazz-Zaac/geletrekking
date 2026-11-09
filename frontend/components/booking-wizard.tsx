'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleAlert, Download, Info, Loader2, Send } from 'lucide-react'
import type { BookingFormConfig, BookingFormFieldConfig, BookingFormState } from '@/lib/booking-form-config'
import {
  autocompleteFor,
  clearBookingDraft,
  getDateLimits,
  getFieldNotice,
  getFieldProblem,
  isFieldRequired,
  isNameField,
  readBookingDraft,
  saveBookingDraft,
} from '@/lib/booking-form-validation'
import { TurnstileWidget } from '@/components/turnstile-widget'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export type BookingSubmitResult = { ok: true } | { ok: false; message: string }

type BookingWizardProps = {
  sections: BookingFormConfig
  form: BookingFormState
  onFieldChange: (id: string, value: string | boolean) => void
  isFieldVisible: (field: BookingFormFieldConfig) => boolean
  /** The field that picks a trek, with the choices for it. */
  trekField: { id: string; placeholder: string; options: string[] }
  /** Identifies this form's saved answers in the guest's browser tab. */
  draftKey: string
  onRestoreDraft: (draft: BookingFormState) => void
  submitLabel: string
  onSubmit: (details: { captchaToken: string; honeypot: string }) => Promise<BookingSubmitResult>
  onDownloadCopy?: () => Promise<void>
}

const fieldInput =
  'w-full rounded-md border border-input bg-background text-base text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm'
const invalidInput = 'border-red-500 focus:ring-red-200'
const buttonBase = 'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'

const HEADER_CLEARANCE = 80

const usesChoiceButtons = (field: BookingFormFieldConfig) => {
  const options = field.options || []
  return Boolean(field.required) && options.length > 0 && options.length <= 3 && options.every((option) => option.length <= 24)
}

const turnstileKey = () => {
  const key = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '').trim()
  return /your_turnstile_site_key|your-site-key|changeme|placeholder/i.test(key) ? '' : key
}

/** The step-by-step form both booking forms share: steps, checks, saved answers and submit. */
export function BookingWizard({
  sections,
  form,
  onFieldChange,
  isFieldVisible,
  trekField,
  draftKey,
  onRestoreDraft,
  submitLabel,
  onSubmit,
  onDownloadCopy,
}: BookingWizardProps) {
  const [step, setStep] = useState(0)
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]))
  const [flagged, setFlagged] = useState<Set<string>>(() => new Set())
  const [banner, setBanner] = useState<string | null>(null)
  const [pendingFocus, setPendingFocus] = useState<string | null>(null)
  const [restored, setRestored] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaRenderKey, setCaptchaRenderKey] = useState(0)
  const rootRef = useRef<HTMLFormElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const edited = useRef(false)
  const stepChanged = useRef(false)

  const siteKey = turnstileKey()
  const activeSection = sections[step] || sections[0]
  const isLastStep = step === sections.length - 1

  const problemsIn = (list: BookingFormConfig) =>
    list.flatMap((section) => section.fields).filter((field) => isFieldVisible(field) && getFieldProblem(field, form) !== null)

  const required = sections.flatMap((section) => section.fields).filter((field) => isFieldVisible(field) && isFieldRequired(field))
  const unanswered = required.filter((field) => getFieldProblem(field, form) !== null).length
  const progress = required.length === 0 ? 100 : Math.round(((required.length - unanswered) / required.length) * 100)

  useEffect(() => {
    const draft = readBookingDraft(draftKey)
    if (!draft) return
    onRestoreDraft(draft)
    setRestored(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey])

  useEffect(() => {
    if (edited.current) saveBookingDraft(draftKey, form)
  }, [draftKey, form])

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (edited.current) event.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])

  useEffect(() => {
    if (!stepChanged.current) return
    stepChanged.current = false
    // Clicking a step at the top shouldn't move the page; pressing Next at the bottom should.
    if ((headingRef.current?.getBoundingClientRect().top ?? 0) < HEADER_CLEARANCE) rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    headingRef.current?.focus({ preventScroll: true })
  }, [step])

  useEffect(() => {
    if (!pendingFocus) return
    const target = rootRef.current?.querySelector<HTMLElement>(`[data-field="${pendingFocus}"]`)
    const box = target?.getBoundingClientRect()
    if (box && (box.top < HEADER_CLEARANCE || box.bottom > window.innerHeight)) target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    target?.querySelector<HTMLElement>('input, select, textarea, button')?.focus({ preventScroll: true })
    setPendingFocus(null)
  }, [pendingFocus, step])

  const goTo = (index: number) => {
    if (index === step) return
    stepChanged.current = true
    setBanner(null)
    setVisited((prev) => new Set(prev).add(index))
    setStep(index)
  }

  const flag = (ids: string[]) => setFlagged((prev) => new Set([...prev, ...ids]))

  const change = (id: string, value: string | boolean) => {
    edited.current = true
    setBanner(null)
    onFieldChange(id, value)
  }

  const next = () => {
    const problems = problemsIn([activeSection])
    if (problems.length > 0) {
      flag(problems.map((field) => field.id))
      setPendingFocus(problems[0].id)
      return
    }
    goTo(Math.min(sections.length - 1, step + 1))
  }

  /** Shows every problem and takes the guest to the first one. Returns false if there are any. */
  const checkEverything = () => {
    const problems = problemsIn(sections)
    if (problems.length === 0) return true
    flag(problems.map((field) => field.id))
    const firstStep = sections.findIndex((section) => section.fields.some((field) => field.id === problems[0].id))
    setVisited((prev) => new Set(prev).add(firstStep))
    setStep(firstStep)
    setBanner(problems.length === 1 ? 'One answer still needs attention.' : `${problems.length} answers still need attention. The steps marked in red show where.`)
    setPendingFocus(problems[0].id)
    return false
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!isLastStep) {
      next()
      return
    }
    if (!checkEverything()) return
    if (siteKey && !captchaToken) {
      setBanner('Please complete the security check below, then submit.')
      return
    }
    setSubmitting(true)
    setBanner(null)
    try {
      const result = await onSubmit({ captchaToken, honeypot })
      if (result.ok) {
        edited.current = false
        clearBookingDraft(draftKey)
        return
      }
      setBanner(result.message)
      if (result.message.toLowerCase().includes('captcha')) {
        setCaptchaToken('')
        setCaptchaRenderKey((value) => value + 1)
      }
    } catch (err) {
      setBanner(err instanceof Error ? err.message : "We couldn't send your form. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const downloadCopy = async () => {
    if (!onDownloadCopy || !checkEverything()) return
    setDownloading(true)
    try {
      await onDownloadCopy()
    } catch (err) {
      setBanner(err instanceof Error ? err.message : "We couldn't create the PDF. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  const renderField = (field: BookingFormFieldConfig) => {
    if (!isFieldVisible(field)) return null
    const id = `booking-${field.id}`
    const problem = flagged.has(field.id) ? getFieldProblem(field, form) : null
    const notice = problem ? null : getFieldNotice(field, form)
    const messageId = problem || notice ? `${id}-message` : undefined
    const value = String(form[field.id] ?? '')
    const inputClass = cn(fieldInput, 'h-11 px-3', problem && invalidInput)
    const shared = {
      id,
      'aria-invalid': problem ? true : undefined,
      'aria-describedby': messageId,
      'aria-required': isFieldRequired(field) || undefined,
      onBlur: () => {
        if (value.trim()) flag([field.id])
      },
    }

    const message = (problem || notice) && (
      <p id={messageId} className={cn('flex items-start gap-1.5 text-xs', problem ? 'text-red-600' : 'text-amber-700 dark:text-amber-400')}>
        {problem ? <CircleAlert className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
        {problem || notice}
      </p>
    )

    if (field.type === 'checkbox') {
      const label =
        field.id === 'agreeTerms' ? (
          <>
            I agree to the{' '}
            <Link href="/terms-and-conditions" className="text-primary underline underline-offset-2" target="_blank">
              Terms and Conditions
            </Link>
            .
          </>
        ) : field.id === 'acceptLiabilityWaiver' ? (
          <>
            I have read and accept the{' '}
            <Link href="/liability-waiver" className="text-primary underline underline-offset-2" target="_blank">
              Liability Waiver
            </Link>
            .
          </>
        ) : field.id === 'photoMarketingConsent' ? (
          'I consent to my photos being used for marketing. (Optional)'
        ) : (
          field.label
        )
      return (
        <div data-field={field.id} className="space-y-1.5 sm:col-span-2">
          <label htmlFor={id} className={cn('flex cursor-pointer items-start gap-3 rounded-md border bg-background p-4 text-sm', problem ? 'border-red-500' : 'border-border')}>
            <Checkbox {...shared} onBlur={undefined} className="mt-0.5" checked={form[field.id] === true} onCheckedChange={(checked) => change(field.id, checked === true)} />
            <span>{label}</span>
          </label>
          {message}
        </div>
      )
    }

    const wide = field.type === 'textarea'
    const shell = (control: ReactNode, asGroup = false) => (
      <div data-field={field.id} className={cn('space-y-1.5', wide && 'sm:col-span-2')}>
        {asGroup ? (
          <p id={`${id}-label`} className="text-sm font-medium text-foreground">
            {field.label}
          </p>
        ) : (
          <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm font-medium text-foreground">
            <span>{field.label}</span>
            {!isFieldRequired(field) && <span className="shrink-0 text-xs font-normal text-muted-foreground">Optional</span>}
          </label>
        )}
        {control}
        {message}
      </div>
    )

    if (field.id === trekField.id) {
      const options = value && !trekField.options.includes(value) ? [value, ...trekField.options] : trekField.options
      return shell(
        <select {...shared} value={value} onChange={(event) => change(field.id, event.target.value)} className={inputClass}>
          <option value="">{trekField.placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )
    }

    if (field.type === 'textarea') {
      return shell(
        <textarea {...shared} value={value} onChange={(event) => change(field.id, event.target.value)} placeholder={field.placeholder} rows={3} className={cn(fieldInput, 'min-h-24 resize-y px-3 py-2.5', problem && invalidInput)} />
      )
    }

    if (field.type === 'select' && usesChoiceButtons(field)) {
      return shell(
        <div role="radiogroup" aria-labelledby={`${id}-label`} aria-describedby={messageId} className="flex flex-wrap gap-2">
          {(field.options || []).map((option) => (
            <label key={option} className="relative cursor-pointer">
              <input type="radio" name={id} value={option} checked={value === option} onChange={() => change(field.id, option)} className="peer sr-only" />
              <span
                className={cn(
                  'flex h-11 items-center rounded-md border bg-background px-4 text-sm font-medium transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring',
                  problem ? 'border-red-500' : 'border-input hover:bg-muted/60'
                )}
              >
                {option}
              </span>
            </label>
          ))}
        </div>,
        true
      )
    }

    if (field.type === 'select') {
      return shell(
        <select {...shared} value={value} onChange={(event) => change(field.id, event.target.value)} className={inputClass}>
          <option value="">Select</option>
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )
    }

    return shell(
      <input
        {...shared}
        {...(field.type === 'date' ? getDateLimits(field.id, form) : {})}
        type={field.type}
        value={value}
        onChange={(event) => change(field.id, event.target.value)}
        placeholder={field.placeholder}
        autoComplete={autocompleteFor(field.id)}
        autoCapitalize={isNameField(field.id) ? 'words' : field.type === 'email' ? 'none' : undefined}
        spellCheck={field.type === 'text' && !isNameField(field.id) ? undefined : false}
        className={inputClass}
      />
    )
  }

  const answeredRows = (section: BookingFormConfig[number]) =>
    section.fields.flatMap((field) => {
      if (!isFieldVisible(field) || field.type === 'checkbox') return []
      const value = String(form[field.id] ?? '').trim()
      return value ? [{ id: field.id, label: field.label, value }] : []
    })

  return (
    <form ref={rootRef} onSubmit={submit} noValidate className="scroll-mt-20 space-y-5">
      {restored && (
        <p role="status" className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          We kept the answers you already entered in this tab.
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <div className="space-y-3 border-b border-border bg-muted/20 p-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground">
                Step {step + 1} of {sections.length}
              </p>
              <h2 ref={headingRef} tabIndex={-1} className="mt-0.5 text-xl font-bold text-foreground outline-none">
                {activeSection.title}
              </h2>
            </div>
            <span className="shrink-0 text-sm font-semibold text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} aria-label="Form progress" />
          <ol className="flex flex-wrap gap-1.5">
            {sections.map((section, index) => {
              const hasProblems = problemsIn([section]).length > 0
              const flaggedHere = section.fields.some((field) => flagged.has(field.id) && isFieldVisible(field) && getFieldProblem(field, form) !== null)
              const done = visited.has(index) && !hasProblems && index !== step
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    title={section.title}
                    aria-label={`Step ${index + 1}: ${section.title}${done ? ', complete' : flaggedHere ? ', needs attention' : ''}`}
                    aria-current={index === step ? 'step' : undefined}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      index === step
                        ? 'border-primary bg-primary text-primary-foreground'
                        : flaggedHere
                          ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                          : done
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {done ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
                  </button>
                </li>
              )
            })}
          </ol>
        </div>

        <div className="space-y-4 p-4">
          {banner && (
            <p role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {banner}
            </p>
          )}

          {isLastStep && sections.length > 1 && (
            <details className="group rounded-md border border-border">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3 text-sm font-semibold text-foreground">
                Review your answers
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="space-y-4 border-t border-border p-3">
                {sections.slice(0, -1).map((section) => {
                  const rows = answeredRows(section)
                  return (
                    <div key={section.id}>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                        <button type="button" onClick={() => goTo(sections.indexOf(section))} className="text-xs font-semibold text-primary hover:underline">
                          Edit
                        </button>
                      </div>
                      {rows.length === 0 ? (
                        <p className="mt-1 text-xs text-muted-foreground">Nothing entered.</p>
                      ) : (
                        <dl className="mt-1 grid grid-cols-1 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
                          {rows.map((row) => (
                            <div key={row.id} className="min-w-0">
                              <dt className="text-muted-foreground">{row.label}</dt>
                              <dd className="break-words font-medium text-foreground">{row.value}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>
                  )
                })}
              </div>
            </details>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {activeSection.fields.map((field) => (
              <div key={field.id} className="contents">
                {renderField(field)}
              </div>
            ))}
            {isLastStep && siteKey && (
              <div className="space-y-2 sm:col-span-2">
                <p className="text-sm font-medium text-foreground">Security check</p>
                <TurnstileWidget
                  key={captchaRenderKey}
                  siteKey={siteKey}
                  onVerify={(value) => {
                    setCaptchaToken(value)
                    setBanner(null)
                  }}
                  onExpire={() => setCaptchaToken('')}
                  onError={() => {
                    setCaptchaToken('')
                    setBanner("The security check couldn't load. Please turn off any ad blocker for this page and reload it.")
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <input type="text" name="website" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} autoComplete="off" tabIndex={-1} className="hidden" aria-hidden="true" />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {step > 0 ? (
          <button type="button" onClick={() => goTo(step - 1)} disabled={submitting} className={cn(buttonBase, 'border border-input hover:bg-muted/60')}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
          </button>
        ) : (
          <span className="hidden sm:block" />
        )}
        {isLastStep ? (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            {onDownloadCopy && (
              <button type="button" onClick={() => void downloadCopy()} disabled={submitting || downloading} className={cn(buttonBase, 'border border-input hover:bg-muted/60')}>
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
                {downloading ? 'Preparing PDF…' : 'Download a copy'}
              </button>
            )}
            <button type="submit" disabled={submitting} className={cn(buttonBase, 'bg-primary text-primary-foreground hover:bg-primary/90')}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
              {submitting ? 'Sending…' : submitLabel}
            </button>
          </div>
        ) : (
          <button type="button" onClick={next} className={cn(buttonBase, 'bg-primary text-primary-foreground hover:bg-primary/90')}>
            Next <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">We&apos;ll save a PDF copy to your device when you submit.</p>
    </form>
  )
}
