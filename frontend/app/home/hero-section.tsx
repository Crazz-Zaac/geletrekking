import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CalendarCheck, CalendarDays, Star, Wallet } from 'lucide-react'
import { getAdminHero, type AdminAboutTeamMember } from '@/lib/api'
import type { Trek } from '@/lib/data'
import type { NextDeparture } from '@/lib/trek-availability'
import { GELE_CALL_URL } from '@/lib/contact-links'
import { FOUNDER_LEADER_SINCE_YEAR, FOUNDER_SINCE_YEAR, SITE_METRICS } from '@/lib/site-metrics'
import { getTrekPath } from '@/lib/trek-path'

const normalizeHeroCtaLink = (link?: string) => {
  const normalized = link?.trim() || ''
  return normalized === '/optional-treks' ? '/destinations' : normalized
}

const defaultHero = {
  title: "Trek the World's\nGreatest Mountains",
  subtitle:
    'Expert-guided trekking adventures in Nepal. Everest, Annapurna, Langtang and beyond — crafted for unforgettable Himalayan experiences.',
  backgroundImage: '/images/hero-himalaya.jpg',
  overlay: 'linear-gradient(to bottom, oklch(0.1 0.02 240 / 0.6), oklch(0.1 0.02 240 / 0.4), oklch(0.1 0.02 240 / 0.75))',
  ctaText: 'Explore Treks',
  ctaLink: '/destinations',
}

function formatDeparture(date: string) {
  return new Date(`${date}T00:00:00.000Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function FounderCard({ founder }: { founder: AdminAboutTeamMember }) {
  return (
    <aside
      aria-label="Your guide"
      className="mx-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/20 bg-slate-950/50 p-3 text-left text-white backdrop-blur-md xl:mx-0 xl:w-80 xl:max-w-none xl:shrink-0 xl:flex-col xl:items-start xl:p-5"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-white/40 xl:h-24 xl:w-24">
        <Image src={founder.imageUrl} alt={founder.name} fill sizes="96px" className="object-cover object-top" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-tight xl:text-lg">{founder.name}</p>
        <p className="text-xs text-white/70">Founder and lead guide</p>
        <p className="mt-3 hidden text-sm leading-relaxed text-white/85 xl:block">
          Started as a porter in {FOUNDER_SINCE_YEAR} and has led treks since {FOUNDER_LEADER_SINCE_YEAR}. Gele still leads most of our treks.
        </p>
        <a
          href={GELE_CALL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-accent hover:underline xl:mt-3"
        >
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Book a free call with Gele
        </a>
      </div>
    </aside>
  )
}

export async function HeroSection({
  founder,
  departures,
  rating,
  reviewCount,
}: {
  founder: AdminAboutTeamMember | null
  departures: NextDeparture<Trek>[]
  rating: number | null
  reviewCount: number | null
}) {
  let hero = defaultHero

  try {
    const remote = await getAdminHero()
    hero = {
      title: remote.title?.trim() || defaultHero.title,
      subtitle: remote.subtitle?.trim() || defaultHero.subtitle,
      backgroundImage: remote.backgroundImage?.trim() || defaultHero.backgroundImage,
      overlay: remote.overlay?.trim() || defaultHero.overlay,
      ctaText: remote.ctaText?.trim() || defaultHero.ctaText,
      ctaLink: normalizeHeroCtaLink(remote.ctaLink) || defaultHero.ctaLink,
    }
  } catch {
    hero = defaultHero
  }

  const heroTitleLines = hero.title.split('\n')
  const ratingLabel = rating ? rating.toFixed(1) : SITE_METRICS.googleReviewRating
  const proof = [
    { icon: Star, text: reviewCount ? `${ratingLabel} from ${reviewCount} Google reviews` : `${ratingLabel} on Google` },
    { icon: Wallet, text: 'Pay after you arrive in Nepal' },
    { icon: CalendarCheck, text: 'Change dates within a year' },
  ]

  return (
    <section className="relative flex min-h-[max(600px,calc(100svh-4rem))] flex-col overflow-hidden">
      {/* Background Image */}
      <Image
        src={hero.backgroundImage}
        alt=""
        fill
        sizes="100vw"
        priority
        className="object-cover"
        aria-hidden="true"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{ background: hero.overlay }} />

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-12 xl:flex-row xl:items-center xl:justify-between xl:gap-12">
        <div className="text-center xl:max-w-2xl xl:text-left">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent sm:text-sm">
            Led by Gele · In the Himalaya since {FOUNDER_SINCE_YEAR}
          </p>
          <h1 className="mb-4 text-balance font-serif text-4xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
            {heroTitleLines.map((line, index) => (
              <span key={line}>
                {index === 1 ? <span className="text-accent">{line}</span> : line}
                {index < heroTitleLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-pretty text-base leading-relaxed text-white/80 sm:text-xl xl:mx-0">
            {hero.subtitle}
          </p>

          <div className="flex items-center justify-center gap-3 xl:justify-start">
            <Link
              href={hero.ctaLink}
              className="flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-base font-semibold text-accent-foreground transition-colors hover:bg-accent/90 sm:px-7 sm:py-3.5"
            >
              {hero.ctaText}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/plan-my-trek"
              className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:px-7 sm:py-3.5"
            >
              Plan My Trek
            </Link>
          </div>

          <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-sm text-white/90 xl:justify-start">
            {proof.map(({ icon: Icon, text }, index) => (
              <li key={text} className="inline-flex items-center gap-1.5">
                <Icon className={index === 0 ? 'h-4 w-4 fill-amber-400 text-amber-400' : 'h-4 w-4 text-accent'} aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {founder?.imageUrl ? <FounderCard founder={founder} /> : null}
      </div>

      {/* Next departures, filled from the trek calendars */}
      {departures.length > 0 ? (
        <div className="relative z-10 border-t border-white/15 bg-slate-950/60 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white/80">Next departures</h2>
              <Link href="/destinations" className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
                All treks
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
            <ul className="-mx-4 flex snap-x scroll-pl-4 gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
              {departures.map(({ trek, startDate, status }) => (
                <li key={trek.id} className="w-[75%] shrink-0 snap-start sm:w-auto">
                  <Link
                    href={`${getTrekPath(trek)}#trek-availability`}
                    className="block h-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-white transition-colors hover:bg-white/20"
                  >
                    <span className="flex items-center justify-between gap-2 text-xs text-white/75">
                      <span>{formatDeparture(startDate)}</span>
                      {status === 'limited' ? <span className="font-semibold text-accent">Few places left</span> : null}
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-semibold">{trek.title}</span>
                    <span className="block text-xs text-white/75">From ${trek.price.toLocaleString()} per person</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  )
}
