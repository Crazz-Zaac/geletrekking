'use client'

import { useState } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, ListPlus, Lock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Field, SaveBar, SelectInput } from '@/components/admin/form-kit'
import type { BookingFieldType } from '@/lib/api'
import { defaultBookingFormConfig, type BookingFormConfig, type BookingFormFieldConfig } from '@/lib/booking-form-config'
import { cn } from '@/lib/utils'

const FIELD_TYPES: Array<{ value: BookingFieldType; label: string }> = [
  { value: 'text', label: 'Short text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'select', label: 'Choice list' },
  { value: 'checkbox', label: 'Tick box' },
]
const LOCKED_IDS = new Set(['firstName', 'lastName', 'email', 'trekPackage', 'agreeTerms', 'acceptLiabilityWaiver', 'signatureName', 'signatureDate'])
/** Built-in answers are matched by id elsewhere, so renaming the label must not change it. */
const BUILT_IN_IDS = new Set(defaultBookingFormConfig.flatMap((section) => section.fields.map((field) => field.id)))

const slugify = (value: string) => value.trim().replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').replace(/^([0-9])/, 'field_$1')

function uniqueId(base: string, config: BookingFormConfig, ownId: string) {
  const taken = new Set(config.flatMap((section) => section.fields.map((field) => field.id)).filter((id) => id !== ownId))
  if (!taken.has(base)) return base
  let suffix = 2
  while (taken.has(`${base}_${suffix}`)) suffix += 1
  return `${base}_${suffix}`
}

export function FormFieldsTab({
  config,
  dirty,
  saving,
  onChange,
  onSave,
  onDiscard,
  onReset,
}: {
  config: BookingFormConfig
  dirty: boolean
  saving: boolean
  onChange: (next: BookingFormConfig) => void
  onSave: () => void
  onDiscard: () => void
  onReset: () => void
}) {
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set([config[0]?.id]))

  const setFields = (sectionIndex: number, change: (fields: BookingFormFieldConfig[]) => BookingFormFieldConfig[]) =>
    onChange(config.map((section, index) => (index === sectionIndex ? { ...section, fields: change(section.fields) } : section)))

  const updateField = (sectionIndex: number, fieldIndex: number, patch: Partial<BookingFormFieldConfig>) =>
    setFields(sectionIndex, (fields) => fields.map((field, index) => (index === fieldIndex ? { ...field, ...patch } : field)))

  const rename = (sectionIndex: number, fieldIndex: number, field: BookingFormFieldConfig, label: string) => {
    const id = BUILT_IN_IDS.has(field.id) ? field.id : uniqueId(slugify(label) || field.id, config, field.id)
    updateField(sectionIndex, fieldIndex, { label, id })
  }

  const move = (sectionIndex: number, fieldIndex: number, direction: -1 | 1) =>
    setFields(sectionIndex, (fields) => {
      const next = [...fields]
      ;[next[fieldIndex], next[fieldIndex + direction]] = [next[fieldIndex + direction], next[fieldIndex]]
      return next
    })

  const addField = (sectionIndex: number) => setFields(sectionIndex, (fields) => [...fields, { id: uniqueId('New_field', config, ''), label: 'New field', type: 'text' }])

  const toggle = (id: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const totalFields = config.reduce((sum, section) => sum + section.fields.length, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="min-w-0">
          <h2 className="font-semibold text-foreground">
            {totalFields} questions in {config.length} steps
          </h2>
          <p className="text-sm text-muted-foreground">Saved for all admins and used for every new link. Links already sent keep their own form.</p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          Reset to standard
        </Button>
      </div>

      {config.map((section, sectionIndex) => {
        const open = openSections.has(section.id)
        return (
          <section key={section.id} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{sectionIndex + 1}</span>
              <input
                aria-label={`Step ${sectionIndex + 1} name`}
                className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 font-semibold text-foreground outline-none hover:border-border focus:border-primary"
                value={section.title}
                onChange={(event) => onChange(config.map((item, index) => (index === sectionIndex ? { ...item, title: event.target.value } : item)))}
              />
              <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">{section.fields.length} questions</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-expanded={open} aria-label={`${open ? 'Collapse' : 'Expand'} ${section.title}`} onClick={() => toggle(section.id)}>
                <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
              </Button>
            </div>

            {open && (
              <div className="border-t border-border">
                <ul className="divide-y divide-border">
                  {section.fields.map((field, fieldIndex) => {
                    const locked = Boolean(field.locked || LOCKED_IDS.has(field.id))
                    const showsPlaceholder = !['select', 'checkbox', 'date', 'time'].includes(field.type)
                    return (
                      <li key={fieldIndex} className="space-y-3 p-3">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_10rem] md:items-end">
                          <Field label="Question">
                            <Input className="h-10" value={field.label} onChange={(event) => rename(sectionIndex, fieldIndex, field, event.target.value)} />
                          </Field>
                          <Field label="Answer type">
                            <SelectInput value={field.type} disabled={locked} onChange={(event) => updateField(sectionIndex, fieldIndex, { type: event.target.value as BookingFieldType })}>
                              {FIELD_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </SelectInput>
                          </Field>
                        </div>

                        {field.type === 'select' && field.id !== 'trekPackage' && (
                          <Field label="Choices" hint="Separate with commas.">
                            <Input
                              className="h-10"
                              key={field.id}
                              placeholder="Yes, No"
                              defaultValue={(field.options || []).join(', ')}
                              onBlur={(event) => updateField(sectionIndex, fieldIndex, { options: event.target.value.split(',').map((option) => option.trim()).filter(Boolean) })}
                            />
                          </Field>
                        )}
                        {showsPlaceholder && (
                          <Field label="Example text" hint="Shown faintly inside the empty box.">
                            <Input className="h-10" value={field.placeholder || ''} onChange={(event) => updateField(sectionIndex, fieldIndex, { placeholder: event.target.value })} />
                          </Field>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          {locked ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Always required
                            </span>
                          ) : (
                            <label className="inline-flex items-center gap-2 text-sm text-foreground">
                              <Switch checked={Boolean(field.required)} onCheckedChange={(required) => updateField(sectionIndex, fieldIndex, { required })} />
                              Required
                            </label>
                          )}
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={fieldIndex === 0} aria-label={`Move ${field.label} up`} onClick={() => move(sectionIndex, fieldIndex, -1)}>
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={fieldIndex === section.fields.length - 1} aria-label={`Move ${field.label} down`} onClick={() => move(sectionIndex, fieldIndex, 1)}>
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            {!locked && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700" aria-label={`Remove ${field.label}`} onClick={() => setFields(sectionIndex, (fields) => fields.filter((_, index) => index !== fieldIndex))}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <div className="border-t border-border p-3">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addField(sectionIndex)}>
                    <ListPlus className="h-3.5 w-3.5" /> Add a question
                  </Button>
                </div>
              </div>
            )}
          </section>
        )
      })}

      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onDiscard={dirty ? onDiscard : undefined} saveLabel="Save form" />
    </div>
  )
}
