'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';
import { Award, Users, MapPin, Heart, BadgeCheck, ExternalLink, Star, Quote } from 'lucide-react';
import { WhatsAppIcon } from '@/components/whatsapp-icon';
import { FacebookIcon, InstagramIcon, YouTubeIcon, LinkedInIcon } from '@/components/social-icons';
import { useEffect, useMemo, useState } from 'react';
import { getAdminAbout, getGoogleReviews, getTestimonials, type AdminAbout, type UiGoogleReview, type UiTestimonial } from '@/lib/api';
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

const values = [
  {
    icon: Award,
    title: 'Excellence',
    description: 'We maintain the highest standards in safety, service, and experiences for all our trekkers.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'We believe in building lasting relationships with our guides, porters, and trekking community.',
  },
  {
    icon: MapPin,
    title: 'Expertise',
    description: 'Our team brings decades of combined experience trekking the Himalayan mountains.',
  },
  {
    icon: Heart,
    title: 'Sustainability',
    description: "We are committed to preserving Nepal's natural beauty for future generations.",
  },
];

const whyChooseUs = [
  'Licensed and experienced local guide team with strong mountain safety practices.',
  'Transparent pricing with practical pre-trip guidance and itinerary support.',
  'Responsible operations that support local communities and porter welfare.',
  'Personalized service from first inquiry to post-trek follow-up.',
];

// Fallback associations shown if admin hasn't saved any yet
const defaultAssociations = [
  { name: 'Nepal Government', logoUrl: 'https://ik.imagekit.io/dj8jxmvvw/Screenshot%202026-03-22%20123026.png' },
  { name: 'Nepal Tourism Board', logoUrl: 'https://ik.imagekit.io/dj8jxmvvw/Nepal-Tourism-Board_Logo-compact.jpg' },
  { name: 'Nepal Mountaineering Association', logoUrl: 'https://ik.imagekit.io/dj8jxmvvw/logo-header.png' },
  { name: "Trekking Agencies' Association of Nepal", logoUrl: 'https://ik.imagekit.io/dj8jxmvvw/taan-logo.jpg' },
];

const defaultAbout: Required<Pick<AdminAbout, 'heroTitle' | 'heroSubtitle' | 'storyTitle' | 'storyBody' | 'missionTitle' | 'missionBody'>> & {
  highlights: Array<{ title: string; description: string }>
  whyChooseUs: string[]
} = {
  heroTitle: 'About Us',
  heroSubtitle: 'We are a Nepal-based trekking company focused on safe, authentic, and responsibly operated Himalayan experiences.',
  storyTitle: 'Our Story',
  storyBody:
    "Gele Trekking began with a local team of mountain professionals who believed travelers deserve honest guidance, strong safety standards, and authentic connections with Nepal's mountain culture. Today, we continue the same approach—small details handled well, local teams treated fairly, and every itinerary built for a meaningful Himalayan experience.",
  missionTitle: 'Our Mission',
  missionBody:
    'Our mission is to deliver safe, memorable, and responsibly operated trekking journeys while supporting local livelihoods and preserving mountain environments for future generations.',
  highlights: values.map((item) => ({ title: item.title, description: item.description })),
  whyChooseUs,
};

type CombinedReview = {
  id: string
  name: string
  subtitle: string
  rating: number
  text: string
  badge: string
  source: 'admin' | 'google'
}

const mapAdminReview = (review: UiTestimonial): CombinedReview => ({
  id: `admin-${review.id}`,
  name: review.name,
  subtitle: `${review.country} • ${review.trek}`,
  rating: review.rating,
  text: review.text,
  badge: review.date,
  source: 'admin',
})

const mapGoogleReview = (review: UiGoogleReview): CombinedReview => ({
  id: review.id,
  name: review.authorName,
  subtitle: review.relativeTime || 'Google review',
  rating: Math.max(1, Math.min(5, Math.round(review.rating || 5))),
  text: review.text,
  badge: 'Google',
  source: 'google',
})

