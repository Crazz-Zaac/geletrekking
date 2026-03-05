import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import { MapPin, Phone, Mail, MessageCircle, Clock, Send } from "lucide-react";

export default function Contact() {
  const [settings, setSettings] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", trek: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        name: formData.name,
        email: formData.email,
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

  const phone       = settings?.phone   || "+977 9841 392186";
  const email       = settings?.email   || "info@geletrekking.com";
  const address     = settings?.address || "Tarkeshowr-7, Kathmandu, Nepal";
  const siteName    = settings?.siteName || "GELE TREKKING";
  const phoneTel    = phone.replace(/[\s\-]/g, "");
  const whatsappNum = phoneTel.replace("+", "");

  const infoItems = [
    {
      icon: <MapPin className="w-5 h-5 text-white" />,
      label: "Address",
      value: address,
      sub: "P.O. Box: 7265",
    },
    {
      icon: <Phone className="w-5 h-5 text-white" />,
      label: "Phone / Direct Call",
      value: phone,
      sub: "24/7 Emergency Contact",
      href: `tel:${phoneTel}`,
    },
    {
      icon: <MessageCircle className="w-5 h-5 text-white" />,
      label: "WhatsApp / Viber",
      value: phone,
      sub: "Tap to open WhatsApp",
      href: `https://wa.me/${whatsappNum}`,
    },
    {
      icon: <Mail className="w-5 h-5 text-white" />,
      label: "Email",
      value: email,
      href: `mailto:${email}`,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          {/* Page heading */}
          <div className="mb-12">
            <p className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-2">
              {siteName}
            </p>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Contact Us</h1>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 rounded-full bg-orange-500" />
              <div className="h-1 w-4 rounded-full bg-orange-200" />
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* ── LEFT: Info ── */}
            <div className="space-y-4">
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                We're based in Kathmandu and always happy to help plan your Himalayan adventure.
                Reach us any way you prefer — we respond within 24 hours.
              </p>

              {/* Info cards */}
              {infoItems.map((item, i) => {
                const inner = (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-400 shadow-sm group-hover:scale-105 transition-transform">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-orange-500 mb-0.5">{item.label}</p>
                      <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                      {item.sub && <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>}
                    </div>
                  </div>
                );
                return item.href ? (
                  <a key={i} href={item.href} target={item.href.startsWith("http") ? "_blank" : "_self"} rel="noopener noreferrer" className="block">
                    {inner}
                  </a>
                ) : inner;
              })}

              {/* Working hours */}
              <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl text-white">
                <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-0.5">Working Hours</p>
                  <p className="text-sm text-gray-200">9:00 AM – 6:00 PM &nbsp;·&nbsp; Sunday to Saturday</p>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d220.89674534448734!2d85.30833333333334!3d27.75888888888889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjfCsDQ1JzMyLjAiTiA4NcKwMTgnMzAuMCJF!5e0!3m2!1sen!2s!4v1706000000000"
                  width="100%" height="200" style={{ border: 0, display: "block" }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${siteName} Location`}
                />
              </div>

              <a
                href={`https://www.google.com/maps/dir//27.758888,85.308333`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold transition-colors"
              >
                🧭 Get Directions
              </a>
            </div>

            {/* ── RIGHT: Form ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Send Us a Message</h2>
              <p className="text-xs text-gray-400 mb-6">We'll get back to you within 24 hours.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-orange-500 mb-1.5">Full Name *</label>
                    <input
                      type="text" required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-400 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-orange-500 mb-1.5">Email *</label>
                    <input
                      type="email" required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+977 98XXXXXXXX"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-400 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Trek Interest</label>
                    <select
                      value={formData.trek}
                      onChange={e => setFormData({ ...formData, trek: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-400 focus:outline-none transition-colors"
                    >
                      <option value="">Select…</option>
                      <option>Everest Base Camp</option>
                      <option>Annapurna Circuit</option>
                      <option>Langtang Valley</option>
                      <option>Other / Not sure</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Message *</label>
                  <textarea
                    required rows={5}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us your plans, preferred dates, group size…"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-400 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {submitMessage === "success" && (
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                    ✅ Message sent! We'll get back to you soon.
                  </div>
                )}
                {submitMessage === "error" && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                    ❌ Something went wrong. Please try again.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-sm transition-colors"
                >
                  {isSubmitting ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity=".3"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isSubmitting ? "Sending…" : "Send Message"}
                </button>
                <p className="text-center text-xs text-gray-400">🔒 Your information is private and secure</p>
              </form>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
