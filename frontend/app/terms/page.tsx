'use client';

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
  CheckCircle 
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
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 md:py-32 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border/50 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -ml-48 -mb-48" />
          </div>

          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="max-w-2xl"
            >
              <motion.div variants={itemVariants}>
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                  Legal Agreement
                </Badge>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight"
              >
                Terms & Conditions
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-lg text-muted-foreground"
              >
                Our commitment to transparency and clear communication. Please review these terms before booking your adventure with us.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border/30 py-6">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <p className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Quick Navigation
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {termsSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#section-${section.id}`}
                    className="group relative px-3 py-2 text-xs md:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-300 rounded-lg hover:bg-muted/60 border border-transparent hover:border-border/50"
                  >
                    <span className="block text-center leading-tight">
                      <span className="block text-primary font-bold group-hover:scale-110 transition-transform">{section.id}</span>
                      <span className="block truncate">{section.title.split(' ')[0]}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Terms Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl"
            >
              {termsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.id}
                    id={`section-${section.id}`}
                    variants={itemVariants}
                  >
                    <Card className={`relative h-full border-border/50 bg-gradient-to-br ${section.color} backdrop-blur-sm hover:shadow-lg transition-all duration-300 overflow-hidden group`}>
                      {/* Card Background Accent */}
                      <div className="absolute -right-16 -top-16 w-32 h-32 bg-gradient-to-br from-white/10 to-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                      <div className="relative p-6 md:p-8">
                        {/* Icon Badge */}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-white/10 backdrop-blur border border-white/20 group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-7 h-7 ${section.iconColor}`} />
                        </div>

                        {/* Section Number */}
                        <div className="absolute top-6 right-6 text-sm font-bold text-muted-foreground/50">
                          {String(section.id).padStart(2, '0')}
                        </div>

                        {/* Content */}
                        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 pr-8">
                          {section.title}
                        </h2>

                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                          {section.content}
                        </p>

                        {/* Decorative Bottom Border */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="py-14 md:py-20 bg-gradient-to-b from-background via-orange-500/5 to-background">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-8"
            >
              <motion.div
                variants={itemVariants}
                className="bg-orange-500/10 border border-orange-500/60 rounded-xl p-6 md:p-8 flex gap-4"
              >
                <AlertCircle className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-orange-600 mb-2">Important Notice</h2>
                  <p className="text-orange-700">
                    By booking with us, you confirm that you have read, understood, and accepted these terms and conditions in full. These terms constitute a legally binding agreement.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
