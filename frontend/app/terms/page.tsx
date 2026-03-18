'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

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

const termsSections = [
  {
    title: 'Booking and Payment',
    content:
      'A booking is confirmed once we receive your deposit and written confirmation. The remaining balance is typically due before trek departure. Payment methods and due dates are shared clearly at the time of confirmation.',
  },
  {
    title: 'Cancellation and Refunds',
    content:
      'Cancellation charges may apply depending on timing and third-party commitments such as flights, permits, and accommodation. Some fees are non-refundable once issued by local authorities or suppliers.',
  },
  {
    title: 'Itinerary Changes',
    content:
      'Mountain travel is weather-dependent and operationally dynamic. We reserve the right to adjust routes, schedules, and logistics for safety, regulatory, or operational reasons without prior notice when necessary.',
  },
  {
    title: 'Client Responsibilities',
    content:
      'Participants are responsible for maintaining valid travel documents, obtaining required insurance, disclosing relevant medical conditions, and following guide instructions at all times during the trek.',
  },
  {
    title: 'Insurance Requirement',
    content:
      'Comprehensive travel insurance with high-altitude trekking and emergency evacuation coverage is mandatory. Clients must carry policy details and emergency contact information during the trip.',
  },
  {
    title: 'Limitation of Liability',
    content:
      'While we prioritize safety and quality, we are not liable for delays, losses, injuries, or disruptions caused by weather, natural events, political conditions, airline changes, or other circumstances beyond our control.',
  },
  {
    title: 'Media and Photos',
    content:
      'With your consent, non-sensitive photos from your trek may be used for promotional purposes. You may opt out by informing us in writing before or during your trip.',
  },
  {
    title: 'Acceptance of Terms',
    content:
      'By booking with us, you confirm that you have read, understood, and accepted these terms and conditions in full.',
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-foreground"
            >
              Terms & Conditions
            </motion.h1>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-8"
            >
              {termsSections.map((section) => (
                <motion.div key={section.title} variants={itemVariants} className="space-y-3">
                  <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
