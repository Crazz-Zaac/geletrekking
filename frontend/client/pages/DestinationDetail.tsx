import { Layout } from "@/components/Layout";
import { ItineraryTimeline } from "@/components/ItineraryTimeline";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Share2, Facebook, Linkedin, Twitter,
  Calendar, MapPin, TrendingUp, Users, Cloud, Wind,
  Droplets, Thermometer, Eye, Mountain, BedDouble,
  CalendarRange, CircleDollarSign, Compass, Bus,
  ShieldCheck, Download, ChevronDown, CloudSun,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

// ── WMO Weather Codes ─────────────────────────────────────────

const WMO_CODES: Record<number, { desc: string; icon: string }> = {
  0:  { desc: "Clear Sky",          icon: "☀️" },
  1:  { desc: "Mainly Clear",       icon: "🌤️" },
  2:  { desc: "Partly Cloudy",      icon: "⛅" },
  3:  { desc: "Overcast",           icon: "☁️" },
  45: { desc: "Foggy",              icon: "🌫️" },
  48: { desc: "Icy Fog",            icon: "🌫️" },
  51: { desc: "Light Drizzle",      icon: "🌦️" },
  53: { desc: "Drizzle",            icon: "🌦️" },
  55: { desc: "Heavy Drizzle",      icon: "🌧️" },
  61: { desc: "Light Rain",         icon: "🌧️" },
  63: { desc: "Rain",               icon: "🌧️" },
  65: { desc: "Heavy Rain",         icon: "🌧️" },
  71: { desc: "Light Snow",         icon: "🌨️" },
  73: { desc: "Snow",               icon: "❄️" },
  75: { desc: "Heavy Snow",         icon: "❄️" },
  80: { desc: "Light Showers",      icon: "🌦️" },
  81: { desc: "Showers",            icon: "🌧️" },
  82: { desc: "Heavy Showers",      icon: "⛈️" },
  95: { desc: "Thunderstorm",       icon: "⛈️" },
  99: { desc: "Heavy Thunderstorm", icon: "⛈️" },
};

// ── Weather Widget ────────────────────────────────────────────

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  weatherDesc: string;
  weatherIcon: string;
  high: number;
  low: number;
}

