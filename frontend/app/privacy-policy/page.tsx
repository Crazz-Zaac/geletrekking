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
      `Gele Trekking is the data controller for personal data submitted through this website. If you have privacy questions, contact us at ${contactEmail}.`,
    icon: ShieldCheck,
  },
  {
    id: 'scope',
    title: '2) Scope of This Policy',
    content:
      'This policy applies to data submitted through our Contact Form, Booking Inquiry Form, public Pre-booking Form, and the private Booking Form we send you once your trek is confirmed.',
    icon: Scale,
  },
  {
    id: 'what-we-collect',
    title: '3) Personal Data We Collect',
    content:
      'Contact and inquiry forms: name, email address, phone number if you give one, and your message and trek preferences. Pre-booking Form: your name, contact details, date of birth, gender, nationality, trek and flight details, and optionally your passport number and expiry date. Private Booking Form, used only after confirmation: passport and travel details, health and fitness information including medical conditions and medications, travel insurance details, emergency contact, preferences and your typed signature. We do not ask for card numbers through these forms.',
    icon: UserRound,
  },
  {
    id: 'how-we-use',
    title: '4) Purpose and Legal Basis (GDPR)',
    content:
      'We use inquiry data to reply to you, and booking data to arrange your trek, obtain permits, and keep you safe in the mountains. GDPR legal bases: Article 6(1)(b) (steps at your request before a contract, and performing that contract) and Article 6(1)(f) (legitimate interest in customer communication). Health information is processed on the basis of your explicit consent under Article 9(2)(a), given by ticking the health consent box on the Private Booking Form. You can withdraw it at any time by contacting us, although we may then be unable to operate your trek safely.',
    icon: Database,
  },
  {
    id: 'storage',
    title: '5) Where Your Data Is Stored',
    content:
      'Form submissions are stored on our server in Germany. Booking Form and Pre-booking Form submissions stay on that server: their answers are not sent by email and are not included in our backups. Contact and inquiry messages are also delivered to our staff email inbox so we can reply. We send you a short confirmation email that does not repeat what you submitted. When you submit a booking form, a PDF copy is saved to your own device. We do not use any of this data for marketing or share it for third-party marketing.',
    icon: Lock,
  },
  {
    id: 'retention',
    title: '6) Retention',
    content:
      'Booking form answers and the PDF of your form are deleted automatically 12 months after your trek ends, or 18 months after you submitted them if there is no trek end date. After that we keep only your name, contact details, trek and dates as a basic business record. You can ask us to delete your booking data earlier at any time, unless we still need it to operate your trek or meet a legal obligation. Inquiry messages are kept only as long as reasonably necessary and are reviewed regularly.',
    icon: CalendarDays,
  },
  {
    id: 'processors-transfers',
    title: '7) Backups, Processors and International Transfers',
    content:
      'Encrypted backups of our website content and inquiry messages are stored in Google Drive and kept for up to 12 months. Backups made before 9 November 2026 may still contain booking form data until they expire, no later than November 2027. We use service providers for email, website hosting and spam protection. Our team is based in Nepal and accesses your data from there in order to arrange your trek. Where data is processed outside the EEA/UK, we rely on appropriate safeguards under GDPR or, where applicable, on the necessity of the transfer to perform your booking.',
    icon: Globe,
  },
  {
    id: 'cookies',
    title: 'Cookies, Local Storage & External Content',
    content:
      'Strictly necessary storage is always on: it protects forms against spam and bots (Cloudflare), keeps administrators signed in, remembers dismissed notices and blog posts you have liked, and stores your cookie choice. We do not use advertising or analytics cookies. Optional third-party content (Google Maps on the Contact page and YouTube videos in blog posts) stays off until you allow Maps & videos; these providers may then receive your IP address and set their own cookies, and their own privacy policies apply. The Google reviews on our homepage are fetched and stored by our own server (via Featurable) and shown as part of our page, including reviewer photos, so your browser does not contact Google or Featurable to display them. You can accept all, reject all, or customise your choice in the cookie banner, and change your choice at any time through Cookie settings at the bottom of every page. Your choice is stored in this browser for up to 6 months, after which we ask again. Withdrawing permission reloads the page to remove content that was already loaded. Links to WhatsApp, Cal.com, Google and Trustpilot open those services only when you choose to visit them. If you request our free packing list, we store your email address (and first name, if given) to provide it; we send you trek tips and offers only if you tick the separate opt-in box, and you can ask us at any time to delete your details.',
    icon: Lock,
  },
  {
    id: 'security',
    title: '8) Security Measures',
    content:
      'We apply reasonable technical and organizational measures to protect your data, including transport security, access controls, and anti-abuse protections (e.g., captcha and rate-limiting) on forms.',
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
                This policy explains how Gele Trekking handles personal data submitted through our website forms, in line with EU GDPR principles of lawfulness, transparency, and data minimization.
              </motion.p>

              <motion.div variants={itemVariants} className="pt-2 flex flex-wrap items-center gap-2.5 text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  Effective November 2026
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-muted-foreground">
                  <Scale className="h-4 w-4" />
                  GDPR-aligned data handling
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
                      <li>• Your data is stored on our server in Germany and is never used for marketing.</li>
                      <li>• Passport and health details are requested only once your trek is confirmed.</li>
                      <li>• Booking form answers are deleted 12 months after your trek and are not in our backups.</li>
                      <li>• You can ask us to delete your data earlier at any time.</li>
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
