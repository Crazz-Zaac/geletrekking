'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AlertCircle } from 'lucide-react';

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
      title: 'Altitude and Acclimatization',
      content: 'High-altitude trekking poses significant risks including acute mountain sickness (AMS), high altitude cerebral edema (HACE), and high altitude pulmonary edema (HAPE). These conditions can be fatal. Proper acclimatization is essential but not guaranteed to prevent altitude sickness. Individual responses to altitude vary significantly and cannot be predicted.',
    },
    {
      title: 'Weather and Environmental Hazards',
      content: 'Himalayan weather is unpredictable and can change rapidly. Snow, rain, lightning, avalanches, and extreme cold are common hazards. Participants may experience hypothermia, frostbite, and other weather-related injuries. We cannot guarantee protection from all weather-related incidents.',
    },
    {
      title: 'Physical Exertion',
      content: 'Trekking involves strenuous physical activity. Participants may experience muscle soreness, joint pain, fatigue, and dehydration. People with cardiovascular conditions, respiratory issues, or joint problems face increased risks. Consult your doctor before participating.',
    },
    {
      title: 'Medical and Emergency Evacuation',
      content: 'Emergency medical facilities are limited in remote trekking areas. Medical evacuation by helicopter may be necessary but is not always possible due to weather or terrain. Helicopter evacuation is extremely expensive (often $3,000-$10,000). Medical evacuation insurance is mandatory.',
    },
    {
      title: 'Accident and Injury Risks',
      content: 'Trekking trails can be steep, narrow, and dangerous. Slipping, falling, and other accidents can occur. Participants assume all risks associated with physical injuries. Gele Trekking and its staff are not liable for accidents or injuries.',
    },
    {
      title: 'Wildlife Encounters',
      content: 'The Himalayan region is home to various wildlife including snow leopards, bears, and other animals. While encounters are rare, they can occur. Follow guide instructions regarding wildlife safety.',
    },
    {
      title: 'Assumption of Risk',
      content: 'By participating in our treks, you acknowledge that you fully understand these risks and voluntarily assume all risks associated with high-altitude trekking. You agree not to hold Gele Trekking, its guides, or its staff responsible for any injuries, accidents, or deaths.',
    },
    {
      title: 'Mandatory Insurance',
      content: 'Participants must have comprehensive travel and trekking insurance including medical evacuation coverage. Without proper insurance, you may be unable to afford emergency medical care. Insurance companies should be notified that you will be trekking at high altitude.',
    },
    {
      title: 'Pre-Trek Medical Consultation',
      content: 'We strongly recommend consulting with a doctor experienced in high-altitude medicine before your trek. Disclose all medical conditions, medications, and concerns. Participants with serious medical conditions may be advised against trekking.',
    },
    {
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
              <motion.p variants={itemVariants} className="text-xs md:text-sm font-semibold uppercase tracking-widest text-primary">
                Legal Notice
              </motion.p>
              <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-foreground text-balance">
                Health & Safety Disclaimer
              </motion.h1>
              <motion.p variants={itemVariants} className="text-muted-foreground max-w-4xl">
                This disclaimer explains trekking risks, participant responsibilities, and essential insurance obligations before joining any trip with Gele Trekking.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-8"
            >
              {/* Warning Box */}
              <motion.div
                variants={itemVariants}
                className="bg-orange-500/10 border border-orange-500/60 rounded-xl p-6 md:p-8 flex gap-4"
              >
                <AlertCircle className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-orange-600 mb-2">Important Notice</h2>
                  <p className="text-orange-700">
                    Trekking in the Himalayas carries inherent risks. Please read this disclaimer carefully before booking.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {sections.map((section, idx) => (
                  <article key={idx} className="rounded-xl border border-border bg-card p-5 md:p-6 h-full">
                    <h2 className="text-lg md:text-xl font-bold text-foreground mb-2">{section.title}</h2>
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
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
