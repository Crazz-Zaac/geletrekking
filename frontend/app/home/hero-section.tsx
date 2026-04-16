import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/hero-himalaya.jpg"
        alt="Himalayan mountains at golden hour"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.1_0.02_240/0.6)] via-[oklch(0.1_0.02_240/0.4)] to-[oklch(0.1_0.02_240/0.75)]" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-accent font-semibold text-sm uppercase tracking-[0.2em] mb-5">
          Nepal&apos;s Premier Trekking Company
        </p>
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight text-balance mb-6">
          Trek the World&apos;s
          <br />
          <span className="text-accent">Greatest</span> Mountains
        </h1>
        <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10 text-pretty">
          Expert-guided trekking adventures in Nepal. Everest, Annapurna, Langtang and beyond — crafted for unforgettable Himalayan experiences.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/destinations"
            className="flex items-center gap-2 bg-accent text-accent-foreground font-semibold px-7 py-3.5 rounded-xl hover:bg-accent/90 transition-colors text-base"
          >
            Explore Treks
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-colors text-base"
          >
            Plan My Trek
          </Link>
        </div>

        {/* Quick stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-white/70 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            500+ Treks Completed
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            15+ Years Experience
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Licensed & Insured
          </div>
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
