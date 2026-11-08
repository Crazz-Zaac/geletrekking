import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Bus,
  CalendarDays,
  Compass,
  ExternalLink,
  HandHeart,
  Leaf,
  Mountain,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/whatsapp-icon';
import { FacebookIcon, InstagramIcon, YouTubeIcon, LinkedInIcon } from '@/components/social-icons';
import type { AdminAbout, AdminAboutTeamMember, SiteReviews, TrustSummary } from '@/lib/api';
import { GELE_CALL_URL, WHATSAPP_URL } from '@/lib/contact-links';
import {
  COMPANY_FOUNDED_YEAR,
  FOUNDER_LEADER_SINCE_YEAR,
  FOUNDER_SINCE_YEAR,
  SITE_METRICS,
} from '@/lib/site-metrics';
import { TEAM_SOCIAL_FIELDS, isValidSocialUrl } from '@/lib/team-social-links';

/* ------------------------------------------------------------------ */
/* Fallback copy, used only if the About content can't be loaded.      */
/* ------------------------------------------------------------------ */

const FALLBACK = {
  heroTitle: 'About Us',
  heroSubtitle: 'Gele Trekking Nepal helps trekkers create their own stories and memories.',
  storyTitle: 'Our Story',
  storyBody: `Gele Trekking was founded by Gele Bishokarma, who started in the trekking industry in ${FOUNDER_SINCE_YEAR} as a porter and became a professional trek leader in ${FOUNDER_LEADER_SINCE_YEAR}. After many years leading trips for international adventure companies, he started Gele Trekking to share his knowledge, experience and love of Nepal with travellers from around the world.`,
  missionTitle: 'Our Mission',
  missionBody:
    'We deliver safe, memorable and responsibly run trekking journeys while supporting local livelihoods and protecting mountain environments for future generations.',
  teamTitle: 'Meet Our Team',
};

const FALLBACK_REASONS = [
  { title: 'Safety First', description: 'We always put the safety and well-being of our trekkers first.' },
  { title: 'Small Groups', description: 'A more personal, friendly and flexible trekking experience.' },
  { title: 'Personal Service', description: 'Attentive support from your first enquiry to the end of your trek.' },
  { title: 'Sustainability', description: 'Protecting Nepal’s natural beauty and supporting local communities.' },
];

const DEFAULT_ASSOCIATIONS = [
  { name: 'Nepal Government', logoUrl: 'https://ik.imagekit.io/dj8jxmvvw/Screenshot%202026-03-22%20123026.png' },
  { name: 'Nepal Tourism Board', logoUrl: 'https://ik.imagekit.io/dj8jxmvvw/Nepal-Tourism-Board_Logo-compact.jpg' },
  { name: 'Nepal Mountaineering Association', logoUrl: 'https://ik.imagekit.io/dj8jxmvvw/logo-header.png' },
  { name: "Trekking Agencies' Association of Nepal", logoUrl: 'https://ik.imagekit.io/dj8jxmvvw/taan-logo.jpg' },
];

const TIMELINE = [
  { year: String(FOUNDER_SINCE_YEAR), title: 'Starts as a porter', text: 'Gele’s first seasons carrying loads on Himalayan trails.' },
  { year: String(FOUNDER_LEADER_SINCE_YEAR), title: 'Becomes a trek leader', text: 'Qualifies as a professional trek leader.' },
  { year: `${FOUNDER_LEADER_SINCE_YEAR}+`, title: 'Leads for Intrepid & Exodus', text: 'Years guiding groups for two well-known international adventure companies.' },
  { year: '2016', title: 'Recommended Trip Leader Award', text: 'Recognised for his leadership and care for guests.' },
  { year: String(COMPANY_FOUNDED_YEAR), title: 'Founds Gele Trekking', text: 'Starts his own company to share Nepal his way.' },
];

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const isSafeHref = (href: string) =>
  href.startsWith('/') || href.startsWith('#') || /^https?:\/\//i.test(href) || /^mailto:/i.test(href) || /^tel:/i.test(href);

