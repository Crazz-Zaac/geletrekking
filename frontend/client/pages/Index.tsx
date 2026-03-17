import { Layout } from "@/components/Layout";
import { useHero } from "@/hooks/useHero";
import { Link } from "react-router-dom";
import {
  ArrowRight, Loader2, Star,
  Shield, Users, Leaf, Award, Clock, MapPin
} from "lucide-react";
import { useEffect, useState } from "react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getField = (obj: any, ...fieldNames: string[]): any => {
  for (const field of fieldNames) {
    if (obj[field] !== undefined && obj[field] !== null && obj[field] !== '') return obj[field];
  }
  return null;
};

const getTrekImage = (trek: any): string => {
  const f = getField(trek, 'image_url', 'images', 'image', 'imageUrl', 'coverImage', 'thumbnail', 'photo', 'photos', 'img', 'picture');
  if (Array.isArray(f) && f.length > 0) return f[0];
  if (typeof f === 'string' && f.trim()) return f;
  return "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop";
};

const getTrekName       = (t: any) => getField(t, 'name', 'title', 'trekName', 'packageName') || 'Unnamed Trek';
const getTrekDifficulty = (t: any) => { const d = getField(t, 'difficulty', 'level', 'difficultyLevel') || 'Moderate'; return d.charAt(0).toUpperCase() + d.slice(1).toLowerCase(); };
const getTrekDuration   = (t: any) => { const d = getField(t, 'duration', 'days', 'length', 'tripDuration', 'numberOfDays'); if (!d) return 'N/A'; if (typeof d === 'string') return d; if (typeof d === 'number') return `${d} Days`; return 'N/A'; };
const getTrekRating     = (t: any) => { const r = getField(t, 'rating', 'averageRating', 'stars'); return (typeof r === 'number' && r > 0) ? r : 5; };

// ─── Static data ─────────────────────────────────────────────────────────────

const whyUsReasons = [
  { Icon: Shield,  title: 'Safety First',         description: 'NMA-certified guides trained in wilderness first aid and altitude sickness management. We carry emergency oxygen on every high-altitude trek.' },
  { Icon: Users,   title: 'Expert Local Guides',   description: 'Our experienced Sherpa and Nepali guides are born in the mountains — their knowledge, warmth, and passion make all the difference.' },
  { Icon: Leaf,    title: 'Responsible Tourism',   description: 'We follow Leave No Trace principles, support porter welfare standards, and reinvest in local community development projects.' },
  { Icon: Award,   title: 'Licensed & Trusted',    description: 'Registered with the Nepal Tourism Board, TAAN member, and fully insured. Over 500+ five-star reviews from trekkers worldwide.' },
  { Icon: Clock,   title: 'Flexible Itineraries',  description: 'Every trek can be customized to your schedule, fitness level, and interests. Private departures available on any date.' },
  { Icon: MapPin,  title: 'All-Inclusive Service', description: 'From airport pickup to permits, accommodation, and guides — we handle every detail so you can focus on the mountains.' },
];

const statsBar = [
  { value: '500+', label: 'Successful Treks' },
  { value: '50+',  label: 'Expert Guides' },
  { value: '30+',  label: 'Countries Served' },
  { value: '15+',  label: 'Years Experience' },
  { value: '4.9★', label: 'Average Rating' },
];

