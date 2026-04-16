import { Shield, Users, Leaf, Award, Clock, MapPin } from 'lucide-react'

const reasons = [
  {
    Icon: Shield,
    title: 'Safety First',
    description: 'NMA-certified guides trained in wilderness first aid and altitude sickness management. We carry emergency oxygen on every high-altitude trek.',
  },
  {
    Icon: Users,
    title: 'Expert Local Guides',
    description: 'Our experienced Sherpa and Nepali guides are born in the mountains — their knowledge, warmth, and passion make all the difference.',
  },
  {
    Icon: Leaf,
    title: 'Responsible Tourism',
    description: 'We follow Leave No Trace principles, support porter welfare standards, and reinvest in local community development projects.',
  },
  {
    Icon: Award,
    title: 'Licensed & Trusted',
    description: 'Registered with the Nepal Tourism Board, TAAN member, and fully insured. Over 500+ five-star reviews from trekkers worldwide.',
  },
  {
    Icon: Clock,
    title: 'Flexible Itineraries',
    description: 'Every trek can be customized to your schedule, fitness level, and interests. Private departures available on any date.',
  },
  {
    Icon: MapPin,
    title: 'All-Inclusive Service',
    description: 'From airport pickup to permits, accommodation, and guides — we handle every detail so you can focus on the mountains.',
  },
]

export function WhyUsSection() {
  return (
    <section className="py-14 md:py-16 bg-[oklch(0.95_0.01_220)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <p className="text-primary text-xs md:text-sm font-semibold uppercase tracking-widest mb-2.5">Why Choose Us</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">
            Trek With Confidence
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base text-pretty">
            With 15+ years of experience guiding international trekkers through the Himalayas, we deliver safe, memorable, and responsibly run adventures.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {reasons.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-3 bg-card p-5 rounded-2xl border border-border hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
