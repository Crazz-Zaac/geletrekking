'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Award,
  Users,
  MapPin,
  Heart,
  BadgeCheck,
  ExternalLink,
  Star,
  Quote,
  ShieldCheck,
  Mountain,
  Clock3,
  Globe,
  UserRound,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/whatsapp-icon';
import { FacebookIcon, InstagramIcon, YouTubeIcon, LinkedInIcon } from '@/components/social-icons';
import { useEffect, useMemo, useState } from 'react';
import { getAdminAbout, getGoogleReviews, getTestimonials, type AdminAbout, type UiGoogleReview, type UiTestimonial } from '@/lib/api';
import { useSiteSettings } from '@/hooks/use-site-settings';

const values = [
  {
    icon: Award,
    title: 'Excellence',
    description: 'We maintain high standards in safety, service quality, and overall trek experience.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'We build long-term relationships with local guides, porters, and mountain communities.',
  },
  {
    icon: MapPin,
    title: 'Expertise',
    description: 'Our field team brings deep route knowledge across Nepal’s Himalayan regions.',
  },
  {
    icon: Heart,
    title: 'Sustainability',
    description: 'We prioritize responsible travel that protects nature and supports local livelihoods.',
  },
];

const whyChooseUs = [
  'Licensed and experienced local guide team with strong mountain safety practices.',
  'Transparent pricing with practical pre-trip guidance and itinerary support.',
  'Responsible operations that support local communities and porter welfare.',
  'Personalized service from first inquiry to post-trek follow-up.',
];

const defaultAssociations = [
  { name: 'Nepal Government', logoUrl: 'https://ik.imagekit.io/dj8jxmvvw/Screenshot%202026-03-22%20123026.png' },
  { name: 'Nepal Tourism Board', logoUrl: 'https://ik.imagekit.io/dj8jxmvvw/Nepal-Tourism-Board_Logo-compact.jpg' },
  { name: 'Nepal Mountaineering Association', logoUrl: 'https://ik.imagekit.io/dj8jxmvvw/logo-header.png' },
  { name: "Trekking Agencies' Association of Nepal", logoUrl: 'https://ik.imagekit.io/dj8jxmvvw/taan-logo.jpg' },
];

const fallbackStats = [
  { label: 'Years Of Local Expertise', value: '15+' },
  { label: 'Guided Trekkers', value: '2,500+' },
  { label: 'Average Traveller Rating', value: '4.9/5' },
  { label: 'Safety-First Operations', value: '100%' },
];

const defaultAbout: Required<Pick<AdminAbout, 'heroTitle' | 'heroSubtitle' | 'storyTitle' | 'storyBody' | 'missionTitle' | 'missionBody'>> & {
  highlights: Array<{ title: string; description: string }>
  whyChooseUs: string[]
  teamTitle: string
} = {
  heroTitle: 'About Us',
  heroSubtitle: 'We are a Nepal-based trekking company focused on safe, authentic, and responsibly operated Himalayan experiences.',
  storyTitle: 'Our Story',
  storyBody:
    'Gele Trekking began with mountain professionals who believed travellers deserve honest guidance, strong safety standards, and authentic connection with local culture. Today, we continue with the same approach: details handled well, local teams treated fairly, and itineraries designed for meaningful Himalayan journeys.',
  missionTitle: 'Our Mission',
  missionBody:
    'Our mission is to deliver safe, memorable, and responsibly operated trekking journeys while supporting local livelihoods and preserving mountain environments for future generations.',
  highlights: values.map((item) => ({ title: item.title, description: item.description })),
  whyChooseUs,
  teamTitle: 'Meet Our Team',
};

type CombinedReview = {
  id: string
  name: string
  subtitle: string
  rating: number
  text: string
  badge: string
  source: 'admin' | 'google'
};

const mapAdminReview = (review: UiTestimonial): CombinedReview => ({
  id: `admin-${review.id}`,
  name: review.name,
  subtitle: `${review.country} • ${review.trek}`,
  rating: Math.max(1, Math.min(5, Math.round(review.rating || 5))),
  text: review.text,
  badge: review.date,
  source: 'admin',
});

const mapGoogleReview = (review: UiGoogleReview): CombinedReview => ({
  id: review.id,
  name: review.authorName,
  subtitle: review.relativeTime || 'Google review',
  rating: Math.max(1, Math.min(5, Math.round(review.rating || 5))),
  text: review.text,
  badge: 'Google',
  source: 'google',
});

