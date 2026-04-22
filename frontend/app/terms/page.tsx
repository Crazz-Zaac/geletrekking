'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  RotateCcw, 
  MapPin, 
  User, 
  Shield, 
  AlertCircle, 
  Camera, 
  CheckCircle,
  ArrowRight,
  CalendarDays,
  Scale,
  ChevronRight,
  Mail,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const termsSections = [
  {
    id: 1,
    icon: CreditCard,
    title: 'Booking and Payment',
    content:
      'A booking is confirmed once we receive your deposit and written confirmation. The remaining balance is typically due before trek departure. Payment methods and due dates are shared clearly at the time of confirmation.',
    accent: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      border: 'border-blue-200',
      title: 'text-blue-900',
      body: 'text-blue-800/90',
      number: 'text-blue-700',
    },
  },
  {
    id: 2,
    icon: RotateCcw,
    title: 'Cancellation and Refunds',
    content:
      'Cancellation charges may apply depending on timing and third-party commitments such as flights, permits, and accommodation. Some fees are non-refundable once issued by local authorities or suppliers.',
    accent: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      border: 'border-amber-200',
      title: 'text-amber-900',
      body: 'text-amber-800/90',
      number: 'text-amber-700',
    },
  },
  {
    id: 3,
    icon: MapPin,
    title: 'Itinerary Changes',
    content:
      'Mountain travel is weather-dependent and operationally dynamic. We reserve the right to adjust routes, schedules, and logistics for safety, regulatory, or operational reasons without prior notice when necessary.',
    accent: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      border: 'border-green-200',
      title: 'text-green-900',
      body: 'text-green-800/90',
      number: 'text-green-700',
    },
  },
  {
    id: 4,
    icon: User,
    title: 'Client Responsibilities',
    content:
      'Participants are responsible for maintaining valid travel documents, obtaining required insurance, disclosing relevant medical conditions, and following guide instructions at all times during the trek.',
    accent: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      border: 'border-purple-200',
      title: 'text-purple-900',
      body: 'text-purple-800/90',
      number: 'text-purple-700',
    },
  },
  {
    id: 5,
    icon: Shield,
    title: 'Insurance Requirement',
    content:
      'Comprehensive travel insurance with high-altitude trekking and emergency evacuation coverage is mandatory. Clients must carry policy details and emergency contact information during the trip.',
    accent: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      border: 'border-red-200',
      title: 'text-red-900',
      body: 'text-red-800/90',
      number: 'text-red-700',
    },
  },
  {
    id: 6,
    icon: AlertCircle,
    title: 'Limitation of Liability',
    content:
      'While we prioritize safety and quality, we are not liable for delays, losses, injuries, or disruptions caused by weather, natural events, political conditions, airline changes, or other circumstances beyond our control.',
    accent: {
      bg: 'bg-indigo-50',
      icon: 'text-indigo-600',
      border: 'border-indigo-200',
      title: 'text-indigo-900',
      body: 'text-indigo-800/90',
      number: 'text-indigo-700',
    },
  },
  {
    id: 7,
    icon: Camera,
    title: 'Media and Photos',
    content:
      'With your consent, non-sensitive photos from your trek may be used for promotional purposes. You may opt out by informing us in writing before or during your trip.',
    accent: {
      bg: 'bg-cyan-50',
      icon: 'text-cyan-600',
      border: 'border-cyan-200',
      title: 'text-cyan-900',
      body: 'text-cyan-800/90',
      number: 'text-cyan-700',
    },
  },
  {
    id: 8,
    icon: CheckCircle,
    title: 'Acceptance of Terms',
    content:
      'By booking with us, you confirm that you have read, understood, and accepted these terms and conditions in full.',
    accent: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      border: 'border-emerald-200',
      title: 'text-emerald-900',
      body: 'text-emerald-800/90',
      number: 'text-emerald-700',
    },
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 md:pt-36 md:pb-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-0 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-slate-100/50 rounded-full blur-3xl" />
          </div>

          <div className="container relative z-10 mx-auto px-4 md:px-6 max-w-5xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="max-w-3xl"
            >
              <motion.div variants={itemVariants}>
                <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 font-semibold">
                  Terms & Conditions
                </Badge>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight"
              >
                Your Journey, Our Commitment
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-slate-600 leading-relaxed"
              >
                We believe in transparency and clear communication. These terms ensure both you and our team are aligned for an exceptional trekking experience.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="mt-7 flex flex-wrap items-center gap-3 text-sm"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  Effective: April 2026
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700">
                  <Scale className="h-4 w-4 text-slate-500" />
                  Version 1.0
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-10"
            >
              <motion.aside variants={itemVariants} className="hidden lg:block">
                <div className="sticky top-24 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Navigation</h3>
                  <nav className="space-y-1.5">
                    {termsSections.map((section) => (
                      <a
                        key={`quick-${section.id}`}
                        href={`#section-${section.id}`}
                        className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-600 hover:bg-white hover:text-blue-700 transition-colors"
                      >
                        <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600 min-w-6">
                          {String(section.id).padStart(2, '0')}
                        </span>
                        <span className="line-clamp-1">{section.title}</span>
                      </a>
                    ))}
                  </nav>
                  <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-3.5">
                    <p className="text-xs font-medium text-blue-800">Need legal clarification?</p>
                    <a
                      href="mailto:info@geletrekking.com"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      info@geletrekking.com
                    </a>
                  </div>
                </div>
              </motion.aside>

              <div className="space-y-5 md:space-y-6">
                {termsSections.map((section) => {
                  const Icon = section.icon;

                  return (
                    <motion.div
                      key={section.id}
                      id={`section-${section.id}`}
                      variants={itemVariants}
                    >
                      <Card className={`${section.accent.bg} ${section.accent.border} rounded-2xl p-6 md:p-8 border shadow-sm`}>
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-lg ${section.accent.icon} bg-white/75 flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-5 h-5 ${section.accent.icon}`} />
                            </div>
                            <h3 className={`text-lg md:text-xl font-bold ${section.accent.title} leading-tight`}>
                              {section.title}
                            </h3>
                          </div>
                          <span className={`text-sm font-bold ${section.accent.number} flex-shrink-0`}>
                            {String(section.id).padStart(2, '0')}
                          </span>
                        </div>

                        <p className={`text-sm md:text-base leading-relaxed ${section.accent.body}`}>
                          {section.content}
                        </p>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="py-16 md:py-20 bg-white border-t border-slate-200">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="max-w-6xl mx-auto"
            >
              <motion.div
                variants={itemVariants}
                className="bg-orange-50 border border-orange-200 rounded-xl p-8 md:p-10"
              >
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Important Notice</h2>
                    <p className="text-orange-900 text-base leading-relaxed mb-4">
                      By booking with Gele Trekking, you confirm that you have read, understood, and accepted these terms and conditions in full. These terms constitute a legally binding agreement between you and our organization.
                    </p>
                    <p className="text-orange-800 text-sm">
                      If you have any questions or concerns about these terms, please contact us at{' '}
                      <a href="mailto:info@geletrekking.com" className="font-semibold text-orange-600 hover:text-orange-700">
                        info@geletrekking.com
                      </a>
                      {' '}before proceeding with your booking.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="max-w-5xl text-center mx-auto"
            >
              <motion.h2
                variants={itemVariants}
                className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
              >
                Questions About Our Terms?
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-slate-600 text-lg mb-8"
              >
                Our team is here to help clarify anything before you book your adventure.
              </motion.p>
              <motion.div variants={itemVariants}>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Get in Touch
                  <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

