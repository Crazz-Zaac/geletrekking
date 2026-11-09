'use client'

import { CalendarClock, CircleDot, Tag } from 'lucide-react'
import { Field } from '@/components/admin/form-kit'
import { Input } from '@/components/ui/input'
import { OfferCard } from '@/app/home/special-offers'
import type { Trek } from '@/lib/data'
import { addCalendarDays } from '@/lib/trek-availability'
import { applyOfferToTier, offerProblem, offerStatus, percentOff, salePrice } from '@/lib/trek-offer'
import { cn } from '@/lib/utils'

export type OfferFields = {
  offer_type: string
  offer_description: string
  offer_discount_percent: number
  discounted_price_usd: number
  discounted_price_gbp: number
  offer_valid_from: string
  offer_valid_to: string
}

const QUICK_PERCENTS = [5, 10, 15, 20]
const QUICK_NAMES = ['Early Bird', 'Autumn Deal', 'Spring Deal', 'Last Minute', 'Group Discount']
const QUICK_LENGTHS = [7, 14, 30]

const STATUS_STYLE = {
  live: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300',
  scheduled: 'bg-sky-50 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300',
  ended: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
}

const toNumber = (value: string) => Number(value.replace(/[^\d]/g, '')) || 0

const chip = (active: boolean) =>
  cn(
    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
    active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:bg-muted'
  )