/** Supports the admin editor's inline markdown: **bold**, *italic* and [links](url). */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[2] && match[3]) {
      const href = match[3].trim();
      if (!isSafeHref(href)) nodes.push(match[2]);
      else if (href.startsWith('/') || href.startsWith('#'))
        nodes.push(<Link key={match.index} href={href} className="font-semibold text-primary underline underline-offset-4">{renderInline(match[2])}</Link>);
      else
        nodes.push(<a key={match.index} href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-4">{renderInline(match[2])}</a>);
    } else if (match[4]) {
      nodes.push(<strong key={match.index} className="font-semibold text-foreground">{renderInline(match[4])}</strong>);
    } else if (match[5]) {
      nodes.push(<em key={match.index}>{renderInline(match[5])}</em>);
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function Prose({ value, className = '' }: { value: string; className?: string }) {
  const lines = value.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  return (
    <div className={`space-y-4 ${className}`}>
      {lines.map((line, index) => {
        if (line.startsWith('## ')) return <h3 key={index} className="text-lg font-bold text-foreground">{renderInline(line.slice(3))}</h3>;
        if (line.startsWith('> '))
          return <blockquote key={index} className="border-l-2 border-primary pl-4 italic text-muted-foreground">{renderInline(line.slice(2))}</blockquote>;
        return (
          <p key={index} className="leading-relaxed text-muted-foreground">
            {renderInline(line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, ''))}
          </p>
        );
      })}
    </div>
  );
}

/** "Small Groups: Like a more personal…" → { title, description }. */
function splitPoint(point: string) {
  const match = point.match(/^([^:]{2,40}):\s*(.+)$/s);
  return match ? { title: match[1].trim(), description: match[2].trim() } : { title: '', description: point.trim() };
}

const ICON_RULES: Array<[RegExp, LucideIcon]> = [
  [/safe/i, ShieldCheck],
  [/group|people|team/i, Users],
  [/sustain|nature|environment|eco/i, Leaf],
  [/authentic|culture|local/i, Compass],
  [/personal|service|care/i, HandHeart],
  [/transport|flight|vehicle/i, Bus],
  [/expert|skill|experience/i, Mountain],
  [/excellen|quality/i, Award],
];

/** Match on the card title first; fall back to its description. */
function iconFor(title: string, description = ''): LucideIcon {
  const match = (text: string) => ICON_RULES.find(([pattern]) => pattern.test(text))?.[1];
  return match(title) ?? match(description) ?? Sparkles;
}

function SectionHeading({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <div className="mb-8 max-w-2xl">
      {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p> : null}
      <h2 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h2>
      {intro ? <p className="mt-3 text-muted-foreground">{intro}</p> : null}
    </div>
  );
}

const SOCIAL_ICONS = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  youtube: YouTubeIcon,
  whatsapp: WhatsAppIcon,
};

