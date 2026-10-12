'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSiteSettings } from '@/hooks/use-site-settings';
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
  HeartPulse,
  FileText,
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

const accentStyles = [
  {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    border: "border-blue-200",
    title: "text-blue-900",
    body: "text-blue-800/90",
    number: "text-blue-700",
  },
  {
    bg: "bg-amber-50",
    icon: "text-amber-600",
    border: "border-amber-200",
    title: "text-amber-900",
    body: "text-amber-800/90",
    number: "text-amber-700",
  },
  {
    bg: "bg-green-50",
    icon: "text-green-600",
    border: "border-green-200",
    title: "text-green-900",
    body: "text-green-800/90",
    number: "text-green-700",
  },
  {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    border: "border-purple-200",
    title: "text-purple-900",
    body: "text-purple-800/90",
    number: "text-purple-700",
  },
  {
    bg: "bg-red-50",
    icon: "text-red-600",
    border: "border-red-200",
    title: "text-red-900",
    body: "text-red-800/90",
    number: "text-red-700",
  },
  {
    bg: "bg-indigo-50",
    icon: "text-indigo-600",
    border: "border-indigo-200",
    title: "text-indigo-900",
    body: "text-indigo-800/90",
    number: "text-indigo-700",
  },
  {
    bg: "bg-cyan-50",
    icon: "text-cyan-600",
    border: "border-cyan-200",
    title: "text-cyan-900",
    body: "text-cyan-800/90",
    number: "text-cyan-700",
  },
  {
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
    border: "border-emerald-200",
    title: "text-emerald-900",
    body: "text-emerald-800/90",
    number: "text-emerald-700",
  },
];

const termsSections = [
  {
    id: 1,
    icon: CreditCard,
    title: "Booking, Payments, and Confirmation",
    content:
      "A booking is confirmed only after we receive the required deposit, completed booking details, and written confirmation from Gele Trekking. The balance, payment method, currency, bank charges, and due date will be shared before confirmation. Prices may be adjusted for requested itinerary changes, exchange-rate movement, government fee changes, or supplier cost changes before final payment.",
  },
  {
    id: 2,
    icon: RotateCcw,
    title: "Cancellation, Refunds, and Unused Services",
    content:
      "Cancellation charges depend on the date we receive written notice and any non-refundable commitments already made, including permits, domestic flights, hotels, guides, porters, vehicles, and accommodation. No refund is normally available for unused services after a trip has started, voluntary withdrawal, late arrival, early return, or services missed for reasons outside our control.",
  },
  {
    id: 3,
    icon: MapPin,
    title: "Itinerary Changes and Mountain Conditions",
    content:
      "Trekking in Nepal is affected by weather, trail conditions, landslides, snow, altitude, flight delays, road closures, local restrictions, and safety decisions. We may change routes, schedules, accommodation, transport, or services when reasonably necessary. Additional costs caused by delays, evacuation, rerouting, extra nights, or private arrangements are the client responsibility unless expressly included.",
  },
  {
    id: 4,
    icon: HeartPulse,
    title: "Fitness, Medical Disclosure, and Altitude Risk",
    content:
      "Clients must be physically prepared for the selected trek and must disclose medical conditions, medications, allergies, injuries, dietary restrictions, and prior altitude issues before departure. High-altitude trekking carries risks including acute mountain sickness, injury, illness, and emergency evacuation. Guides may require rest, descent, itinerary changes, or trip termination when safety requires it.",
  },
  {
    id: 5,
    icon: Shield,
    title: "Insurance and Emergency Evacuation",
    content:
      "Comprehensive travel insurance is mandatory and must cover trekking at the booked altitude, medical treatment, helicopter evacuation where applicable, trip cancellation, delays, baggage, and repatriation. Clients must carry policy details and emergency contacts. Gele Trekking can assist with rescue coordination, but insurers and clients remain responsible for approvals, guarantees, and payment.",
  },
  {
    id: 6,
    icon: FileText,
    title: "Passports, Visas, Permits, and Local Rules",
    content:
      "Clients are responsible for valid passports, visas, entry requirements, and accurate personal information needed for permits and bookings. Trekking permits are subject to government rules and may be non-refundable once issued. Clients must follow Nepalese law, conservation-area rules, cultural norms, guide instructions, and restrictions set by local authorities or communities.",
  },
  {
    id: 7,
    icon: User,
    title: "Client Conduct, Equipment, and Porter Welfare",
    content:
      "Clients must act respectfully toward guides, porters, local communities, other travelers, wildlife, and the environment. Required clothing, footwear, medication, and personal equipment must be suitable for the itinerary. We may refuse participation or remove a client from a trip for unsafe, abusive, illegal, intoxicated, or disruptive behavior, with no refund for affected services.",
  },
  {
    id: 8,
    icon: AlertCircle,
    title: "Third-Party Services and Liability Limits",
    content:
      "Some services are provided by independent suppliers such as airlines, hotels, lodges, vehicle operators, restaurants, permit offices, and rescue providers. We choose suppliers carefully, but we are not liable for losses, injury, delay, extra expense, or disruption caused by supplier failure, weather, natural events, political conditions, illness, force majeure, or events beyond reasonable control.",
  },
  {
    id: 9,
    icon: Camera,
    title: "Privacy, Media, and Marketing Consent",
    content:
      "We collect booking, identity, health, insurance, and emergency-contact information needed to operate trips safely and meet legal or supplier requirements. Photos and videos are used for marketing only with consent where required, and you may ask us in writing not to use identifiable images. Personal data is handled according to our Privacy Policy.",
  },
  {
    id: 10,
    icon: CheckCircle,
    title: "Complaints, Governing Terms, and Acceptance",
    content:
      "Please raise concerns with your guide or our office as soon as possible so we can try to resolve them during the trip. Formal complaints should be sent in writing after the trip. By booking, paying a deposit, or joining a trek, you confirm that you have read, understood, and accepted these terms and conditions in full.",
  },
].map((section, index) => ({
  ...section,
  accent: accentStyles[index % accentStyles.length],
}));

export default function TermsPage() {
  const { settings } = useSiteSettings();
  const contactEmail = settings.email.trim();

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
                Clear trekking terms help every guest understand bookings, safety responsibilities, mountain risks, insurance, and the decisions needed to run a responsible Himalayan journey.
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
                  Version 1.1
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
                    {contactEmail ? (
                      <a
                        href={`mailto:${contactEmail}`}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {contactEmail}
                      </a>
                    ) : (
                      <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                        <Mail className="h-3.5 w-3.5" />
                        Contact email not configured
                      </span>
                    )}
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
                      By booking with Gele Trekking, you confirm that you have read, understood, and accepted these terms and conditions in full. These terms are intended to set clear responsibilities for a safe and professionally operated trekking experience.
                    </p>
                    <p className="text-orange-800 text-sm">
                      If you have any questions or concerns about these terms, please contact us at{' '}
                      {contactEmail ? (
                        <a href={`mailto:${contactEmail}`} className="font-semibold text-orange-600 hover:text-orange-700">
                          {contactEmail}
                        </a>
                      ) : (
                        <span className="font-semibold text-orange-600">Contact email not configured</span>
                      )}
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

