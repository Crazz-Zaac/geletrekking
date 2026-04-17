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
  ArrowRight 
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
    color: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-600',
  },
  {
    id: 2,
    icon: RotateCcw,
    title: 'Cancellation and Refunds',
    content:
      'Cancellation charges may apply depending on timing and third-party commitments such as flights, permits, and accommodation. Some fees are non-refundable once issued by local authorities or suppliers.',
    color: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-600',
  },
  {
    id: 3,
    icon: MapPin,
    title: 'Itinerary Changes',
    content:
      'Mountain travel is weather-dependent and operationally dynamic. We reserve the right to adjust routes, schedules, and logistics for safety, regulatory, or operational reasons without prior notice when necessary.',
    color: 'from-green-500/20 to-emerald-500/20',
    iconColor: 'text-green-600',
  },
  {
    id: 4,
    icon: User,
    title: 'Client Responsibilities',
    content:
      'Participants are responsible for maintaining valid travel documents, obtaining required insurance, disclosing relevant medical conditions, and following guide instructions at all times during the trek.',
    color: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-600',
  },
  {
    id: 5,
    icon: Shield,
    title: 'Insurance Requirement',
    content:
      'Comprehensive travel insurance with high-altitude trekking and emergency evacuation coverage is mandatory. Clients must carry policy details and emergency contact information during the trip.',
    color: 'from-red-500/20 to-rose-500/20',
    iconColor: 'text-red-600',
  },
  {
    id: 6,
    icon: AlertCircle,
    title: 'Limitation of Liability',
    content:
      'While we prioritize safety and quality, we are not liable for delays, losses, injuries, or disruptions caused by weather, natural events, political conditions, airline changes, or other circumstances beyond our control.',
    color: 'from-indigo-500/20 to-violet-500/20',
    iconColor: 'text-indigo-600',
  },
  {
    id: 7,
    icon: Camera,
    title: 'Media and Photos',
    content:
      'With your consent, non-sensitive photos from your trek may be used for promotional purposes. You may opt out by informing us in writing before or during your trip.',
    color: 'from-cyan-500/20 to-blue-500/20',
    iconColor: 'text-cyan-600',
  },
  {
    id: 8,
    icon: CheckCircle,
    title: 'Acceptance of Terms',
    content:
      'By booking with us, you confirm that you have read, understood, and accepted these terms and conditions in full.',
    color: 'from-teal-500/20 to-green-500/20',
    iconColor: 'text-teal-600',
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
            </motion.div>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="border-b border-slate-200 bg-white">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="py-12 md:py-16">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">In This Document</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {termsSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#section-${section.id}`}
                    className="group flex items-center gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors duration-200 border border-slate-100 hover:border-blue-200"
                  >
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                        {section.id}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {section.title}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {termsSections.map((section) => {
                const Icon = section.icon;
                const colorMap: Record<number, { bg: string; icon: string; text: string }> = {
                  1: { bg: 'bg-blue-100', icon: 'text-blue-600', text: 'text-blue-900' },
                  2: { bg: 'bg-amber-100', icon: 'text-amber-600', text: 'text-amber-900' },
                  3: { bg: 'bg-green-100', icon: 'text-green-600', text: 'text-green-900' },
                  4: { bg: 'bg-purple-100', icon: 'text-purple-600', text: 'text-purple-900' },
                  5: { bg: 'bg-red-100', icon: 'text-red-600', text: 'text-red-900' },
                  6: { bg: 'bg-indigo-100', icon: 'text-indigo-600', text: 'text-indigo-900' },
                  7: { bg: 'bg-cyan-100', icon: 'text-cyan-600', text: 'text-cyan-900' },
                  8: { bg: 'bg-emerald-100', icon: 'text-emerald-600', text: 'text-emerald-900' },
                };
                
                const colors = colorMap[section.id] || colorMap[1];
                
                return (
                  <motion.div
                    key={section.id}
                    id={`section-${section.id}`}
                    variants={itemVariants}
                  >
                    <div className={`${colors.bg} rounded-2xl p-6 md:p-8 h-full flex flex-col`}>
                      {/* Icon */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg ${colors.icon} bg-white/40 flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${colors.icon}`} />
                        </div>
                        <span className="text-sm font-bold text-slate-600">
                          {String(section.id).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className={`text-xl md:text-2xl font-bold ${colors.text} mb-3`}>
                        {section.title}
                      </h3>

                      {/* Content */}
                      <p className={`text-sm md:text-base ${colors.text} leading-relaxed opacity-85`}>
                        {section.content}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
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
              className="max-w-5xl"
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

