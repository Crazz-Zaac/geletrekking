'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { getAdminFaq, getTreks, type AdminFaq } from '@/lib/api'
import type { Trek } from '@/lib/data'

const defaultFaq: Required<AdminFaq> = {
  heroTitle: 'Frequently Asked Questions',
  heroSubtitle:
    'Helpful answers about trekking seasons, permits, difficulty, insurance, and planning your Himalayan adventure.',
  faqs: [
    { question: 'What is the best trekking season in Nepal?', answer: 'Spring (March–May) and Autumn (October–November) are the best seasons for clear mountain views and stable weather across most regions.', order: 0 },
    { question: 'Do I need prior trekking experience?', answer: 'Not always. Many routes are beginner-friendly, but a basic fitness level helps. We recommend preparing with regular cardio and day hikes before your trip.', order: 1 },
    { question: 'Is travel insurance mandatory?', answer: 'Yes, travel insurance with high-altitude trekking and emergency helicopter evacuation coverage is mandatory for all our treks.', order: 2 },
    { question: 'What permits are required for trekking?', answer: 'Permit requirements depend on your route. Common permits include TIMS and regional conservation permits. Restricted areas may need special permits.', order: 3 },
    { question: 'Can I book a private trek?', answer: 'Yes. We offer both fixed-group departures and private trips with flexible dates, pace, and itinerary customizations.', order: 4 },
    { question: 'How difficult are tea house treks?', answer: 'Tea house treks vary from easy to challenging. Difficulty usually depends on altitude, duration, and daily walking hours. We help match you to the right route.', order: 5 },
  ],
}

interface TrekWithFaqs {
  title: string
  slug: string
  faqs: { question: string; answer: string }[]
}

export default function FAQPage() {
  const [faq, setFaq] = useState<Required<AdminFaq>>(defaultFaq)
  const [destinationFaqs, setDestinationFaqs] = useState<TrekWithFaqs[]>([])

  useEffect(() => {
    // Load general FAQs
    getAdminFaq()
      .then((data) => {
        const heroTitle = (data.heroTitle || '').trim() || defaultFaq.heroTitle
        const heroSubtitle = (data.heroSubtitle || '').trim() || defaultFaq.heroSubtitle
        const faqs = (data.faqs || []).filter((f) => f.question?.trim() && f.answer?.trim())
        setFaq({
          heroTitle,
          heroSubtitle,
          faqs: faqs.length > 0 ? faqs : defaultFaq.faqs,
        })
      })
      .catch(() => setFaq(defaultFaq))

    // Load destination (trek) FAQs
    getTreks()
      .then((treks: Trek[]) => {
        const withFaqs = treks
          .filter((t) => t.faqs && t.faqs.length > 0)
          .map((t) => ({
            title: t.title,
            slug: t.slug,
            faqs: t.faqs as { question: string; answer: string }[],
          }))
        setDestinationFaqs(withFaqs)
      })
      .catch(() => setDestinationFaqs([]))
  }, [])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        {/* Hero */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 via-accent/10 to-background border-b border-border">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-semibold text-primary mb-4">
              FAQ&apos;s
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">{faq.heroTitle}</h1>
            <p className="text-muted-foreground max-w-3xl mx-auto mt-4 text-base md:text-lg">
              {faq.heroSubtitle}
            </p>
          </div>
        </section>

        {/* General FAQs */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <Card className="border-border p-4 md:p-6">
              <Accordion type="single" collapsible className="w-full">
                {faq.faqs.map((item, index) => (
                  <AccordionItem key={item.question} value={`item-${index + 1}`}>
                    <AccordionTrigger className="text-left font-semibold text-foreground">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </div>
        </section>

        {/* Destination FAQs */}
        {destinationFaqs.length > 0 && (
          <section className="py-12 md:py-16 border-t border-border bg-muted/30">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
              <div className="mb-8 text-center">
                <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-semibold text-primary mb-3">
                  By Destination
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Destination FAQs</h2>
                <p className="text-muted-foreground mt-3 text-base md:text-lg">
                  Trek-specific questions and answers for each of our destinations.
                </p>
              </div>

              <div className="space-y-6">
                {destinationFaqs.map((trek) => (
                  <Card key={trek.slug} className="border-border p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-primary shrink-0" />
                      {trek.title}
                    </h3>
                    <Accordion type="single" collapsible className="w-full">
                      {trek.faqs.map((item, index) => (
                        <AccordionItem key={`${trek.slug}-${index}`} value={`${trek.slug}-item-${index + 1}`}>
                          <AccordionTrigger className="text-left font-semibold text-foreground">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