const experienceStats = [
  { number: '25+',    label: 'Years Of Experience',                icon: '📅' },
  { number: '60+',    label: 'Best Destinations',                   icon: '🗺️' },
  { number: '3,210+', label: 'Satisfied Trekkers',                  icon: '👥' },
  { number: '40+',    label: 'Countries of International Trekkers', icon: '🌍' },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function Index() {
  const { data: hero } = useHero();

  const [treks,        setTreks]        = useState<any[]>([]);
  const [gallery,      setGallery]      = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [treksRes, galleryRes, testimonialsRes] = await Promise.all([
          fetch(`${API_URL}/api/treks`),
          fetch(`${API_URL}/api/gallery`),
          fetch(`${API_URL}/api/testimonials`),
        ]);
        if (treksRes.ok)        { const d = await treksRes.json();        setTreks((d.treks || d || []).slice(0, 3)); }
        if (galleryRes.ok)      { const d = await galleryRes.json();      setGallery((d.images || d || []).slice(0, 6)); }
        if (testimonialsRes.ok) { const d = await testimonialsRes.json(); setTestimonials((d.testimonials || d || []).slice(0, 5)); }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  return (
    <Layout>

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.7)), url("${hero?.backgroundImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop'}")`,
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-accent font-semibold text-sm uppercase tracking-[0.2em] mb-5">
            Nepal's Premier Trekking Company
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            {hero?.title || (
              <>Trek the World's<br /><span className="text-accent">Greatest</span> Mountains</>
            )}
          </h1>
          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            {hero?.subtitle || "Expert-guided trekking adventures in Nepal. Everest, Annapurna, Langtang and beyond — crafted for unforgettable Himalayan experiences."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/destinations"
              className="flex items-center gap-2 bg-accent text-accent-foreground font-semibold px-7 py-3.5 rounded-xl hover:bg-accent/90 transition-colors text-base"
            >
              Explore Treks <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-colors text-base"
            >
              Plan My Trek
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-white/70 text-sm">
            {['500+ Treks Completed', '15+ Years Experience', 'Licensed & Insured'].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {s}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/60 text-xs">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── 2. STATS BAR ────────────────────────────────────────────────── */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
            {statsBar.map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="text-3xl font-bold text-accent">{s.value}</span>
                <span className="text-xs font-medium text-primary-foreground/70 mt-1 uppercase tracking-wide">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. FEATURED TREKS ───────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Hand-Picked Adventures</p>
            <h2 className="text-4xl font-bold text-foreground mb-4">Featured Treks</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Explore our most popular and breathtaking trekking adventures across the Himalayas</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>
          ) : treks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {treks.map((trek) => (
                <Link
                  key={trek._id}
                  to={`/destination/${trek._id}`}
                  className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-border"
                >
                  <div className="relative overflow-hidden h-56">
                    <img
                      src={getTrekImage(trek)}
                      alt={getTrekName(trek)}
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      {getTrekDifficulty(trek)}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {getTrekName(trek)}
                    </h3>
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <span>{getTrekDuration(trek)}</span>
                      <span className="flex items-center gap-0.5 text-accent">
                        {[...Array(Math.round(getTrekRating(trek)))].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-primary font-semibold text-sm">
                      Learn More <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-20">No featured destinations available yet.</p>
          )}

          <div className="text-center mt-12">
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              View All Treks <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. WHY US ───────────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2.5">Why Choose Us</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Trek With Confidence</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              With 15+ years of experience guiding international trekkers through the Himalayas, we deliver safe, memorable, and responsibly run adventures.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyUsReasons.map(({ Icon, title, description }) => (
              <div key={title} className="flex flex-col gap-3 bg-card p-5 rounded-2xl border border-border hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. GALLERY ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Visual Inspiration</p>
            <h2 className="text-4xl font-bold text-foreground mb-4">Stunning Destinations</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Get inspired by our most breathtaking trek destinations</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>
          ) : gallery.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {gallery.map((photo) => (
                <div key={photo._id} className="relative overflow-hidden rounded-2xl h-64 group cursor-pointer border border-border">
                  <img
                    src={photo.imageUrl || photo.image || photo.url}
                    alt={photo.title || photo.name || 'Gallery Image'}
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"; }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-4 text-white">
                      <p className="font-semibold">{photo.title || photo.name || 'Beautiful View'}</p>
                      {photo.description && <p className="text-sm text-white/70 mt-1 line-clamp-2">{photo.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-20">No gallery images available yet.</p>
          )}

          <div className="text-center mt-12">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              View Full Gallery <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. EXPERIENCE STATS ─────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Our Experience</h2>
          <p className="text-primary-foreground/70 mb-16 max-w-2xl mx-auto">
            Join thousands of adventurers who have discovered the world's most beautiful destinations
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {experienceStats.map((s) => (
              <div key={s.label} className="p-8 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-colors">
                <div className="text-5xl mb-4">{s.icon}</div>
                <div className="text-4xl font-bold text-accent mb-2">{s.number}</div>
                <div className="text-primary-foreground/70 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Real Stories</p>
            <h2 className="text-4xl font-bold text-foreground mb-4">What Our Adventurers Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Real stories from people who've explored the world with us</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>
          ) : testimonials.length > 0 ? (
            <div className="flex overflow-x-auto gap-6 pb-4 [scrollbar-width:none]">
              {testimonials.map((t) => (
                <div key={t._id} className="flex-shrink-0 w-80 bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border">
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-5 italic text-sm leading-relaxed">
                    "{t.text || t.message || t.review}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {(t.name || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{t.name || 'Anonymous'}</p>
                      <p className="text-xs text-muted-foreground">{t.location || 'Location not specified'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-20">No testimonials available yet.</p>
          )}

          <div className="text-center mt-12">
            <Link
              to="/testimonials"
              className="inline-flex items-center gap-2 border border-primary text-primary hover:bg-primary/5 px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Read More Reviews <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. BOOKING CTA ──────────────────────────────────────────────── */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-primary-foreground/70 text-sm font-semibold uppercase tracking-widest mb-3">Start Your Journey</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready for Your Himalayan Adventure?</h2>
          <p className="text-primary-foreground/80 text-base md:text-lg max-w-2xl mx-auto mb-8">
            Join thousands of adventurers who have discovered Nepal's magic with our expert guides. Book your dream trek today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/destinations"
              className="inline-flex items-center justify-center gap-2 bg-background text-foreground font-semibold px-8 py-3.5 rounded-xl hover:bg-background/90 transition-colors"
            >
              Browse All Treks
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 border border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-foreground/20 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

    </Layout>
  );
}
