'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useSiteSettings } from '@/hooks/use-site-settings';
import {
  CalendarDays,
  Scale,
  Mail,
  ShieldCheck,
  Lock,
  Database,
  UserRound,
  Globe,
  ArrowRight,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const getPolicySections = (contactEmail: string) => [
  {
    id: 'who-we-are',
    title: '1) Who We Are (Data Controller)',
    content:
      `Gele Trekking is the data controller for personal data submitted through our website inquiry forms. If you have privacy questions, contact us at ${contactEmail}.`,
    icon: ShieldCheck,
  },
  {
    id: 'scope',
    title: '2) Scope of This Policy',
    content:
      'This policy applies to data submitted through the Booking Inquiry Form and Contact Form on our website. These forms are used only to receive and respond to trek-related inquiries.',
    icon: Scale,
  },
  {
    id: 'what-we-collect',
    title: '3) Personal Data We Collect',
    content:
      'From inquiry forms, we collect only: Name, Email address, and Message content. We do not request payment data or sensitive personal health data through these forms.',
    icon: UserRound,
  },
  {
    id: 'how-we-use',
    title: '4) Purpose and Legal Basis (GDPR)',
    content:
      'We process inquiry data solely to reply to your request and provide pre-booking information. GDPR legal bases: Article 6(1)(b) (steps at your request before a contract) and Article 6(1)(f) (legitimate interest in customer communication).',
    icon: Database,
  },
  {
    id: 'storage',
    title: '5) Storage and Marketing Statement',
    content:
      'We do not store inquiry form submissions in our website database for profiling or marketing. Form submissions are delivered to our Gmail inbox so we can respond. We do not use these submissions for newsletters, promotional campaigns, or third-party marketing lists.',
    icon: Lock,
  },
  {
    id: 'retention',
    title: '6) Retention',
    content:
      'Inquiry emails are kept only as long as reasonably necessary to handle your request, provide follow-up clarification, and maintain basic business records. We regularly review and remove inquiry emails that are no longer needed.',
    icon: CalendarDays,
  },
  {
    id: 'processors-transfers',
    title: '7) Processors and International Transfers',
    content:
      'We use service providers (such as email hosting and website infrastructure providers) to operate our services. Where data is processed outside the EEA/UK, we rely on appropriate safeguards under GDPR, such as contractual safeguards provided by those services.',
    icon: Globe,
  },
  {
    id: 'security',
    title: '8) Security Measures',
    content:
      'We apply reasonable technical and organizational measures to protect inquiry data, including transport security, access controls, and anti-abuse protections (e.g., captcha and rate-limiting) on forms.',
    icon: ShieldCheck,
  },
  {
    id: 'gdpr-rights',
    title: '9) Your GDPR Rights',
    content:
      'If GDPR applies to you, you have the right to access, rectify, erase, restrict, object, and request portability of your personal data (where applicable). You may also lodge a complaint with your local supervisory authority.',
    icon: Scale,
  },
  {
    id: 'contact-us',
    title: '10) Contact and Updates',
    content:
      `To exercise privacy rights or ask questions, email ${contactEmail} with the subject “Privacy Request”. We may update this policy from time to time; updated versions will be posted on this page with a revised effective date.`,
    icon: Mail,
  },
];

export default function PrivacyPolicyPage() {
  const { settings } = useSiteSettings();
  const contactEmail = settings.email.trim();
  const policySections = getPolicySections(contactEmail);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-3 max-w-4xl">
              <motion.div variants={itemVariants}>
                <Badge className="mb-2 bg-primary/15 text-primary border-primary/30 hover:bg-primary/20">Privacy Policy</Badge>
              </motion.div>
              <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-foreground text-balance">
                Privacy Policy (GDPR)
              </motion.h1>
              <motion.p variants={itemVariants} className="text-muted-foreground max-w-3xl">
                This policy explains how Gele Trekking handles personal data submitted through our inquiry forms, in line with EU GDPR principles of lawfulness, transparency, and data minimization.
              </motion.p>

              <motion.div variants={itemVariants} className="pt-2 flex flex-wrap items-center gap-2.5 text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  Effective April 2026
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-muted-foreground">
                  <Scale className="h-4 w-4" />
                  GDPR-aligned inquiry handling
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

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
                    {policySections.map((section) => (
                      <a
                        key={`quick-${section.id}`}
                        href={`#${section.id}`}
                        className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-background hover:text-primary transition-colors"
                      >
                        <span className="line-clamp-1">{section.title}</span>
                      </a>
                    ))}
                  </nav>
                  <div className="mt-5 rounded-xl border border-primary/25 bg-primary/10 p-3.5">
                    <p className="text-xs font-medium text-foreground">Privacy contact</p>
                    {contactEmail ? (
                      <a
                        href={`mailto:${contactEmail}`}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-90"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {contactEmail}
                      </a>
                    ) : (
                      <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        Contact email not configured
                      </span>
                    )}
                  </div>
                </div>
              </motion.aside>

              <div className="space-y-5 md:space-y-6">
                {policySections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <motion.div key={section.id} variants={itemVariants} id={section.id} className="scroll-mt-28">
                      <Card className="border-border bg-card p-5 md:p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <div className="space-y-2">
                            <h2 className="text-lg md:text-xl font-bold text-foreground">{section.title}</h2>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{section.content}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}

                <motion.div variants={itemVariants}>
                  <Card className="border-border bg-primary/10 p-6 md:p-7">
                    <h3 className="text-lg font-semibold text-foreground">Summary</h3>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <li>• Inquiry forms are only for receiving and answering user inquiries.</li>
                      <li>• We collect only name, email, and message from these forms.</li>
                      <li>• Data is received in Gmail for response handling.</li>
                      <li>• We do not use inquiry data for marketing purposes.</li>
                    </ul>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <a
                        href="/contact"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
                      >
                        Contact Us
                        <ArrowRight className="h-4 w-4" />
                      </a>
                      {contactEmail ? (
                        <a
                          href={`mailto:${contactEmail}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition"
                        >
                          <Mail className="h-4 w-4" />
                          {contactEmail}
                        </a>
                      ) : null}
                    </div>
                  </Card>
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
