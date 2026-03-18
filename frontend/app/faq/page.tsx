import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
  {
    question: 'What is the best trekking season in Nepal?',
    answer:
      'Spring (March–May) and Autumn (October–November) are the best seasons for clear mountain views and stable weather across most regions.',
  },
  {
    question: 'Do I need prior trekking experience?',
    answer:
      'Not always. Many routes are beginner-friendly, but a basic fitness level helps. We recommend preparing with regular cardio and day hikes before your trip.',
  },
  {
    question: 'Is travel insurance mandatory?',
    answer:
      'Yes, travel insurance with high-altitude trekking and emergency helicopter evacuation coverage is mandatory for all our treks.',
  },
  {
    question: 'What permits are required for trekking?',
    answer:
      'Permit requirements depend on your route. Common permits include TIMS and regional conservation permits. Restricted areas may need special permits.',
  },
  {
    question: 'Can I book a private trek?',
    answer:
      'Yes. We offer both fixed-group departures and private trips with flexible dates, pace, and itinerary customizations.',
  },
  {
    question: 'How difficult are tea house treks?',
    answer:
      'Tea house treks vary from easy to challenging. Difficulty usually depends on altitude, duration, and daily walking hours. We help match you to the right route.',
  },
]

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 via-accent/10 to-background border-b border-border">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-semibold text-primary mb-4">
              FAQ&apos;s
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Frequently Asked Questions</h1>
            <p className="text-muted-foreground max-w-3xl mx-auto mt-4 text-base md:text-lg">
              Helpful answers about trekking seasons, permits, difficulty, insurance, and planning your Himalayan adventure.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <Card className="border-border p-4 md:p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={faq.question} value={`item-${index + 1}`}>
                    <AccordionTrigger className="text-left font-semibold text-foreground">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
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
