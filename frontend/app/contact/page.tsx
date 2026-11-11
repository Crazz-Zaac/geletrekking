'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ConsentGate } from '@/components/cookie-consent';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Phone, CalendarDays, MapPin, Clock3, MessageCircle, ShieldCheck, Loader2, ArrowUpRight } from 'lucide-react';
import { WhatsAppIcon } from '@/components/whatsapp-icon';
import { FacebookIcon, InstagramIcon, YouTubeIcon, LinkedInIcon } from '@/components/social-icons';
import { TurnstileWidget } from '@/components/turnstile-widget';
import { submitContactMessage } from '@/lib/api';
import { GELE_CALL_URL, getContactLinks } from '@/lib/contact-links';
import { CopyButton } from '@/components/copy-button';
import { useSiteSettings } from '@/hooks/use-site-settings';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ContactPage() {
  const { settings, social } = useSiteSettings();
  const contactEmail = settings.email.trim();
  const heroImageUrl = settings.contactHeroImageUrl.trim();
  const officeHoursWeekdays = settings.officeHoursWeekdays || 'Sunday – Friday: 9:00 AM – 6:00 PM';
  const officeHoursWeekend = settings.officeHoursWeekend || 'Saturday: By appointment only';

  const links = getContactLinks(settings.email, social.whatsapp, settings.phone);
  // Same three options as the floating contact button, shown up front.
  const quickContacts = [
    {
      icon: WhatsAppIcon,
      tile: 'bg-[#25D366]/15 text-[#128C4A]',
      title: 'Chat on WhatsApp',
      text: 'The fastest way to get an answer.',
      cta: 'Start a chat',
      href: links.whatsappUrl,
      external: true,
      highlight: false,
    },
    {
      icon: CalendarDays,
      tile: 'bg-primary text-primary-foreground',
      title: 'Book a free 15-min call',
      text: 'Talk through routes, dates and fitness with Gele. Pick a time that suits you.',
      cta: 'Choose a time',
      href: GELE_CALL_URL,
      external: true,
      highlight: true,
    },
    {
      icon: Mail,
      tile: 'bg-accent/15 text-[oklch(0.55_0.16_55)]',
      title: 'Email us',
      text: 'Best for detailed itineraries and custom quotes.',
      cta: links.email,
      href: links.emailUrl,
      external: false,
      highlight: false,
    },
  ];

  // One list of addresses: the main one first, then extras from Admin -> Site settings.
  const emailAddresses = [
    { email: contactEmail, note: 'Best for itinerary planning and custom quotes' },
    ...(settings.contactEmails || [])
      .filter((item) => item.email && item.email.toLowerCase() !== contactEmail.toLowerCase())
      .map((item) => ({ email: item.email, note: item.note || '' })),
  ].filter((item) => item.email);
  const phone = settings.phone || '+977 9843988164';
  const address = settings.address || 'Kathmandu, Nepal';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const socialLinks = [
    {
      Icon: FacebookIcon,
      href: social.facebook,
      label: 'Facebook',
      className: 'text-[#1877F2] bg-[#1877F2]/10 hover:bg-[#1877F2]/20',
    },
    {
      Icon: InstagramIcon,
      href: social.instagram,
      label: 'Instagram',
      className: 'text-[#E1306C] bg-[#E1306C]/10 hover:bg-[#E1306C]/20',
    },
    {
      Icon: WhatsAppIcon,
      href: social.whatsapp,
      label: 'WhatsApp',
      className: 'text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20',
    },
    {
      Icon: YouTubeIcon,
      href: social.youtube,
      label: 'YouTube',
      className: 'text-[#FF0000] bg-[#FF0000]/10 hover:bg-[#FF0000]/20',
    },
    {
      Icon: LinkedInIcon,
      href: social.linkedin,
      label: 'LinkedIn',
      className: 'text-[#0A66C2] bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20',
    },
  ].filter((link) => link.href);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [formStartedAt, setFormStartedAt] = useState<number>(() => Date.now());
  const [captchaToken, setCaptchaToken] = useState('');
  const [turnstileRenderKey, setTurnstileRenderKey] = useState(0);
  const rawTurnstileSiteKey = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '').trim();
  const hasPlaceholderTurnstileKey = /your_turnstile_site_key|your-site-key|changeme|placeholder/i.test(
    rawTurnstileSiteKey
  );
  const turnstileSiteKey = hasPlaceholderTurnstileKey ? '' : rawTurnstileSiteKey;
  const requiresCaptcha = Boolean(turnstileSiteKey);
  const isFormReady =
    Boolean(formData.name.trim()) &&
    Boolean(formData.email.trim()) &&
    Boolean(formData.subject.trim()) &&
    Boolean(formData.message.trim());
  const isCaptchaReady = !requiresCaptcha || Boolean(captchaToken);
  const canSubmit = !submitting && isFormReady && isCaptchaReady;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormReady) {
      setSubmitError('Please complete all required fields before submitting.');
      return;
    }

    if (requiresCaptcha && !captchaToken) {
      setSubmitError('Please complete captcha verification before submitting.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    const result = await submitContactMessage({
      name: formData.name,
      email: formData.email,
      message: [
        `Subject: ${formData.subject}`,
        formData.phone ? `Phone: ${formData.phone}` : '',
        '',
        formData.message,
      ]
        .filter(Boolean)
        .join('\n'),
      website: honeypot,
      formStartedAt,
      captchaToken,
    });

    setSubmitting(false);

    if (!result.success) {
      setSubmitError(result.message);
      if (result.message.toLowerCase().includes('captcha')) {
        setCaptchaToken('');
        setTurnstileRenderKey((value) => value + 1);
      }
      return;
    }

    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setHoneypot('');
    setFormStartedAt(Date.now());
    setCaptchaToken('');
    setTurnstileRenderKey((value) => value + 1);
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <section className="relative overflow-hidden border-b border-border py-10 md:py-14">
          {heroImageUrl ? (
            <div className="absolute inset-0">
              <Image
                src={heroImageUrl}
                alt="Contact page hero background"
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/10 to-background" />
          )}
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-3 text-center"
            >
              <motion.h1 variants={itemVariants} className={heroImageUrl ? "text-4xl md:text-5xl font-bold text-white text-balance" : "text-4xl md:text-5xl font-bold text-foreground text-balance"}>
                Contact Us
              </motion.h1>
            </motion.div>
          </div>
        </section>

        <section className="pt-10 md:pt-14" aria-labelledby="quick-contact-heading">
          <div className="container mx-auto px-4 md:px-6">
            <h2 id="quick-contact-heading" className="text-center text-lg font-semibold text-foreground md:text-xl">Choose how you&apos;d like to reach us</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {quickContacts.map(({ icon: Icon, tile, title, text, cta, href, external, highlight }) => (
                <div key={title} className="relative">
                <a
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  aria-label={href.startsWith('mailto:') ? `${title}: ${links.email}` : undefined}
                  className={`group relative flex h-full flex-col rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${highlight ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border-border shadow-sm'}`}
                >
                  {highlight && (
                    <span className="absolute -top-2.5 right-4 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-white">Free</span>
                  )}
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tile}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="mt-4 text-base font-semibold text-foreground">{title}</span>
                  <span className="mt-1 flex-1 text-sm text-muted-foreground">{text}</span>
                  <span className="mt-4 inline-flex items-center gap-1 break-all text-sm font-semibold text-primary">
                    {cta}
                    <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </a>
                {/* Copy sits beside the link (a button can't be inside a link). */}
                {href.startsWith('mailto:') && <CopyButton value={links.email} className="absolute right-4 top-5" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid grid-cols-1 lg:grid-cols-5 gap-8"
            >
              <motion.div variants={itemVariants} className="lg:col-span-3">
                <Card className="border-border p-6 md:p-8 shadow-sm">
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Send Us Your Inquiry</h2>
                    <p className="text-muted-foreground">
                      Share your preferred trek, travel dates, and questions — we’ll send a personalized plan.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Fast response within 24h
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                        <MessageCircle className="w-3.5 h-3.5" />
                        No-obligation consultation
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {submitted && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-green-500/10 border border-green-500/40 rounded-lg text-green-700 dark:text-green-300"
                      >
                        Thank you for your message! We’ll contact you shortly.
                      </motion.div>
                    )}

                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-500/10 border border-red-500/40 rounded-lg text-red-700 dark:text-red-300"
                      >
                        {submitError}
                      </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-semibold text-foreground">
                          Full Name <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          required
                          aria-required="true"
                          className="bg-muted/60 border-border text-foreground placeholder-muted-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                          Email Address <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          required
                          aria-required="true"
                          className="bg-muted/60 border-border text-foreground placeholder-muted-foreground"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label htmlFor="phone" className="block text-sm font-semibold text-foreground">
                          Phone / WhatsApp
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+977..."
                          className="bg-muted/60 border-border text-foreground placeholder-muted-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="subject" className="block text-sm font-semibold text-foreground">
                          Subject <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="Everest Base Camp inquiry"
                          required
                          aria-required="true"
                          className="bg-muted/60 border-border text-foreground placeholder-muted-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="block text-sm font-semibold text-foreground">
                        Message <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us your preferred trek, travel month, and any specific questions..."
                        required
                        aria-required="true"
                        rows={6}
                        className="w-full px-4 py-2.5 rounded-md bg-muted/60 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    <input
                      type="text"
                      name="website"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      autoComplete="off"
                      tabIndex={-1}
                      className="hidden"
                      aria-hidden="true"
                    />

                    {requiresCaptcha ? (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">Security check</p>
                        <TurnstileWidget
                          key={turnstileRenderKey}
                          siteKey={turnstileSiteKey}
                          onVerify={(token) => {
                            setCaptchaToken(token);
                            setSubmitError('');
                          }}
                          onExpire={() => setCaptchaToken('')}
                          onError={() => {
                            setCaptchaToken('');
                            setSubmitError("The security check couldn't load. Please turn off any ad blocker for this page and reload it.");
                          }}
                        />
                      </div>
                    ) : null}

                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white h-11 px-8"
                    >
                      {submitting ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          Sending...
                        </span>
                      ) : (
                        'Send Inquiry'
                      )}
                    </Button>
                    {!isFormReady && (
                      <p className="text-xs text-muted-foreground">Fill all required fields to enable submission.</p>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      We use your data only to respond to your trekking inquiry and won’t share it without your consent.{' '}
                      <Link href="/privacy-policy" className="text-primary underline underline-offset-2">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </form>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="lg:col-span-2">
                <section aria-labelledby="contact-details-heading" className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <div className="p-6">
                    <h2 id="contact-details-heading" className="text-lg font-semibold text-foreground">Contact details</h2>
                    <dl className="mt-2 divide-y divide-border">
                      <div className="flex gap-3 py-4">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</dt>
                          <dd className="mt-1.5 space-y-2.5">
                            {emailAddresses.map((item) => (
                              <div key={item.email}>
                                <div className="flex items-center gap-1">
                                  <a href={`mailto:${item.email}`} className="min-w-0 break-words font-medium text-foreground hover:text-primary">
                                    {/* Long addresses wrap at the @, not mid-word. */}
                                    {item.email.split('@')[0]}
                                    <wbr />@{item.email.split('@').slice(1).join('@')}
                                  </a>
                                  <CopyButton value={item.email} iconOnly className="border-0 bg-transparent px-1.5" />
                                </div>
                                {item.note ? <p className="text-sm text-muted-foreground">{item.note}</p> : null}
                              </div>
                            ))}
                          </dd>
                        </div>
                      </div>
                      <div className="flex gap-3 py-4">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phone and WhatsApp</dt>
                          <dd className="mt-1.5">
                            <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="font-medium text-foreground hover:text-primary">{phone}</a>
                          </dd>
                        </div>
                      </div>
                      <div className="flex gap-3 py-4">
                        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Office hours (Nepal time)</dt>
                          <dd className="mt-1.5 text-sm text-foreground">
                            <p>{officeHoursWeekdays}</p>
                            <p>{officeHoursWeekend}</p>
                          </dd>
                        </div>
                      </div>
                      <div className="flex gap-3 py-4">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Office</dt>
                          <dd className="mt-1.5">
                            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-primary">{address}</a>
                            <p className="text-sm text-muted-foreground">Visits by appointment</p>
                          </dd>
                        </div>
                      </div>
                    </dl>
                    {socialLinks.length > 0 ? (
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Follow us</p>
                        <div className="flex items-center gap-2">
                          {socialLinks.map(({ Icon, href, label, className }) => (
                            <a
                              key={label}
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={label}
                              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${className}`}
                            >
                              <Icon className="h-4 w-4" />
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="border-t border-border">
                    <ConsentGate label="Office map" loadLabel="Load map" externalUrl={mapsUrl} externalLabel="Open in Google Maps" className="min-h-[240px] rounded-none border-0">
                      <iframe
                        title="Office map"
                        src={settings.mapEmbedUrl || 'https://maps.google.com/maps?q=Kathmandu%2C%20Nepal&t=&z=12&ie=UTF8&iwloc=&output=embed'}
                        className="h-[240px] w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </ConsentGate>
                  </div>
                </section>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
