'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Phone, MapPin, Clock3, MessageCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { WhatsAppIcon } from '@/components/whatsapp-icon';
import { FacebookIcon, InstagramIcon, YouTubeIcon, LinkedInIcon } from '@/components/social-icons';
import { TurnstileWidget } from '@/components/turnstile-widget';
import { submitContactMessage } from '@/lib/api';
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

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: settings.email || 'info@geletrekking.com',
      href: `mailto:${settings.email || 'info@geletrekking.com'}`,
      description: 'Best for itinerary planning and custom quotes',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: settings.phone || '+977 985 123 4567',
      href: `tel:${(settings.phone || '+9779851234567').replace(/\s+/g, '')}`,
      description: 'Mon–Sat support for urgent travel assistance',
    },
    {
      icon: MapPin,
      label: 'Office',
      value: settings.address || 'Kathmandu, Nepal',
      href: '#',
      description: 'In-person consultation by prior appointment',
    },
  ];
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
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const requiresCaptcha = Boolean(turnstileSiteKey);
  const isFormReady =
    Boolean(formData.name.trim()) &&
    Boolean(formData.email.trim()) &&
    Boolean(formData.subject.trim()) &&
    Boolean(formData.message.trim());
  const isCaptchaReady = !requiresCaptcha || Boolean(captchaToken);
  const canSubmit = !submitting && isFormReady && isCaptchaReady;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
        <section className="py-10 md:py-14 bg-gradient-to-br from-primary/15 via-accent/10 to-background border-b border-border">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-3 text-center"
            >
              <motion.p
                variants={itemVariants}
                className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-semibold text-primary"
              >
                Plan Your Trek with Confidence
              </motion.p>
              <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-foreground text-balance">
                Contact Our Trek Experts
              </motion.h1>
              <motion.p variants={itemVariants} className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                Get route recommendations, difficulty guidance, and transparent pricing. We usually respond within 24 hours.
              </motion.p>
            </motion.div>
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
                      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">Security verification</p>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isCaptchaReady
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {isCaptchaReady ? 'Verified' : 'Required'}
                          </span>
                        </div>
                        <TurnstileWidget
                          key={turnstileRenderKey}
                          siteKey={turnstileSiteKey}
                          onVerify={(token) => {
                            setCaptchaToken(token);
                            setSubmitError('');
                          }}
                          onExpire={() => setCaptchaToken('')}
                          onError={() => setCaptchaToken('')}
                        />
                        <p className="text-xs text-muted-foreground" aria-live="polite">
                          {isCaptchaReady
                            ? 'Verification complete. You can send your inquiry now.'
                            : 'Complete the captcha to enable the send button.'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                        Captcha is not configured in this environment. Submission remains available.
                      </p>
                    )}

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
                  </form>
                </Card>

                <Card className="border-0 bg-transparent shadow-none p-5 mt-5">
                  <h3 className="text-base font-bold text-foreground mb-3">Follow Us</h3>
                  {socialLinks.length > 0 ? (
                    <div className="flex items-center gap-2.5">
                      {socialLinks.map(({ Icon, href, label, className }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          className={`w-9 h-9 rounded-full transition-colors flex items-center justify-center ${className}`}
                        >
                          <Icon className="w-4 h-4" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No social links configured yet.</p>
                  )}
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="lg:col-span-2 space-y-5">
                <div className="space-y-4">
                  {contactInfo.map((info) => {
                    const Icon = info.icon;
                    return (
                      <Card key={info.label} className="border-border p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground font-semibold">{info.label}</p>
                            <a href={info.href} className="text-base font-bold text-foreground hover:text-primary transition-colors">
                              {info.value}
                            </a>
                            <p className="text-sm text-muted-foreground">{info.description}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                <Card className="border-border p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock3 className="w-4 h-4 text-primary" />
                    <h3 className="text-base font-bold text-foreground">Office Hours (NPT)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{settings.officeHoursWeekdays || 'Sunday – Friday: 9:00 AM – 6:00 PM'}</p>
                  <p className="text-sm text-muted-foreground">{settings.officeHoursWeekend || 'Saturday: By appointment only'}</p>
                </Card>

                <Card className="border-border overflow-hidden">
                  <iframe
                    title="Kathmandu office map"
                    src={settings.mapEmbedUrl || 'https://maps.google.com/maps?q=Kathmandu%2C%20Nepal&t=&z=12&ie=UTF8&iwloc=&output=embed'}
                    className="w-full h-[280px] border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
