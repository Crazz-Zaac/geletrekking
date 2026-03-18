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
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-foreground"
            >
              Health & Safety Disclaimer
            </motion.h1>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-8"
            >
              {/* Warning Box */}
              <motion.div
                variants={itemVariants}
                className="bg-orange-500/10 border border-orange-500 rounded-lg p-6 md:p-8 flex gap-4"
              >
                <AlertCircle className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-orange-600 mb-2">Important Notice</h2>
                  <p className="text-orange-700">
                    Trekking in the Himalayas carries inherent risks. Please read this disclaimer carefully before booking.
                  </p>
                </div>
              </motion.div>

              {[
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
                  content: 'Trekking trails can be steep, narrow, and dangerous. Slipping, falling, and other accidents can occur. Participants assume all risks associated with physical injuries. Himalayan Treks and its staff are not liable for accidents or injuries.',
                },
                {
                  title: 'Wildlife Encounters',
                  content: 'The Himalayan region is home to various wildlife including snow leopards, bears, and other animals. While encounters are rare, they can occur. Follow guide instructions regarding wildlife safety.',
                },
                {
                  title: 'Assumption of Risk',
                  content: 'By participating in our treks, you acknowledge that you fully understand these risks and voluntarily assume all risks associated with high-altitude trekking. You agree not to hold Himalayan Treks, its guides, or its staff responsible for any injuries, accidents, or deaths.',
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
              ].map((section, idx) => (
                <motion.div key={idx} variants={itemVariants} className="space-y-3">
                  <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                </motion.div>
              ))}

              {/* Final Statement */}
              <motion.div
                variants={itemVariants}
                className="bg-primary/10 border border-primary rounded-lg p-6 md:p-8 mt-8"
              >
                <p className="text-muted-foreground italic">
                  By booking a trek with Himalayan Treks, you acknowledge that you have read, understood, and fully agree to this disclaimer. You accept all risks associated with high-altitude trekking and absolve Himalayan Treks from any liability.
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
