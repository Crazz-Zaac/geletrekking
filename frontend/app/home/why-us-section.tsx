import { Shield, Users, Leaf, Award, Clock, MapPin } from 'lucide-react'

const reasons = [
  {
    Icon: Shield,
    title: 'Safety Comes First',
    description:
      'Our licensed guides are trained in wilderness first aid and high-altitude safety. We carry emergency oxygen and prioritize your well-being on every trek.',
  },
  {
    Icon: Users,
    title: 'Local Expert Guides',
    description:
      'Led by experienced Sherpa and Nepali guides who know the mountains, culture, and trails deeply — making your journey safer and more meaningful.',
  },
  {
    Icon: Leaf,
    title: 'Responsible Trekking',
    description:
      'We follow responsible tourism practices, support fair porter treatment, and work closely with local communities across the Himalayas.',
  },
  {
    Icon: Award,
    title: 'Licensed & Reliable',
    description:
      'Officially registered with the Nepal Tourism Board and affiliated with TAAN, offering professional and dependable trekking experiences.',
  },
  {
    Icon: Clock,
    title: 'Flexible Adventures',
    description:
      'Choose from private or group treks with itineraries that can be adjusted to your pace, schedule, and experience level.',
  },
  {
    Icon: MapPin,
    title: 'Hassle-Free Experience',
    description:                                                                      
      'From permits and transport to accommodation and guides, we take care of the logistics so you can enjoy the journey.',
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
