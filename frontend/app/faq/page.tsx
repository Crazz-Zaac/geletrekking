'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { generalFAQ, trekFAQs, type TrekFAQ } from '@/lib/faq-data'

export default function FAQPage() {
  const [destinationFaqs] = useState<TrekFAQ[]>(trekFAQs)

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
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">{generalFAQ.heroTitle}</h1>
            <p className="text-muted-foreground max-w-3xl mx-auto mt-4 text-base md:text-lg">
              {generalFAQ.heroSubtitle}
            </p>
          </div>
        </section>

        {/* General FAQs */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <Card className="border-border p-4 md:p-6">
              <Accordion type="single" collapsible className="w-full">
                {generalFAQ.faqs.map((item, index) => (
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
                  <Card key={trek.trekSlug} className="border-border p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-primary shrink-0" />
                      {trek.trekTitle}
                    </h3>
                    <Accordion type="single" collapsible className="w-full">
                      {trek.faqs.map((item, index) => (
                        <AccordionItem key={`${trek.trekSlug}-${index}`} value={`${trek.trekSlug}-item-${index + 1}`}>
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
