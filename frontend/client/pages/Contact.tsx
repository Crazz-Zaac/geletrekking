import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import { MapPin, Phone, Mail, MessageCircle, Clock, Send, ShieldCheck } from "lucide-react";

export default function Contact() {
  const [settings,      setSettings]      = useState<any>(null);
  const [formData,      setFormData]      = useState({ name: "", email: "", phone: "", trek: "", message: "" });
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    api.get("/api/settings").then(r => setSettings(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");
    try {
      await api.post("/api/contact", {
        name:    formData.name,
        email:   formData.email,
        message: formData.message,
      });
      setSubmitMessage("success");
      setFormData({ name: "", email: "", phone: "", trek: "", message: "" });
    } catch {
      setSubmitMessage("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const phone       = settings?.phone    || "+977 9841 392186";
  const email       = settings?.email    || "info@geletrekking.com";
  const address     = settings?.address  || "Tarkeshowr-7, Kathmandu, Nepal";
  const siteName    = settings?.siteName || "GELE TREKKING";
  const phoneTel    = phone.replace(/[\s\-]/g, "");
  const whatsappNum = phoneTel.replace("+", "");

  const contactInfo = [
    {
      Icon: Mail,
      label: "Email",
      value: email,
      href: `mailto:${email}`,
      description: "Best for itinerary planning and custom quotes",
    },
    {
      Icon: Phone,
      label: "Phone",
      value: phone,
      href: `tel:${phoneTel}`,
      description: "24/7 emergency contact available",
    },
    {
      Icon: MessageCircle,
      label: "WhatsApp / Viber",
      value: phone,
      href: `https://wa.me/${whatsappNum}`,
      description: "Tap to open WhatsApp",
    },
    {
      Icon: MapPin,
      label: "Office",
      value: address,
      href: "https://www.google.com/maps/dir//27.758888,85.308333",
      description: "In-person consultation by prior appointment",
    },
  ];

  return (
    <Layout>
      <div className="bg-background min-h-screen">

        {/* ── HERO ──────────────────────────────────────────────── */}
        <section className="border-b border-border bg-gradient-to-br from-primary/10 via-accent/5 to-background pt-12 pb-10 px-6 md:px-10">
          <div className="max-w-6xl mx-auto text-center space-y-3">
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              Plan Your Trek with Confidence
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Contact Our Trek Experts
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Get route recommendations, difficulty guidance, and transparent pricing.
              We usually respond within 24 hours.
            </p>
          </div>
        </section>

        {/* ── MAIN ──────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* ── LEFT: Form ─────────────────────────────────────── */}
            <div className="lg:col-span-3 space-y-5">

              {/* Form card */}
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
                <div className="mb-7">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    Send Us Your Inquiry
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Share your preferred trek, travel dates, and questions — we'll send a personalised plan.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-300">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Fast response within 24h
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                      <MessageCircle className="w-3.5 h-3.5" />
                      No-obligation consultation
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Success / Error */}
                  {submitMessage === "success" && (
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-sm font-medium">
                      ✅ Message sent! We'll get back to you within 24 hours.
                    </div>
                  )}
                  {submitMessage === "error" && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium">
                      ❌ Something went wrong. Please try again.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-foreground">
                        Full Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text" required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-foreground">
                        Email Address <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="email" required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-foreground">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+977 98XXXXXXXX"
                        className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-foreground">
                        Trek Interest
                      </label>
                      <select
                        value={formData.trek}
                        onChange={e => setFormData({ ...formData, trek: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-muted/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                      >
                        <option value="">Select…</option>
                        <option>Everest Base Camp</option>
                        <option>Annapurna Circuit</option>
                        <option>Langtang Valley</option>
                        <option>Other / Not sure</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-foreground">
                      Message <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      required rows={6}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us your preferred trek, travel month, group size, and any questions…"
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold px-8 py-2.5 rounded-lg text-sm transition-colors w-full md:w-auto"
                  >
                    {isSubmitting ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".3"/>
                        <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {isSubmitting ? "Sending…" : "Send Inquiry"}
                  </button>

                  <p className="text-xs text-muted-foreground">🔒 Your information is private and secure</p>
                </form>
              </div>
            </div>

            {/* ── RIGHT: Info ────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">

              {/* Contact info cards */}
              {contactInfo.map(({ Icon, label, value, href, description }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border hover:shadow-md hover:border-primary/30 transition-all group block"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{value}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </a>
              ))}

              {/* Office hours */}
              <div className="flex items-center gap-4 p-5 bg-card rounded-xl border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Office Hours (NPT)</p>
                  <p className="text-sm font-bold text-foreground">Sunday – Saturday: 9:00 AM – 6:00 PM</p>
                  <p className="text-xs text-muted-foreground">P.O. Box: 7265</p>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-xl overflow-hidden border border-border">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d220.89674534448734!2d85.30833333333334!3d27.75888888888889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjfCsDQ1JzMyLjAiTiA4NcKwMTgnMzAuMCJF!5e0!3m2!1sen!2s!4v1706000000000"
                  width="100%" height="220"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${siteName} Location`}
                />
              </div>

              {/* Directions button */}
              <a
                href="https://www.google.com/maps/dir//27.758888,85.308333"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-colors"
              >
                🧭 Get Directions
              </a>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