function MemberSocials({ member, dark = false }: { member: AdminAboutTeamMember; dark?: boolean }) {
  const links = TEAM_SOCIAL_FIELDS.map(({ key, label }) => ({ key, label, href: member.social?.[key]?.trim() || '' })).filter(
    (link) => link.href && isValidSocialUrl(link.href)
  );
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {links.map(({ key, label, href }) => {
        const Icon = SOCIAL_ICONS[key];
        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${member.name} on ${label}`}
            className={
              dark
                ? 'inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20'
                : 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted'
            }
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function AboutContent({
  about,
  reviews,
  trust,
}: {
  about: AdminAbout | null;
  reviews: SiteReviews | null;
  trust: TrustSummary | null;
}) {
  const text = (value: string | undefined, fallback: string) => value?.trim() || fallback;

  const heroTitle = text(about?.heroTitle, FALLBACK.heroTitle);
  const heroSubtitle = text(about?.heroSubtitle, FALLBACK.heroSubtitle);
  const storyTitle = text(about?.storyTitle, FALLBACK.storyTitle);
  const storyBody = text(about?.storyBody, FALLBACK.storyBody);
  const missionTitle = text(about?.missionTitle, FALLBACK.missionTitle);
  const missionBody = text(about?.missionBody, FALLBACK.missionBody);
  const teamTitle = text(about?.teamTitle, FALLBACK.teamTitle);

  const team = (about?.teamMembers || []).filter((member) => member.name?.trim() && member.role?.trim());
  const founder = team.find((member) => /founder/i.test(member.role)) ?? team[0] ?? null;

  // Value cards from the admin; the porter / load-carrying one gets its own section.
  const highlights = (about?.highlights || [])
    .map((item) => ({ title: item.title.trim(), description: item.description.trim() }))
    .filter((item) => item.title && item.description);
  const causeIndex = highlights.findIndex((item) => /load|porter/i.test(item.title));
  const cause = causeIndex >= 0 ? highlights[causeIndex] : null;
  const values = highlights.filter((_, index) => index !== causeIndex);

  // "Why choose us" points merged with the values into one grid, without duplicates.
  const points = (about?.whyChooseUs || []).map(splitPoint).filter((point) => point.description);
  const seen = new Set<string>();
  const reasons = [...values, ...points]
    .filter((item) => !(cause && /porter/i.test(item.title)))
    .filter((item) => {
      const key = item.title.toLowerCase();
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  const reasonCards = reasons.length > 0 ? reasons : FALLBACK_REASONS;

  const rating = trust?.rating ?? reviews?.averageRating ?? null;
  const reviewCount = trust?.reviewCount ?? reviews?.totalReviewCount ?? null;
  const ratingLabel = rating ? rating.toFixed(1) : SITE_METRICS.googleReviewRating;

  // Reviews that talk about Gele himself, best (5★, longest) first.
  const guideReviews = (reviews?.available ? reviews.reviews : [])
    .filter((review) => review.rating >= 5 && /g(h)?ele/i.test(review.text) && review.text.length > 120)
    .sort((a, b) => b.text.length - a.text.length)
    .slice(0, 3);

  const associations = (about?.associations || []).filter((item) => item.name?.trim() && item.logoUrl?.trim());
  const associationList = associations.length > 0 ? associations : DEFAULT_ASSOCIATIONS;

  const stats = [
    { icon: Mountain, value: SITE_METRICS.founderYearsGuiding, label: `Years in the Himalaya (since ${FOUNDER_SINCE_YEAR})` },
    { icon: Users, value: SITE_METRICS.trekkersGuided, label: 'Trekkers guided by Gele' },
    {
      icon: Star,
      value: `${ratingLabel}/5`,
      label: reviewCount ? `From ${reviewCount} Google reviews` : 'Average Google rating',
    },
    { icon: HandHeart, value: '1 : 1', label: 'One porter for every guest' },
  ];

  return (
    <>
      {/* Hero: the founder's story up front */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {about?.heroImageUrl ? (
          <Image src={about.heroImageUrl} alt="" fill priority sizes="100vw" className="object-cover opacity-25" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/60" />
        <div className="container relative mx-auto grid items-center gap-10 px-4 py-12 md:px-6 md:py-16 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">{heroTitle}</p>
            <h1 className="text-balance text-3xl font-bold leading-tight md:text-5xl">
              From porter to trek leader: {SITE_METRICS.founderYearsGuiding} years in the Himalaya
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/80 md:text-lg">
              {heroSubtitle} Your trek is planned and, most of the time, led by founder {founder?.name || 'Gele Bishokarma'} himself.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={GELE_CALL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
              >
                <CalendarDays className="h-4 w-4" />
                Book a free call with Gele
              </a>
              <Link
                href="/destinations"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Explore treks
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {founder?.imageUrl ? (
            <figure className="relative mx-auto w-full max-w-[17rem] sm:max-w-sm">
              <div className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-white/15 sm:aspect-[4/5]">
                <Image
                  src={founder.imageUrl}
                  alt={`${founder.name}, ${founder.role} at Gele Trekking`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 384px, 90vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="absolute -bottom-4 left-4 right-4 rounded-xl bg-white p-3 text-slate-900 shadow-xl">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Award className="h-3.5 w-3.5" />
                  Recommended Trip Leader · 2016
                </p>
                <p className="mt-0.5 text-sm font-semibold">{founder.name}</p>
                <p className="text-xs text-slate-600">{founder.role}</p>
              </figcaption>
            </figure>
          ) : null}
        </div>
      </section>

      {/* Key numbers */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto grid grid-cols-2 gap-px px-4 py-6 md:grid-cols-4 md:px-6 md:py-8">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-start gap-3 p-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xl font-bold text-foreground md:text-2xl">{value}</p>
                <p className="text-xs text-muted-foreground md:text-sm">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story + timeline */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto grid gap-10 px-4 md:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
          <div>
            <SectionHeading eyebrow="How it started" title={storyTitle} />
            <Prose value={storyBody} className="text-[15px] md:text-base" />
          </div>

          <aside aria-label="Gele’s path" className="h-fit rounded-2xl border border-border bg-muted/30 p-6 md:p-7">
            <p className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Gele’s path</p>
            <ol className="relative space-y-6 border-l-2 border-primary/20 pl-6">
              {TIMELINE.map((step) => (
                <li key={step.title} className="relative">
                  <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-2 border-background bg-primary" aria-hidden="true" />
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">{step.year}</p>
                  <p className="font-semibold text-foreground">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-primary py-14 text-primary-foreground md:py-16">
        <div className="container mx-auto max-w-3xl px-4 text-center md:px-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">{missionTitle}</p>
          <Prose value={missionBody} className="text-lg leading-relaxed md:text-xl [&_p]:text-primary-foreground/90" />
        </div>
      </section>

      {/* Porter welfare cause */}
      {cause ? (
        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-8 rounded-3xl border border-accent/30 bg-accent/5 p-6 md:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Our cause</p>
                <h2 className="text-2xl font-bold text-foreground md:text-3xl">{cause.title}</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {[
                    { icon: Users, label: 'One guest, one porter', text: 'Lighter, safer loads on every trek.' },
                    { icon: ShieldCheck, label: 'Fair working conditions', text: 'Ethical porter practices, always.' },
                  ].map(({ icon: Icon, label, text: detail }) => (
                    <li key={label} className="flex items-start gap-3 rounded-xl bg-background p-4 shadow-sm">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                      <span>
                        <span className="block font-semibold text-foreground">{label}</span>
                        <span className="text-sm text-muted-foreground">{detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <Prose value={cause.description} className="text-[15px] md:text-base" />
            </div>
          </div>
        </section>
      ) : null}

      {/* Why travel with us */}
      <section className={`${cause ? 'pb-14 md:pb-20' : 'py-14 md:py-20'}`}>
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading eyebrow="Why travel with us" title="What you can expect" />
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {reasonCards.map((reason, index) => {
              const Icon = iconFor(reason.title, reason.description);
              return (
                <div key={`${reason.title}-${index}`} className="flex gap-3 rounded-2xl border border-border bg-card p-4 sm:block sm:p-5">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:mb-3 sm:h-10 sm:w-10">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    {reason.title ? <h3 className="font-semibold text-foreground">{reason.title}</h3> : null}
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{reason.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reviews about Gele */}
      {guideReviews.length > 0 ? (
        <section className="border-y border-border bg-muted/30 py-14 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="In trekkers’ words" title="What people say about trekking with Gele" />
              <p className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex text-amber-500" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </span>
                <span>
                  <span className="font-semibold text-foreground">{ratingLabel}/5</span>
                  {reviewCount ? ` from ${reviewCount} reviews` : ''} on Google
                </span>
              </p>
            </div>
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
              {guideReviews.map((review) => (
                <figure key={review.id} className="flex w-[85%] shrink-0 snap-center flex-col rounded-2xl border border-border bg-card p-6 md:w-auto">
                  <Quote className="mb-3 h-6 w-6 text-primary/40" aria-hidden="true" />
                  <blockquote className="line-clamp-[7] flex-1 md:line-clamp-[8] text-sm leading-relaxed text-foreground/90">{review.text}</blockquote>
                  <figcaption className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4 text-sm">
                    <span className="font-semibold text-foreground">{review.name}</span>
                    {review.url ? (
                      <a href={review.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                        Google review <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">Google review</span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Team */}
      {team.length > 0 ? (
        <section id="team" className="scroll-mt-24 py-14 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <SectionHeading
              eyebrow="The people behind your trek"
              title={teamTitle}
              intro="Gele leads most treks himself, supported on the trail by a trusted local crew of porters."
            />
            <div className="grid gap-4 md:grid-cols-2">
              {team.map((member) => (
                <article key={`${member.name}-${member.role}`} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-muted sm:h-24 sm:w-24">
                    {member.imageUrl ? (
                      <Image src={member.imageUrl} alt={`${member.name}, ${member.role}`} fill sizes="96px" className="object-cover" />
                    ) : (
                      <UserRound className="absolute inset-0 m-auto h-10 w-10 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm font-medium text-primary">{member.role}</p>
                    {member.description ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{member.description}</p> : null}
                    <div className="mt-3">
                      <MemberSocials member={member} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Registrations, short form */}
      <section className="border-t border-border bg-muted/20 py-12 md:py-14">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-md">
              <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <BadgeCheck className="h-4 w-4" />
                Legally registered in Nepal
              </p>
              <h2 className="text-xl font-bold text-foreground md:text-2xl">Licensed, registered and a TAAN member</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Company reg. no. 329488/080/081 · TAAN member ID 2540
              </p>
              <Link
                href="/company/registrations-affiliations"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80"
              >
                Verify our registrations <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6" aria-label="Associations">
              {associationList.map((association) => (
                <li key={association.name} className="flex flex-col items-center gap-2 text-center">
                  <span className="flex h-20 w-full items-center justify-center rounded-xl bg-white px-3">
                    <img src={association.logoUrl} alt="" className="h-14 w-auto max-w-[8.5rem] object-contain" loading="lazy" />
                  </span>
                  <span className="text-xs font-medium leading-snug text-muted-foreground">{association.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="rounded-3xl bg-slate-950 px-6 py-10 text-center text-white md:px-12 md:py-14">
            <h2 className="text-balance text-2xl font-bold md:text-3xl">Plan your trek with Gele</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/75">
              Tell us your dates, fitness and interests. Gele will help you choose the right route and prepare with confidence.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a
                href={GELE_CALL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
              >
                <CalendarDays className="h-4 w-4" />
                Book a free 15-min call
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-white hover:bg-[#1ebe5a]"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </a>
              <Link
                href="/plan-my-trek"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-sm font-semibold hover:bg-white/10"
              >
                Plan my trek
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