export default function AboutPage() {
  const [about, setAbout] = useState<AdminAbout | null>(null);
  const [reviews, setReviews] = useState<CombinedReview[]>([]);
  const { social } = useSiteSettings();

  const socialLinks = useMemo(
    () => [
      {
        Icon: FacebookIcon,
        href: social.facebook,
        label: 'Facebook',
        className: 'text-[#1877F2] bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border-[#1877F2]/30',
      },
      {
        Icon: InstagramIcon,
        href: social.instagram,
        label: 'Instagram',
        className: 'text-[#E1306C] bg-[#E1306C]/10 hover:bg-[#E1306C]/20 border-[#E1306C]/30',
      },
      {
        Icon: WhatsAppIcon,
        href: social.whatsapp,
        label: 'WhatsApp',
        className: 'text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20 border-[#25D366]/30',
      },
      {
        Icon: YouTubeIcon,
        href: social.youtube,
        label: 'YouTube',
        className: 'text-[#FF0000] bg-[#FF0000]/10 hover:bg-[#FF0000]/20 border-[#FF0000]/30',
      },
      {
        Icon: LinkedInIcon,
        href: social.linkedin,
        label: 'LinkedIn',
        className: 'text-[#0A66C2] bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border-[#0A66C2]/30',
      },
    ].filter((link) => link.href),
    [social]
  );

  useEffect(() => {
    const loadPageData = async () => {
      const [aboutResult, adminReviews, googleReviews] = await Promise.allSettled([
        getAdminAbout(),
        getTestimonials(),
        getGoogleReviews(),
      ])

      if (aboutResult.status === 'fulfilled') {
        setAbout(aboutResult.value)
      } else {
        setAbout(null)
      }

      const normalizedAdmin = adminReviews.status === 'fulfilled'
        ? adminReviews.value.map(mapAdminReview)
        : []
      const normalizedGoogle = googleReviews.status === 'fulfilled'
        ? googleReviews.value.map(mapGoogleReview).filter((item) => item.text.trim().length > 0)
        : []

      const merged = [...normalizedGoogle, ...normalizedAdmin]
      setReviews(merged.slice(0, 6))
    };

    void loadPageData();
  }, []);

  const heroTitle = (about?.heroTitle || '').trim() || defaultAbout.heroTitle;
  const heroSubtitle = (about?.heroSubtitle || '').trim() || defaultAbout.heroSubtitle;
  const storyTitle = (about?.storyTitle || '').trim() || defaultAbout.storyTitle;
  const storyBody = (about?.storyBody || '').trim() || defaultAbout.storyBody;
  const missionTitle = (about?.missionTitle || '').trim() || defaultAbout.missionTitle;
  const missionBody = (about?.missionBody || '').trim() || defaultAbout.missionBody;

  const valueCards = useMemo(() => {
    const source = about?.highlights && about.highlights.length > 0
      ? about.highlights
      : defaultAbout.highlights;

    const icons = [Award, Users, MapPin, Heart];
    return source.map((item, index) => ({
      ...item,
      icon: icons[index % icons.length],
    }));
  }, [about?.highlights]);

  const whyChooseUsPoints = useMemo(() => {
    const points = (about?.whyChooseUs || []).map((point) => point.trim()).filter(Boolean);
    return points.length > 0 ? points : defaultAbout.whyChooseUs;
  }, [about?.whyChooseUs]);

  // Read associations from API response, fall back to hardcoded defaults
  const associationList = useMemo(() => {
    const fromApi = ((about as any)?.associations || []) as Array<{ name: string; logoUrl: string }>
    const valid = fromApi.filter((a) => a.name?.trim() && a.logoUrl?.trim())
    return valid.length > 0 ? valid : defaultAssociations
  }, [about]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        {/* ── Hero ── */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-3 text-center"
            >
              <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-foreground text-balance">
                {heroTitle}
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto"
              >
                {heroSubtitle}
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ── Main Content ── */}
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <motion.div variants={containerVariants} className="lg:col-span-8 space-y-6">
                <motion.div variants={itemVariants}>
                  <div className="p-1 md:p-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{storyTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed text-[15px] md:text-base">{storyBody}</p>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <div className="p-1 md:p-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{missionTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed text-[15px] md:text-base">{missionBody}</p>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">Our Values</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {valueCards.map((value) => {
                      const Icon = value.icon;
                      return (
                        <Card key={value.title} className="border-border p-5 h-full">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-foreground mb-1.5">{value.title}</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="border-border p-6 md:p-7">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Why Choose Us</h2>
                    <ul className="space-y-3">
                      {whyChooseUsPoints.map((point) => (
                        <li key={point} className="flex gap-2.5 text-muted-foreground">
                          <span className="text-primary font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
                  <div id="team" className="scroll-mt-24">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Meet Our Team</h2>
                    <p className="text-sm md:text-base text-muted-foreground mt-2">
                      Our local mountain team combines field-tested leadership, high-altitude safety expertise, and warm Nepalese hospitality.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(about?.teamMembers || []).map((member) => (
                      <Card key={member.name} className="border-border p-5 h-full bg-gradient-to-b from-background to-muted/20">
                        {member.imageUrl ? (
                          <div className="w-11 h-11 rounded-full mb-3 overflow-hidden border border-border">
                            <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <h3 className="text-lg font-bold text-foreground mb-1">{member.name}</h3>
                        <p className="text-sm font-medium text-primary mb-2">{member.role}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{member.description}</p>
                      </Card>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">Our Traveller&apos;s Reviews</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.length > 0 ? reviews.map((review) => (
                      <Card key={review.id} className="relative border-border p-5 bg-gradient-to-br from-background to-muted/30">
                        <Quote className="absolute right-4 top-4 w-4 h-4 text-primary/35" />
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: review.rating }).map((_, index) => (
                            <Star key={index} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{review.text}&rdquo;</p>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{review.name}</p>
                            <p className="text-xs text-muted-foreground">{review.subtitle}</p>
                          </div>
                          <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${review.source === 'google' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' : 'bg-primary/10 text-primary'}`}>
                            {review.badge}
                          </span>
                        </div>
                      </Card>
                    )) : (
                      <Card className="border-border p-6 md:col-span-2">
                        <p className="text-sm text-muted-foreground">No reviews are available yet. Add testimonials from admin or connect Google reviews to display them here.</p>
                      </Card>
                    )}
                  </div>
                </motion.div>
              </motion.div>

              <motion.aside variants={containerVariants} className="lg:col-span-4 space-y-5 h-fit lg:sticky lg:top-24">
                <motion.div variants={itemVariants}>
                  <Card className="border-0 bg-transparent shadow-none p-5">
                    <h3 className="text-xl font-bold text-foreground mb-3">Connect With Us</h3>
                    <p className="text-sm text-muted-foreground mb-4">Follow our latest updates and reach out directly through social channels.</p>
                    {socialLinks.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5">
                        {socialLinks.map(({ Icon, href, label, className }) => (
                          <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={label}
                            className={`w-10 h-10 rounded-full border transition-colors flex items-center justify-center ${className}`}
                          >
                            <Icon className="w-4.5 h-4.5" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No social links configured yet.</p>
                    )}
                  </Card>
                </motion.div>
              </motion.aside>
            </motion.div>
          </div>
        </section>

        {/* ── Associations Section ── */}
        <section className="py-12 md:py-16 border-t border-border bg-muted/20">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto">
                <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-primary mb-2">Legally Registered Trekking Company in Nepal</p>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">We&apos;re Associates With</h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  We are affiliated with key tourism and mountaineering institutions in Nepal and maintain transparent legal registration details.
                </p>
              </motion.div>

              {/* Dynamic logo row */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
                {associationList.map((association) => (
                  <div key={association.name} className="flex items-center justify-center">
                    <img
                      src={association.logoUrl}
                      alt={association.name}
                      className="h-16 w-auto max-w-[120px] object-contain"
                    />
                  </div>
                ))}
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-border p-5 md:p-6 bg-gradient-to-br from-primary/5 to-accent/5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-2.5">
                      <BadgeCheck className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Legal Registry Verification</h3>
                        <p className="text-sm text-muted-foreground">TAAN Member Directory • Member ID: 2540</p>
                      </div>
                    </div>
                    <a
                      href="https://www.taan.org.np/members/2540"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
                    >
                      Verify on TAAN
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
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
