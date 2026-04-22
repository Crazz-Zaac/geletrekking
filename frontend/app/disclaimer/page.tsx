'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, AlertCircle, CalendarDays, Scale, Mail, ShieldAlert } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function DisclaimerPage() {
  const sections = [
    {
      id: 'altitude-and-acclimatization',
      title: 'Altitude and Acclimatization',
      content: 'High-altitude trekking poses significant risks including acute mountain sickness (AMS), high altitude cerebral edema (HACE), and high altitude pulmonary edema (HAPE). These conditions can be fatal. Proper acclimatization is essential but not guaranteed to prevent altitude sickness. Individual responses to altitude vary significantly and cannot be predicted.',
    },
    {
      id: 'weather-and-environmental-hazards',
      title: 'Weather and Environmental Hazards',
      content: 'Himalayan weather is unpredictable and can change rapidly. Snow, rain, lightning, avalanches, and extreme cold are common hazards. Participants may experience hypothermia, frostbite, and other weather-related injuries. We cannot guarantee protection from all weather-related incidents.',
    },
    {
      id: 'physical-exertion',
      title: 'Physical Exertion',
      content: 'Trekking involves strenuous physical activity. Participants may experience muscle soreness, joint pain, fatigue, and dehydration. People with cardiovascular conditions, respiratory issues, or joint problems face increased risks. Consult your doctor before participating.',
    },
    {
      id: 'medical-and-emergency-evacuation',
      title: 'Medical and Emergency Evacuation',
      content: 'Emergency medical facilities are limited in remote trekking areas. Medical evacuation by helicopter may be necessary but is not always possible due to weather or terrain. Helicopter evacuation is extremely expensive (often $3,000-$10,000). Medical evacuation insurance is mandatory.',
    },
    {
      id: 'accident-and-injury-risks',
      title: 'Accident and Injury Risks',
      content: 'Trekking trails can be steep, narrow, and dangerous. Slipping, falling, and other accidents can occur. Participants assume all risks associated with physical injuries. Gele Trekking and its staff are not liable for accidents or injuries.',
    },
    {
      id: 'wildlife-encounters',
      title: 'Wildlife Encounters',
      content: 'The Himalayan region is home to various wildlife including snow leopards, bears, and other animals. While encounters are rare, they can occur. Follow guide instructions regarding wildlife safety.',
    },
    {
      id: 'assumption-of-risk',
      title: 'Assumption of Risk',
      content: 'By participating in our treks, you acknowledge that you fully understand these risks and voluntarily assume all risks associated with high-altitude trekking. You agree not to hold Gele Trekking, its guides, or its staff responsible for any injuries, accidents, or deaths.',
    },
    {
      id: 'mandatory-insurance',
      title: 'Mandatory Insurance',
      content: 'Participants must have comprehensive travel and trekking insurance including medical evacuation coverage. Without proper insurance, you may be unable to afford emergency medical care. Insurance companies should be notified that you will be trekking at high altitude.',
    },
    {
      id: 'pre-trek-medical-consultation',
      title: 'Pre-Trek Medical Consultation',
      content: 'We strongly recommend consulting with a doctor experienced in high-altitude medicine before your trek. Disclose all medical conditions, medications, and concerns. Participants with serious medical conditions may be advised against trekking.',
    },
    {
      id: 'individual-responsibility',
      title: 'Individual Responsibility',
      content: 'Each participant is responsible for their own health and safety. Follow all guide instructions, listen to your body, and communicate any concerns immediately. Turn back if you feel unwell. Your safety is more important than reaching the summit.',
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-3">
              <motion.div variants={itemVariants}>
                <Badge className="mb-2 bg-primary/15 text-primary border-primary/30 hover:bg-primary/20">Legal Notice</Badge>
              </motion.div>
              <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-foreground text-balance">
                Health & Safety Disclaimer
              </motion.h1>
              <motion.p variants={itemVariants} className="text-muted-foreground max-w-4xl">
                This disclaimer explains trekking risks, participant responsibilities, and essential insurance obligations before joining any trip with Gele Trekking.
              </motion.p>

              <motion.div variants={itemVariants} className="pt-2 flex flex-wrap items-center gap-2.5 text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  Effective April 2026
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-muted-foreground">
                  <Scale className="h-4 w-4" />
                  10 risk sections
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="border-b border-border bg-background/70 lg:hidden">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl py-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  <span className="text-[11px] text-primary font-semibold">{String(index + 1).padStart(2, '0')}</span>
                  {section.title}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-10"
            >
              <motion.aside variants={itemVariants} className="hidden lg:block">
                <div className="sticky top-24 rounded-2xl border border-border bg-muted/40 p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Quick Navigation</h3>
                  <nav className="space-y-1.5">
                    {sections.map((section, index) => (
                      <a
                        key={`quick-${section.id}`}
                        href={`#${section.id}`}
                        className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-background hover:text-primary transition-colors"
                      >
                        <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary min-w-6">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="line-clamp-1">{section.title}</span>
                      </a>
                    ))}
                  </nav>

                  <div className="mt-5 rounded-xl border border-primary/25 bg-primary/10 p-3.5">
                    <p className="text-xs font-medium text-foreground">Need risk clarification?</p>
                    <a
                      href="mailto:info@geletrekking.com"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-90"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      info@geletrekking.com
                    </a>
                  </div>
                </div>
              </motion.aside>

              <div className="space-y-8">
                {/* Warning Box */}
                <motion.div
                  variants={itemVariants}
                  className="bg-orange-500/10 border border-orange-500/60 rounded-xl p-6 md:p-8"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-7 h-7 text-orange-500 flex-shrink-0" />
                      <h2 className="text-2xl font-bold text-orange-600">Important Notice</h2>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-orange-100/80 px-3 py-1 text-xs font-semibold text-orange-700 w-fit">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      High-Altitude Risk Disclosure
                    </div>
                  </div>
                  <p className="text-orange-700 mt-3">
                    Trekking in the Himalayas carries inherent risks. Please read this disclaimer carefully before booking.
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {sections.map((section, idx) => (
                    <article id={section.id} key={section.id} className="rounded-xl border border-border bg-card p-5 md:p-6 h-full shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-[11px] font-bold text-primary">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <h2 className="text-lg md:text-xl font-bold text-foreground">{section.title}</h2>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{section.content}</p>
                    </article>
                  ))}
                </motion.div>

                {/* Final Statement */}
                <motion.div
                  variants={itemVariants}
                  className="bg-primary/10 border border-primary/50 rounded-xl p-6 md:p-8 mt-8"
                >
                  <p className="text-muted-foreground italic">
                    By booking a trek with Gele Trekking, you acknowledge that you have read, understood, and fully agree to this disclaimer. You accept all risks associated with high-altitude trekking and absolve Gele Trekking from any liability.
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-xl border border-border bg-card p-5 md:p-6">
                  <h3 className="text-lg font-semibold text-foreground">Need clarification before booking?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Contact our team for risk and insurance guidance before confirming your trek.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href="/contact"
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
                    >
                      Contact Support
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <a
                      href="mailto:info@geletrekking.com"
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition"
                    >
                      <Mail className="h-4 w-4" />
                      info@geletrekking.com
                    </a>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