const WeatherWidget = ({ locationName }: { locationName: string }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!locationName) return;
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=en&format=json`
        );
        const geoData = await geoRes.json();
        if (!geoData.results?.length) { setError("Location not found"); return; }

        const { latitude, longitude } = geoData.results[0];
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
          `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,visibility` +
          `&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`
        );
        const wd = await weatherRes.json();
        const code = wd.current.weather_code;
        const wmo = WMO_CODES[code] || { desc: "Unknown", icon: "🌡️" };

        setWeather({
          temperature: Math.round(wd.current.temperature_2m),
          feelsLike:   Math.round(wd.current.apparent_temperature),
          humidity:    wd.current.relative_humidity_2m,
          windSpeed:   Math.round(wd.current.wind_speed_10m),
          visibility:  Math.round((wd.current.visibility || 0) / 1000),
          weatherDesc: wmo.desc,
          weatherIcon: wmo.icon,
          high: Math.round(wd.daily.temperature_2m_max[0]),
          low:  Math.round(wd.daily.temperature_2m_min[0]),
        });
      } catch { setError("Failed to load weather data"); }
      finally   { setLoading(false); }
    };
    fetchWeather();
  }, [locationName]);

  if (loading) return (
    <div className="rounded-xl p-6 text-white mb-6 animate-pulse border border-border bg-card">
      <div className="flex items-center gap-2 mb-2">
        <Cloud className="w-5 h-5 text-primary" />
        <span className="font-semibold text-foreground">Current Weather</span>
      </div>
      <p className="text-sm text-muted-foreground">Fetching weather for {locationName}...</p>
    </div>
  );

  if (error || !weather) return (
    <div className="rounded-xl p-6 bg-muted border border-border mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Cloud className="w-5 h-5 text-muted-foreground" />
        <span className="font-semibold text-foreground">Weather</span>
      </div>
      <p className="text-sm text-muted-foreground">{error || "Weather unavailable"}</p>
    </div>
  );

  return (
    <div className="rounded-xl p-6 text-white mb-6 border border-sky-300/40 bg-gradient-to-br from-sky-500/10 via-cyan-500/5 to-indigo-500/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-sky-500" />
          <span className="font-bold text-foreground text-lg">Current Weather</span>
        </div>
        <span className="text-xs text-muted-foreground capitalize">{locationName}</span>
      </div>

      {/* Main */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-5xl font-thin text-foreground leading-none">{weather.temperature}°C</div>
          <div className="text-muted-foreground mt-1 text-sm">{weather.weatherDesc}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Feels like {weather.feelsLike}°C &nbsp;·&nbsp; ↑{weather.high}° ↓{weather.low}°
          </div>
        </div>
        <div className="text-6xl">{weather.weatherIcon}</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
        {[
          { Icon: Droplets,    value: `${weather.humidity}%`,      label: "Humidity"   },
          { Icon: Wind,        value: `${weather.windSpeed} km/h`, label: "Wind"       },
          { Icon: Eye,         value: `${weather.visibility} km`,  label: "Visibility" },
        ].map(({ Icon, value, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <Icon className="w-4 h-4 text-sky-500" />
            <span className="text-sm font-semibold text-foreground">{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-right text-xs text-muted-foreground">Powered by Open-Meteo · Live data</p>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────

function getAltitudeLabel(alt: number) {
  if (alt >= 5000) return "Extreme High Altitude";
  if (alt >= 4000) return "High Altitude";
  if (alt >= 3000) return "Moderate Altitude";
  return "Low Altitude";
}

const DIFF_COLOR: Record<string, string> = {
  Easy:     "text-green-600",
  Moderate: "text-amber-600",
  Hard:     "text-red-600",
};

// ── Main Page ─────────────────────────────────────────────────

export default function DestinationDetail() {
  const { id } = useParams<{ id: string }>();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [expandedDay,   setExpandedDay]   = useState<number | null>(null);

  const { data: trek, isLoading, error } = useQuery({
    queryKey: ["trek", id],
    queryFn: async () => {
      const res = await api.get(`/api/treks/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // ── Loading ──
  if (isLoading) return (
    <Layout>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin" />
      </div>
    </Layout>
  );

  // ── Not found ──
  if (error || !trek) return (
    <Layout>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Trek not found</h1>
          <Link to="/destinations" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Destinations
          </Link>
        </div>
      </div>
    </Layout>
  );

  const shareUrl  = window.location.href;
  const shareText = `Check out ${trek.name} on GELE TREKKING!`;
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter:  `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  const hasValidOffer = trek.has_offer && trek.offer_valid_from && trek.offer_valid_to
    ? new Date() >= new Date(trek.offer_valid_from) && new Date() <= new Date(trek.offer_valid_to)
    : false;

  const weatherLocation = trek.start_point || trek.name || "Nepal";

  const keyInfo = [
    { label: "Duration",      value: `${trek.duration_days} days`,                           Icon: CalendarRange },
    { label: "Difficulty",    value: trek.difficulty,                                         Icon: ShieldCheck   },
    { label: "Max Altitude",  value: trek.max_altitude_meters ? `${trek.max_altitude_meters}m` : "N/A", Icon: Mountain },
    { label: "Best Season",   value: trek.best_season || "N/A",                               Icon: CalendarRange },
    { label: "Altitude Level",value: trek.max_altitude_meters ? getAltitudeLabel(trek.max_altitude_meters) : "N/A", Icon: TrendingUp },
    { label: "Start Point",   value: trek.start_point || "N/A",                               Icon: MapPin        },
    { label: "End Point",     value: trek.end_point   || "N/A",                               Icon: MapPin        },
    { label: "Group Size",    value: trek.group_size_min && trek.group_size_max ? `${trek.group_size_min}–${trek.group_size_max} pax` : "Flexible", Icon: Users },
  ];

  const handleDownloadItinerary = () => {
    if (!trek.itinerary?.length) return;
    const content = [
      `${trek.name} - Detailed Itinerary`,
      `Duration: ${trek.duration_days} days`,
      `Difficulty: ${trek.difficulty}`,
      `Best Season: ${trek.best_season}`,
      "",
      "Day-by-Day Plan",
      "----------------",
      ...trek.itinerary.map((day: any) =>
        `Day ${day.day}: ${day.title}\n${day.description || ""}`
      ),
      "",
      ...(trek.includes?.length ? ["Cost Includes", "-------------", ...trek.includes.map((i: string) => `- ${i}`), ""] : []),
      ...(trek.excludes?.length ? ["Cost Excludes", "-------------", ...trek.excludes.map((i: string) => `- ${i}`)] : []),
    ].join("\n\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${trek.name}-itinerary.txt`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <Layout>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative h-[55vh] min-h-[360px] overflow-hidden">
        {trek.image_url ? (
          <img src={trek.image_url} alt={trek.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
          <div className="max-w-6xl mx-auto space-y-3">
            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              {trek.difficulty && (
                <span className="bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  {trek.difficulty}
                </span>
              )}
              {trek.best_season && (
                <span className="border border-white/50 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {trek.best_season}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {trek.name}
            </h1>
            {trek.overview && (
              <p className="text-white/85 text-lg max-w-3xl line-clamp-2">{trek.overview}</p>
            )}

            {/* Share button */}
            <div className="relative inline-block pt-2">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 bg-accent text-accent-foreground text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-accent/90 transition-colors"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
              {showShareMenu && (
                <div className="absolute top-full left-0 mt-2 bg-card rounded-xl shadow-2xl border border-border overflow-hidden z-10 min-w-[160px]">
                  {[
                    { href: shareLinks.facebook, Icon: Facebook, label: "Facebook" },
                    { href: shareLinks.twitter,  Icon: Twitter,  label: "Twitter"  },
                    { href: shareLinks.linkedin, Icon: Linkedin, label: "LinkedIn" },
                  ].map(({ href, Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors border-b border-border last:border-0"
                    >
                      <Icon className="w-4 h-4" /> {label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── BACK LINK ─────────────────────────────────────────── */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3">
          <Link to="/destinations" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Destinations
          </Link>
        </div>
      </div>

      {/* ── KEY INFO BAR ──────────────────────────────────────── */}
      <section className="border-b border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-7">
          <h2 className="text-lg font-bold text-foreground mb-5">Key Trek Information</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {keyInfo.map(({ label, value, Icon }) => (
              <div key={label} className="bg-card rounded-xl border border-border p-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-primary">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
                </div>
                <span className="text-sm font-bold text-foreground leading-tight">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── LEFT COLUMN ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Special Offer */}
            {hasValidOffer && (
              <div className="rounded-xl p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🎉</span>
                  <h3 className="text-xl font-bold text-foreground">{trek.offer_title}</h3>
                </div>
                <p className="text-muted-foreground">{trek.offer_description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Valid until: {new Date(trek.offer_valid_to).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* About */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-foreground">About this Trek</h2>
              <p className="text-muted-foreground leading-relaxed text-base">{trek.overview}</p>
            </div>

            {/* Highlights */}
            {trek.highlights?.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">Trek Highlights</h2>
                <ul className="space-y-2.5">
                  {trek.highlights.map((h: string, i: number) => (
                    <li key={i} className="flex gap-3 text-muted-foreground">
                      <span className="text-primary font-bold mt-0.5">✓</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Itinerary */}
            {trek.itinerary?.length > 0 && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-3xl font-bold text-foreground">Itinerary Timeline</h2>
                  <button
                    onClick={handleDownloadItinerary}
                    className="inline-flex items-center gap-2 border border-primary/30 text-primary hover:bg-primary/10 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download Itinerary
                  </button>
                </div>

                <div className="relative border-l border-border ml-3 space-y-4">
                  {trek.itinerary.map((day: any) => (
                    <div key={day.day} className="relative pl-8">
                      <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-primary" />
                      <div className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                              Day {day.day}
                            </span>
                            <h3 className="font-bold text-foreground">{day.title}</h3>
                          </div>
                          <button
                            onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 shrink-0"
                          >
                            {expandedDay === day.day ? "Hide" : "Details"}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedDay === day.day ? "rotate-180" : ""}`} />
                          </button>
                        </div>

                        {expandedDay === day.day && day.description && (
                          <p className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                            {day.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2">
                          {day.altitude && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                              <Mountain className="w-3 h-3" /> {day.altitude}m
                            </span>
                          )}
                          {day.distance && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 px-3 py-1 text-xs font-semibold">
                              <MapPin className="w-3 h-3" /> {day.distance}
                            </span>
                          )}
                          {day.accommodation && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 px-3 py-1 text-xs font-semibold">
                              <BedDouble className="w-3 h-3" /> {day.accommodation}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Includes / Excludes */}
            {(trek.includes?.length > 0 || trek.excludes?.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trek.includes?.length > 0 && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-xl font-bold text-foreground mb-4">Cost Includes</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      {trek.includes.map((item: string, i: number) => (
                        <li key={i} className="flex gap-2.5">
                          <span className="text-green-600 font-bold mt-0.5">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {trek.excludes?.length > 0 && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-xl font-bold text-foreground mb-4">Cost Excludes</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      {trek.excludes.map((item: string, i: number) => (
                        <li key={i} className="flex gap-2.5">
                          <span className="text-destructive font-bold mt-0.5">✕</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* FAQs */}
            {trek.faqs?.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">FAQ</h2>
                <div className="space-y-4">
                  {trek.faqs.map((faq: any, i: number) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-5">
                      <h3 className="font-bold text-foreground mb-2">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extra Sections */}
            {trek.extra_sections?.length > 0 && (
              <div className="space-y-6">
                {trek.extra_sections.map((section: any, i: number) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-6">
                    <h2 className="text-2xl font-bold text-foreground mb-3">{section.title}</h2>
                    <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="rounded-xl p-8 text-center bg-primary text-primary-foreground">
              <h3 className="text-2xl font-bold mb-2">Ready to Trek?</h3>
              <p className="text-primary-foreground/80 mb-6">Join us on this incredible adventure</p>
              <a
                href={`mailto:info@geletrekking.com?subject=Trek Inquiry: ${trek.name}`}
                className="inline-block bg-background text-foreground font-semibold px-8 py-3 rounded-lg hover:bg-background/90 transition-colors"
              >
                Book Now
              </a>
            </div>

            {/* Back link */}
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 border border-primary text-primary hover:bg-primary/5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Destinations
            </Link>
          </div>

          {/* ── STICKY SIDEBAR ───────────────────────────────── */}
          <aside className="space-y-5 h-fit lg:sticky lg:top-20">

            {/* Price card */}
            <div className="bg-card rounded-xl border border-border p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <p className="text-sm text-muted-foreground mb-1">Price of the Trek</p>
              <div className="mb-1">
                {hasValidOffer && trek.discounted_price_usd ? (
                  <>
                    <span className="line-through text-muted-foreground text-lg mr-2">${trek.price_usd}</span>
                    <span className="text-4xl font-bold text-primary">${trek.discounted_price_usd}</span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-primary">${trek.price_usd || 0}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-5">Per person · Custom private departures available</p>

              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                {[
                  { Icon: CalendarRange,     text: `${trek.duration_days} days` },
                  { Icon: Mountain,          text: trek.max_altitude_meters ? `${trek.max_altitude_meters}m` : "N/A" },
                  { Icon: Users,             text: trek.group_size_min ? `${trek.group_size_min}–${trek.group_size_max} pax` : "Flexible" },
                  { Icon: CircleDollarSign,  text: "Flexible quote" },
                ].map(({ Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs">{text}</span>
                  </div>
                ))}
              </div>

              <a
                href={`mailto:info@geletrekking.com?subject=Trek Inquiry: ${trek.name}`}
                className="mt-5 flex justify-center items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm w-full"
              >
                Enquire Now
              </a>
            </div>

            {/* Weather widget */}
            <WeatherWidget locationName={weatherLocation} />

            {/* Quick info */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-3">
              <h3 className="font-bold text-foreground">Trek Details</h3>
              {[
                { label: "Difficulty",   value: trek.difficulty,   className: DIFF_COLOR[trek.difficulty] || "" },
                { label: "Duration",     value: `${trek.duration_days} days` },
                { label: "Best Season",  value: trek.best_season   },
                { label: "Start Point",  value: trek.start_point   },
                { label: "End Point",    value: trek.end_point     },
              ].filter(r => r.value).map(({ label, value, className }) => (
                <div key={label} className="flex justify-between items-center text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={`font-semibold text-foreground ${className || ""}`}>{value}</span>
                </div>
              ))}
            </div>

          </aside>
        </div>
      </div>
    </Layout>
  );
}
