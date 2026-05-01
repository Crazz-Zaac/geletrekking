import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import { getAdminHero } from '@/lib/api'

const defaultHero = {
  title: "Trek the World's\nGreatest Mountains",
  subtitle:
    'Expert-guided trekking adventures in Nepal. Everest, Annapurna, Langtang and beyond — crafted for unforgettable Himalayan experiences.',
  backgroundImage: '/images/hero-himalaya.jpg',
  overlay: 'linear-gradient(to bottom, oklch(0.1 0.02 240 / 0.6), oklch(0.1 0.02 240 / 0.4), oklch(0.1 0.02 240 / 0.75))',
  ctaText: 'Explore Treks',
  ctaLink: '/destinations',
}

export async function HeroSection() {
  let hero = defaultHero

  try {
    const remote = await getAdminHero()
    hero = {
      title: remote.title?.trim() || defaultHero.title,
      subtitle: remote.subtitle?.trim() || defaultHero.subtitle,
      backgroundImage: remote.backgroundImage?.trim() || defaultHero.backgroundImage,
      overlay: remote.overlay?.trim() || defaultHero.overlay,
      ctaText: remote.ctaText?.trim() || defaultHero.ctaText,
      ctaLink: remote.ctaLink?.trim() || defaultHero.ctaLink,
    }
  } catch {
    hero = defaultHero
  }

  const heroTitleLines = hero.title.split('\n')
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${hero.backgroundImage}')` }}
        aria-hidden="true"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{ background: hero.overlay }} />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-accent font-semibold text-sm uppercase tracking-[0.2em] mb-5">
          Nepal&apos;s Premier Trekking Company
        </p>
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight text-balance mb-6">
          {heroTitleLines.map((line, index) => (
            <span key={line}>
              {index === 1 ? <span className="text-accent">{line}</span> : line}
              {index < heroTitleLines.length - 1 ? <br /> : null}
            </span>
          ))}
        </h1>
        <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10 text-pretty">
          {hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={hero.ctaLink}
            className="flex items-center gap-2 bg-accent text-accent-foreground font-semibold px-7 py-3.5 rounded-xl hover:bg-accent/90 transition-colors text-base"
          >
            {hero.ctaText}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-colors text-base"
          >
            Plan My Trek
          </Link>
        </div>

      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-1">
          <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