export function OfferEditor({
  value,
  onChange,
  regularUsd,
  regularGbp,
  packages,
  trek,
}: {
  value: OfferFields
  onChange: (patch: Partial<OfferFields>) => void
  regularUsd: number
  regularGbp: number
  packages: { name: string; price_usd: number }[]
  trek: { name: string; image: string; duration: number; difficulty: string }
}) {
  const today = new Date().toISOString().slice(0, 10)
  const status = offerStatus(value.offer_valid_from, value.offer_valid_to, today)
  const problem = offerProblem(value, regularUsd)
  const savings = value.discounted_price_usd > 0 ? regularUsd - value.discounted_price_usd : 0
  const lengthFrom = value.offer_valid_from || today

  const setPercent = (percent: number) => {
    const clamped = Math.min(percent, 95)
    onChange({
      offer_discount_percent: clamped,
      discounted_price_usd: clamped ? salePrice(regularUsd, clamped) : 0,
      discounted_price_gbp: clamped && regularGbp ? salePrice(regularGbp, clamped) : 0,
    })
  }

  const setSale = (sale: number) =>
    onChange({
      discounted_price_usd: sale,
      offer_discount_percent: percentOff(regularUsd, sale),
      discounted_price_gbp: sale && regularGbp && regularUsd ? Math.round((regularGbp * sale) / regularUsd) : 0,
    })

  const showsDiscount = value.discounted_price_usd > 0 && value.discounted_price_usd < regularUsd
  const packagePrices = packages
    .filter((item) => item.name.trim() && item.price_usd > 0)
    .map((item) => ({
      ...item,
      sale: applyOfferToTier(item.price_usd, {
        percent: value.offer_discount_percent,
        originalPrice: regularUsd,
        salePrice: value.discounted_price_usd,
      }).price,
    }))
  const preview = {
    id: 'preview',
    slug: '',
    title: trek.name.trim() || 'Your trek name',
    image: trek.image.trim() || '/images/hero-himalaya.jpg',
    duration: trek.duration,
    difficulty: trek.difficulty,
    price: showsDiscount ? value.discounted_price_usd : regularUsd,
    originalPrice: showsDiscount ? regularUsd : undefined,
    offerDiscountPercent: showsDiscount ? value.offer_discount_percent || undefined : undefined,
    offerValidTo: value.offer_valid_to || undefined,
    offerType: value.offer_type,
  } as unknown as Trek

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
      <div className="min-w-0 space-y-6">
        <section aria-labelledby="offer-discount" className="space-y-3">
          <h3 id="offer-discount" className="text-sm font-semibold text-foreground">Discount</h3>
          {regularUsd > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Regular price <span className="font-semibold text-foreground">${regularUsd.toLocaleString('en-US')}</span>
                {regularGbp > 0 ? ` · £${regularGbp.toLocaleString('en-US')}` : ''}. Enter a percent or a sale price, and the other fills in.
              </p>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick discount">
                {QUICK_PERCENTS.map((percent) => (
                  <button key={percent} type="button" aria-pressed={value.offer_discount_percent === percent} onClick={() => setPercent(percent)} className={chip(value.offer_discount_percent === percent)}>
                    {percent}% off
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Field label="Discount %">
                  <Input inputMode="numeric" placeholder="15" value={value.offer_discount_percent || ''} onChange={(event) => setPercent(toNumber(event.target.value))} />
                </Field>
                <Field label="Sale price (USD)">
                  <Input inputMode="numeric" placeholder={String(salePrice(regularUsd, 15))} value={value.discounted_price_usd || ''} onChange={(event) => setSale(toNumber(event.target.value))} />
                </Field>
                {regularGbp > 0 ? (
                  <Field label="Sale price (GBP)">
                    <Input inputMode="numeric" value={value.discounted_price_gbp || ''} onChange={(event) => onChange({ discounted_price_gbp: toNumber(event.target.value) })} />
                  </Field>
                ) : null}
              </div>
              {savings > 0 ? <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Trekkers save ${savings.toLocaleString('en-US')} per person.</p> : null}
              {showsDiscount && packagePrices.length > 0 ? (
                <ul className="rounded-md border border-border bg-background p-3 text-sm">
                  {packagePrices.map((item) => (
                    <li key={item.name} className="flex items-center justify-between gap-3 py-0.5">
                      <span className="text-foreground">{item.name}</span>
                      <span className="tabular-nums">
                        <span className="mr-2 text-xs text-muted-foreground line-through">${item.price_usd.toLocaleString('en-US')}</span>
                        <span className="font-semibold text-red-600">${item.sale.toLocaleString('en-US')}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <p className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">Add this trek’s price first, then you can set a discount here.</p>
          )}
        </section>

        <section aria-labelledby="offer-wording" className="space-y-3">
          <h3 id="offer-wording" className="text-sm font-semibold text-foreground">Wording</h3>
          <Field label="Offer name">
            <Input placeholder="e.g. Early Bird" value={value.offer_type} onChange={(event) => onChange({ offer_type: event.target.value })} />
          </Field>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Suggested names">
            {QUICK_NAMES.map((name) => (
              <button key={name} type="button" aria-pressed={value.offer_type === name} onClick={() => onChange({ offer_type: name })} className={chip(value.offer_type === name)}>
                {name}
              </button>
            ))}
          </div>
          <Field label="Short description" hint="One line. Trek cards cut off anything longer." count={{ value: value.offer_description, max: 70, recommended: true }}>
            <Input placeholder="e.g. Book by 30 November and save on spring departures" value={value.offer_description} onChange={(event) => onChange({ offer_description: event.target.value })} />
          </Field>
        </section>

        <section aria-labelledby="offer-dates" className="space-y-3">
          <h3 id="offer-dates" className="text-sm font-semibold text-foreground">When it runs</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Starts" hint="Leave empty to start as soon as you save.">
              <Input type="date" value={value.offer_valid_from} onChange={(event) => onChange({ offer_valid_from: event.target.value })} />
            </Field>
            <Field label="Ends" hint="Leave empty for no end date. The last day is included.">
              <Input type="date" min={value.offer_valid_from || undefined} value={value.offer_valid_to} onChange={(event) => onChange({ offer_valid_to: event.target.value })} />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Quick offer length">
            <span className="mr-1 text-xs text-muted-foreground">Run for</span>
            {QUICK_LENGTHS.map((days) => {
              const end = addCalendarDays(lengthFrom, days - 1)
              return (
                <button key={days} type="button" aria-pressed={value.offer_valid_to === end} onClick={() => onChange({ offer_valid_to: end })} className={chip(value.offer_valid_to === end)}>
                  {days} days
                </button>
              )
            })}
          </div>
        </section>
      </div>

      <aside aria-label="Offer preview" className="min-w-0 space-y-3 lg:sticky lg:top-32 lg:self-start">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">Preview</h3>
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', STATUS_STYLE[status.state])}>
            {status.state === 'live' ? <CircleDot className="h-3 w-3" aria-hidden="true" /> : <CalendarClock className="h-3 w-3" aria-hidden="true" />}
            {status.label}
          </span>
        </div>
        {problem ? (
          <p role="alert" className="rounded-md border-l-4 border-red-500 bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-200">{problem}</p>
        ) : null}
        <div inert className="pointer-events-none">
          <OfferCard trek={preview} className="min-h-[9.5rem]" showShare={false} />
        </div>
        {value.offer_description.trim() ? (
          <p className="inline-flex items-start gap-1.5 text-xs text-red-700 dark:text-red-400">
            <Tag className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            {value.offer_description.trim()}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">Goes live after you save. The homepage shows up to 4 offers at a time.</p>
      </aside>
    </div>
  )
}
