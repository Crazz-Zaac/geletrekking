'use client'

import { Star, Quote } from 'lucide-react'
import { testimonials as fallbackTestimonials } from '@/lib/data'
import type { UiTestimonial } from '@/lib/api'

interface TestimonialsCarouselProps {
  testimonials?: UiTestimonial[]
}

export function TestimonialsCarousel({ testimonials = fallbackTestimonials }: TestimonialsCarouselProps) {
  return (
    <section className="py-16 md:py-20 bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">What Trekkers Say</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white text-balance">
            Stories from the Trail
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="relative rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm"
            >
              <Quote className="absolute top-4 right-4 w-5 h-5 text-accent/50" strokeWidth={1.5} />

              <div className="flex gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, index) => (
                  <Star key={index} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              <p className="text-white/90 text-sm leading-relaxed mb-4">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <span className="text-accent-foreground font-bold text-xs">{testimonial.avatar}</span>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{testimonial.name}</p>
                  <p className="text-white/60 text-xs">{testimonial.country}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
