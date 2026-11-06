'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  AdminPageHeader,
  Field,
  FieldGrid,
  FormSection,
  FormSkeleton,
  ImageUrlField,
  SaveBar,
  StatusToasts,
  TextArea,
  useDirtyState,
  useUnsavedChangesWarning,
} from '@/components/admin/form-kit'
import { AdminHero, getAdminHero, updateAdminHero } from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'
import { cn } from '@/lib/utils'

const defaultHero: AdminHero = {
  title: '',
  subtitle: '',
  backgroundImage: '',
  overlay: '',
  ctaText: 'Explore Treks',
  ctaLink: '/destinations',
}

const OVERLAY_PRESETS = [
  { label: 'None', value: '' },
  { label: 'Soft', value: 'linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.45))' },
  { label: 'Dark', value: 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.75))' },
  { label: 'Bottom fade', value: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.8))' },
]

const normalizeHeroForm = (hero: AdminHero): AdminHero => ({
  ...defaultHero,
  ...hero,
  ctaText: hero.ctaText?.trim() || defaultHero.ctaText,
  ctaLink: hero.ctaLink?.trim() === '/optional-treks' ? '/destinations' : hero.ctaLink?.trim() || defaultHero.ctaLink,
})

export default function AdminHeroPage() {
  const [form, setForm] = useState<AdminHero>(defaultHero)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [customOverlay, setCustomOverlay] = useState(false)
  const { dirty, markSaved, baseline } = useDirtyState(form)
  useUnsavedChangesWarning(dirty)

  const token = getAdminToken()

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = normalizeHeroForm(await getAdminHero())
      setForm(data)
      markSaved(data)
      setCustomOverlay(!OVERLAY_PRESETS.some((preset) => preset.value === (data.overlay || '')))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hero section')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = <K extends keyof AdminHero>(key: K, value: AdminHero[K]) => setForm((prev) => ({ ...prev, [key]: value }))

  const onSave = async () => {
    if (!token) {
      setError('Your session has expired. Please log in again.')
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await updateAdminHero(token, normalizeHeroForm(form))
      setMessage('Homepage hero saved.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save hero section')
    } finally {
      setSaving(false)
    }
  }

  const onDiscard = () => {
    const saved = baseline()
    if (saved) setForm(saved)
  }

  const background = `${form.overlay || ''}${form.overlay ? ', ' : ''}url('${form.backgroundImage || '/images/hero-himalaya.jpg'}')`

  return (
    <div className="space-y-8">
      <StatusToasts error={error} message={message} />
      <AdminPageHeader title="Homepage hero" description="The first thing visitors see: headline, message, button and background photo." />

      {loading ? (
        <FormSkeleton rows={3} />
      ) : (
        <>
          {/* Live preview */}
          <section aria-label="Live preview" className="overflow-hidden rounded-xl border border-border shadow-sm">
            <div className="relative flex min-h-64 items-center justify-center bg-cover bg-center px-6 py-12 text-center md:min-h-80" style={{ backgroundImage: background }}>
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">Nepal&apos;s premier trekking company</p>
                <h2 className="mt-3 whitespace-pre-line font-serif text-3xl font-bold leading-tight text-white drop-shadow md:text-5xl">
                  {form.title || 'Your headline'}
                </h2>
                <p className="mx-auto mt-3 max-w-xl whitespace-pre-line text-sm text-white/85 md:text-base">
                  {form.subtitle || 'Supporting message under the headline.'}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white">
                  {form.ctaText || 'Explore Treks'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white">Live preview</span>
            </div>
          </section>

          <FormSection title="Text" description="Keep the headline short and the message to one or two sentences.">
            <Field label="Headline" hint="Press Enter for a line break." count={{ value: form.title, max: 60, recommended: true }}>
              <TextArea rows={2} className="min-h-0" placeholder={'Experience the\nReal Himalayas'} value={form.title || ''} onChange={(e) => set('title', e.target.value)} />
            </Field>
            <Field label="Message" count={{ value: form.subtitle, max: 160, recommended: true }}>
              <TextArea rows={3} placeholder="Authentic adventures led by local experts." value={form.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)} />
            </Field>
          </FormSection>

          <FormSection title="Button" description="The main call to action under the message.">
            <FieldGrid>
              <Field label="Button text">
                <Input className="h-10" placeholder="Explore Treks" value={form.ctaText || ''} onChange={(e) => set('ctaText', e.target.value)} />
              </Field>
              <Field label="Button link" hint="A page on this site, e.g. /destinations or /book.">
                <Input className="h-10" placeholder="/destinations" value={form.ctaLink || ''} onChange={(e) => set('ctaLink', e.target.value)} />
              </Field>
            </FieldGrid>
          </FormSection>

          <FormSection title="Background" description="A wide, high-resolution landscape photo. The overlay keeps the text readable.">
            <ImageUrlField
              label="Background photo"
              value={form.backgroundImage}
              onChange={(value) => set('backgroundImage', value)}
              hint="At least 1920 px wide. Leave empty to use the default Himalaya photo."
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Darken overlay</p>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Overlay">
                {OVERLAY_PRESETS.map((preset) => {
                  const selected = !customOverlay && (form.overlay || '') === preset.value
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        setCustomOverlay(false)
                        set('overlay', preset.value)
                      }}
                      className={cn(
                        'rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-muted'
                      )}
                    >
                      {preset.label}
                    </button>
                  )
                })}
                <button
                  type="button"
                  role="radio"
                  aria-checked={customOverlay}
                  onClick={() => setCustomOverlay(true)}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    customOverlay ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-muted'
                  )}
                >
                  Custom
                </button>
              </div>
            </div>
            {customOverlay && (
              <Field label="Custom overlay (CSS)" hint="Example: linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.8))">
                <Input className="h-10 font-mono text-xs" placeholder="linear-gradient(…)" value={form.overlay || ''} onChange={(e) => set('overlay', e.target.value)} />
              </Field>
            )}
          </FormSection>

          <SaveBar dirty={dirty} saving={saving} onSave={onSave} onDiscard={dirty ? onDiscard : undefined} saveLabel="Save hero" />
        </>
      )}
    </div>
  )
}
