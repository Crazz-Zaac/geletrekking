import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, HeartPulse, LifeBuoy, Mountain, ShieldCheck, Stethoscope, Users, Wallet } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { JsonLd } from '@/components/json-ld'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Safety & Trekking with Confidence',
  description:
    'How Gele Trekking keeps you safe in the Himalayas: trained guides, careful acclimatisation, emergency and evacuation support, insurance requirements, porter welfare and clear booking terms.',
  path: '/safety',
})

// Every statement on this page reflects our published guides, FAQ and terms.
// Update it together with those pages.
const SECTIONS = [
  {
    icon: Users,
    title: 'Trained local guides',
    points: [
      'Our guides plan safe routes based on your group’s fitness and set the pace and rest days.',
      'They monitor everyone for signs of altitude sickness and make sure you acclimatise properly.',
      'They are trained to give first aid and to handle emergency situations on the trail.',
      'When safety requires it, your guide may ask you to rest, descend or change the itinerary.',
    ],
    link: { href: '/guides/guide-rules-and-etiquette', label: 'Guide rules & trekking etiquette' },
  },
  {
    icon: Mountain,
    title: 'Altitude & acclimatisation',
    points: [
      'Climbing gradually is the best protection against acute mountain sickness (AMS), and your guide makes sure you acclimatise properly.',
      'Tell your guide straight away about a headache, nausea, dizziness or breathlessness at rest; these are early AMS warning signs.',
      'Serious altitude illness (HACE or HAPE) is a medical emergency, and the response is to descend immediately.',
    ],
    link: { href: '/guides/hypoxia-and-altitude-sickness', label: 'Hypoxia & altitude sickness guide' },
  },
  {
    icon: LifeBuoy,
    title: 'Emergencies & evacuation',
    points: [
      'If something goes wrong, we help coordinate rescue and evacuation, including helicopter evacuation where needed.',
      'Your travel insurer approves and pays for evacuation and medical treatment, so carry your policy details and emergency contacts at all times.',
      'Mountain weather, landslides and flight delays can change plans; we adjust routes and schedules when that is the safer choice.',
    ],
    link: { href: '/terms-and-conditions#section-5', label: 'Insurance & evacuation terms' },
  },
  {
    icon: ShieldCheck,
    title: 'Travel insurance is required',
    points: [
      'Every trekker must have travel insurance that covers trekking at your trek’s maximum altitude, medical treatment and helicopter evacuation.',
      'Your trip leader checks your insurance details when you arrive.',
      'We recommend cover of at least USD 100,000 for medical expenses, plus trip cancellation and repatriation.',
    ],
    link: { href: '/guides/insurance', label: 'Travel & trekking insurance guide' },
  },
  {
    icon: Stethoscope,
    title: 'Health & preparation',
    points: [
      'Tell us about medical conditions, medications, allergies, injuries and any past altitude problems before you travel, so we can plan around them.',
      'Drink only filtered, boiled or purified water on the trail.',
      'Prepare physically for your chosen trek; we are happy to help you pick one that suits your fitness.',
    ],
    link: { href: '/guides/health-and-medicine', label: 'Health & medicine guide' },
  },
  {
    icon: HeartPulse,
    title: 'Fair treatment of our team',
    points: [
      'Fair wages for guides and porters are included in our packages.',
      'We ask every trekker to treat guides, porters and local communities with respect.',
    ],
    link: { href: '/guides/guide-rules-and-etiquette', label: 'Treating guides & porters with respect' },
  },
  {
    icon: Wallet,
    title: 'Clear booking & payment terms',
    points: [
      'Your booking is confirmed only after we receive your deposit, your booking details and our written confirmation.',
      'If you need to cancel, charges depend on when we receive your written notice and on costs already committed, such as permits and domestic flights.',
    ],
    link: { href: '/terms-and-conditions#section-1', label: 'Booking, payment & cancellation terms' },
  },
]

export default function SafetyPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Safety', path: '/safety' }])} />
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <section className="border-b border-border bg-gradient-to-br from-primary/15 via-accent/10 to-background py-10 md:py-14">
          <div className="container mx-auto max-w-4xl px-4 md:px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Your safety comes first</p>
            <h1 className="mt-4 font-serif text-4xl font-bold text-foreground text-balance md:text-5xl">Safety & trekking with confidence</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Trekking in the Himalayas means real altitude, remote trails and changing weather. Here is how we look after you, and what
              we ask of you, from your first enquiry to your last day on the trail.
            </p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto grid max-w-5xl gap-5 px-4 md:grid-cols-2 md:px-6">
            {SECTIONS.map(({ icon: Icon, title, points, link }) => (
              <article key={title} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                </div>
                <ul className="mt-4 flex-1 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                  {points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <Link href={link.href} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                  {link.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="pb-14">
          <div className="container mx-auto max-w-3xl px-4 text-center md:px-6">
            <div className="rounded-2xl bg-primary px-6 py-10 text-primary-foreground">
              <h2 className="font-serif text-2xl font-bold md:text-3xl">Questions about safety or fitness?</h2>
              <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
                Tell us about your experience and any health concerns. We’ll help you choose a trek that suits you.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-white/90">
                  Talk to us <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/plan-my-trek" className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
                  Plan my trek
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