function toReadableBullets(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 25)
    .slice(0, 3);
}

function LoadingSkeleton() {
  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-5">
            <div className="h-8 w-52 bg-muted rounded-md animate-pulse" />
            <div className="h-4 w-full bg-muted rounded-md animate-pulse" />
            <div className="h-4 w-[92%] bg-muted rounded-md animate-pulse" />
            <div className="h-40 w-full bg-muted rounded-xl animate-pulse" />
            <div className="h-52 w-full bg-muted rounded-xl animate-pulse" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="h-32 w-full bg-muted rounded-xl animate-pulse" />
            <div className="h-40 w-full bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutPageClient() {
  const shouldReduceMotion = useReducedMotion();
  const [about, setAbout] = useState<AdminAbout | null>(null);
  const [reviews, setReviews] = useState<CombinedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aboutFetchFailed, setAboutFetchFailed] = useState(false);
  const [reviewsFetchFailed, setReviewsFetchFailed] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const { social } = useSiteSettings();

  const containerVariants = shouldReduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.12 },
      },
    };

  const itemVariants = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
      hidden: { opacity: 0, y: 16 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
    };

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
      setIsLoading(true);
      const [aboutResult, adminReviews, googleReviews] = await Promise.allSettled([
        getAdminAbout(),
        getTestimonials(),
        getGoogleReviews(),
      ]);

      if (aboutResult.status === 'fulfilled') {
        setAbout(aboutResult.value);
        setAboutFetchFailed(false);
      } else {
        setAbout(null);
        setAboutFetchFailed(true);
      }

      const normalizedAdmin =
        adminReviews.status === 'fulfilled' ? adminReviews.value.map(mapAdminReview) : [];
      const normalizedGoogle =
        googleReviews.status === 'fulfilled'
          ? googleReviews.value.map(mapGoogleReview).filter((item) => item.text.trim().length > 0)
          : [];

      setReviewsFetchFailed(adminReviews.status === 'rejected' && googleReviews.status === 'rejected');
      setReviews([...normalizedGoogle, ...normalizedAdmin].slice(0, 6));
      setIsLoading(false);
    };

    void loadPageData();
  }, []);

  const heroTitle = (about?.heroTitle || '').trim() || defaultAbout.heroTitle;
  const heroSubtitle = (about?.heroSubtitle || '').trim() || defaultAbout.heroSubtitle;
  const storyTitle = (about?.storyTitle || '').trim() || defaultAbout.storyTitle;
  const storyBody = (about?.storyBody || '').trim() || defaultAbout.storyBody;
  const missionTitle = (about?.missionTitle || '').trim() || defaultAbout.missionTitle;
  const missionBody = (about?.missionBody || '').trim() || defaultAbout.missionBody;
  const teamTitle = (about?.teamTitle || '').trim() || defaultAbout.teamTitle;
  const heroImageUrl = (about?.heroImageUrl || '').trim();

  const storyBullets = useMemo(() => toReadableBullets(storyBody), [storyBody]);
  const missionBullets = useMemo(() => toReadableBullets(missionBody), [missionBody]);

  const valueCards = useMemo(() => {
    const source = about?.highlights && about.highlights.length > 0 ? about.highlights : defaultAbout.highlights;
    const icons = [Award, Users, MapPin, Heart];
    return source.map((item, index) => ({
      ...item,
      icon: icons[index % icons.length],
    }));
  }, [about?.highlights]);

  const aboutStats = useMemo(() => {
    const stats = (about?.stats || [])
      .filter((stat) => stat.label?.trim() && stat.value?.trim())
      .slice(0, 4);
    return stats.length > 0 ? stats : fallbackStats;
  }, [about?.stats]);

  const whyChooseUsPoints = useMemo(() => {
    const points = (about?.whyChooseUs || []).map((point) => point.trim()).filter(Boolean);
    return points.length > 0 ? points : defaultAbout.whyChooseUs;
  }, [about?.whyChooseUs]);

  const teamMembers = useMemo(() => {
    return (about?.teamMembers || []).filter((member) => member.name?.trim() && member.role?.trim());
  }, [about?.teamMembers]);

  const associationList = useMemo(() => {
    const fromApi = (about?.associations || [])
      .filter((association) => association?.name?.trim() && association?.logoUrl?.trim());
    return fromApi.length > 0 ? fromApi : defaultAssociations;
  }, [about]);

  const toggleReview = (id: string) => {
    setExpandedReviews((previous) => ({ ...previous, [id]: !previous[id] }));
  };

  const whatsappLink = social.whatsapp || 'https://wa.me/9779800000000';

  return (
    <>
      <section className="relative py-12 md:py-16 border-b border-border overflow-hidden">
        {heroImageUrl ? (
          <div className="absolute inset-0">
            <Image
              src={heroImageUrl}
              alt="About page hero background"
              fill
              priority
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
        )}
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative z-10 space-y-4 text-center"
          >
            <motion.h1 variants={itemVariants} className={`text-4xl md:text-5xl font-bold text-balance ${heroImageUrl ? 'text-white' : 'text-foreground'}`}>
              {heroTitle}
            </motion.h1>
            <motion.p variants={itemVariants} className={`text-base md:text-lg max-w-3xl mx-auto ${heroImageUrl ? 'text-white/85' : 'text-muted-foreground'}`}>
              {heroSubtitle}
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2.5 pt-1">
              <Button asChild className="h-10 px-5">
                <Link href="/destinations">Explore Treks</Link>
              </Button>
              <Button asChild variant="outline" className="h-10 px-5">
                <Link href="/contact">Talk To Our Team</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {isLoading ? <LoadingSkeleton /> : null}

      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 md:px-6">
          {(aboutFetchFailed || reviewsFetchFailed) && (
            <Card className="mb-6 border-amber-300/40 bg-amber-50/70 dark:bg-amber-500/10 p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Some live About content is temporarily unavailable. Showing the latest safe fallback content.
              </p>
            </Card>
          )}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            <motion.div variants={containerVariants} className="lg:col-span-8 space-y-7">
              <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {aboutStats.map((stat, index) => {
                  const icons = [Mountain, Users, Star, ShieldCheck];
                  const Icon = icons[index % icons.length];
                  return (
                    <Card key={stat.label} className="border-border p-4 bg-gradient-to-br from-background to-muted/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                      <p className="text-xl font-bold text-foreground leading-tight">{stat.value}</p>
                    </Card>
                  );
                })}
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="p-1 md:p-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{storyTitle}</h2>
                  <p className="text-muted-foreground leading-relaxed text-[15px] md:text-base">{storyBody}</p>
                  {storyBullets.length > 0 && (
                    <ul className="mt-4 space-y-2.5">
                      {storyBullets.map((point) => (
                        <li key={point} className="flex gap-2.5 text-sm text-muted-foreground">
                          <span className="text-primary font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="p-1 md:p-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{missionTitle}</h2>
                  <p className="text-muted-foreground leading-relaxed text-[15px] md:text-base">{missionBody}</p>
                  {missionBullets.length > 0 && (
                    <ul className="mt-4 space-y-2.5">
                      {missionBullets.map((point) => (
                        <li key={point} className="flex gap-2.5 text-sm text-muted-foreground">
                          <span className="text-primary font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
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
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">{teamTitle}</h2>
                  <p className="text-sm md:text-base text-muted-foreground mt-2">
                    Our local mountain team combines field-tested leadership, high-altitude safety expertise, and warm Nepalese hospitality.
                  </p>
                </div>

                {teamMembers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {teamMembers.map((member) => (
                      <Card key={`${member.name}-${member.role}`} className="border-border overflow-hidden h-full bg-gradient-to-b from-background to-muted/20 hover:shadow-lg transition-shadow">
                        {member.imageUrl ? (
                          <div className="relative w-full h-64 md:h-72 overflow-hidden bg-muted">
                            <Image
                              src={member.imageUrl}
                              alt={`${member.name}, ${member.role} at Gele Trekking`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-full h-64 md:h-72 bg-primary/10 flex items-center justify-center">
                            <Users className="w-16 h-16 text-primary/30" />
                          </div>
                        )}
                        <div className="p-5">
                          <h3 className="text-lg font-bold text-foreground mb-1">{member.name}</h3>
                          <p className="text-sm font-medium text-primary mb-3">{member.role}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{member.description}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-border p-6 bg-muted/20">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Team profiles are being updated</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our field leaders, guides, and operations team details will appear here shortly.
                    </p>
                    <Button asChild variant="outline">
                      <Link href="/contact">Ask us about our guide team</Link>
                    </Button>
                  </Card>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Our Traveller&apos;s Reviews</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => {
                      const isExpanded = expandedReviews[review.id] || review.text.length <= 180;
                      const previewText = isExpanded ? review.text : `${review.text.slice(0, 180).trim()}...`;

                      return (
                        <Card key={review.id} className="relative border-border p-5 bg-gradient-to-br from-background to-muted/30">
                          <Quote className="absolute right-4 top-4 w-4 h-4 text-primary/35" />
                          <div className="flex items-center gap-1 mb-2" aria-label={`${review.rating} out of 5 stars`}>
                            {Array.from({ length: review.rating }).map((_, index) => (
                              <Star key={index} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-2">&ldquo;{previewText}&rdquo;</p>
                          {review.text.length > 180 && (
                            <button
                              onClick={() => toggleReview(review.id)}
                              className="text-xs font-medium text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
                            >
                              {isExpanded ? 'Show less' : 'Read more'}
                            </button>
                          )}
                          <div className="flex items-center justify-between gap-3 mt-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{review.name}</p>
                              <p className="text-xs text-muted-foreground">{review.subtitle}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full ${review.source === 'google' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' : 'bg-primary/10 text-primary'}`}>
                              {review.source === 'google' ? <Globe className="w-3 h-3" /> : <UserRound className="w-3 h-3" />}
                              {review.badge}
                            </span>
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <Card className="border-border p-6 md:col-span-2">
                      <p className="text-sm text-muted-foreground mb-3">
                        No reviews are available right now. Add testimonials from admin or connect Google reviews to display them here.
                      </p>
                      <Button asChild size="sm" variant="outline">
                        <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
                          Talk to us on WhatsApp
                        </Link>
                      </Button>
                    </Card>
                  )}
                </div>
              </motion.div>
            </motion.div>

            <motion.aside variants={containerVariants} className="lg:col-span-4 space-y-5 h-fit lg:sticky lg:top-24">
              <motion.div variants={itemVariants}>
                <Card className="border-border p-5">
                  <h3 className="text-xl font-bold text-foreground mb-3">Connect With Us</h3>
                  <p className="text-sm text-muted-foreground mb-4">Follow updates and get direct support from our local team.</p>
                  {socialLinks.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5">
                      {socialLinks.map(({ Icon, href, label, className }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{label}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No social links configured yet.</p>
                  )}
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-border p-5 bg-gradient-to-br from-primary/5 to-accent/10">
                  <h3 className="text-lg font-bold text-foreground mb-2">Plan Your Trek With Confidence</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get expert route guidance, transparent costs, and personalized recommendations from our local team.
                  </p>
                  <div className="space-y-2.5">
                    <Button asChild className="w-full">
                      <Link href="/contact">Get a Custom Itinerary</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        Chat On WhatsApp
                      </Link>
                    </Button>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="w-3.5 h-3.5" />
                    Fast replies during Nepal business hours.
                  </div>
                </Card>
              </motion.div>
            </motion.aside>
          </motion.div>
        </div>
      </section>

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
              <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-primary mb-2">Legally Registered Trekking Company In Nepal</p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Our Registrations & Associations</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                We maintain transparent legal registration and work with key tourism and mountaineering institutions.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
              {associationList.map((association) => (
                <div key={association.name} className="relative h-16 w-28 md:w-32">
                  <Image
                    src={association.logoUrl}
                    alt={`${association.name} affiliation logo`}
                    fill
                    className="object-contain"
                    sizes="128px"
                    unoptimized
                  />
                </div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-border p-5 md:p-6 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <BadgeCheck className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Legal Registry Verification</h3>
                        <p className="text-sm text-muted-foreground">TAAN Member Directory • Member ID: 2540</p>
                      </div>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <li>• Registered local trekking operator</li>
                      <li>• Safety-focused mountain operations</li>
                      <li>• Trained local guide and support crew</li>
                      <li>• Responsible porter welfare practices</li>
                    </ul>
                  </div>
                  <a
                    href="https://www.taan.org.np/members/2540"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md"
                  >
                    Verify On TAAN
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-border p-6 md:p-8 text-center bg-background">
                <h3 className="text-2xl font-bold text-foreground mb-2">Ready For Your Himalayan Adventure?</h3>
                <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-5">
                  Tell us your dates, fitness level, and interests. We will help you choose the right trek and prepare confidently.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button asChild>
                    <Link href="/contact">Plan My Trek</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/guides">Read Trekking Guides</Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
