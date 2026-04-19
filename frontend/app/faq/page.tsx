'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { generalFAQ } from '@/lib/faq-data'

export default function FAQPage() {
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
      </main>
      <Footer />
    </>
  )
}
