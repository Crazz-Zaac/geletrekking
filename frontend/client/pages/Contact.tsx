import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";

export default function Contact() {
  const [settings, setSettings] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    api.get("/api/settings")
      .then((res) => setSettings(res.data))
      .catch((err) => console.error("Failed to load settings:", err));
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
      setSubmitMessage("Thank you! We'll get back to you soon.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error: any) {
      setSubmitMessage(error?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const siteName    = settings?.siteName || "GELE TREKKING";
  const phone       = settings?.phone    || "";
  const email       = settings?.email    || "";
  const address     = settings?.address  || "";
  const phoneTel    = phone.replace(/[\s\-]/g, "");
  const whatsappTel = phoneTel.replace("+", "");

  return (
    <Layout>
      <div className="min-h-screen bg-white">

        {/* Header */}
        <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 to-teal-50">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Get in touch with {siteName} for your next adventure in the Himalayas.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

              {/* Left — Contact Form */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input type="text" required value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none transition"
                      placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input type="email" required value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none transition"
                      placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none transition"
                      placeholder="+977 98XXXXXXXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                    <textarea required value={formData.message} rows={8}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none resize-none transition"
                      placeholder="Tell us about your trekking plans, preferred dates, group size..." />
                  </div>

                  {submitMessage && (
                    <div className={`p-4 rounded-lg text-sm ${submitMessage.includes("Thank") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                      {submitMessage}
                    </div>
                  )}

                  {/* ── Send Message Button — Forest Green gradient ── */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      padding: "14px 24px",
                      borderRadius: "12px",
                      border: "none",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      background: isSubmitting
                        ? "linear-gradient(135deg, #86efac, #4ade80)"
                        : "linear-gradient(135deg, #16a34a, #15803d, #166534)",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "16px",
                      letterSpacing: "0.03em",
                      boxShadow: isSubmitting
                        ? "none"
                        : "0 4px 20px rgba(22,163,74,0.45), 0 2px 8px rgba(0,0,0,0.12)",
                      transition: "all 0.25s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "linear-gradient(135deg, #22c55e, #16a34a, #15803d)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                          "0 6px 28px rgba(22,163,74,0.6), 0 2px 10px rgba(0,0,0,0.15)";
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "linear-gradient(135deg, #16a34a, #15803d, #166534)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                          "0 4px 20px rgba(22,163,74,0.45), 0 2px 8px rgba(0,0,0,0.12)";
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <svg style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                          <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send Message
                      </>
                    )}
                  </button>

                  <p className="text-sm text-gray-500 text-center">We typically respond within 24 hours</p>
                </form>
              </div>

              {/* Right — Map + Info */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Visit Our Office</h2>

                <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 mb-6">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d220.89674534448734!2d85.30833333333334!3d27.75888888888889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjfCsDQ1JzMyLjAiTiA4NcKwMTgnMzAuMCJF!5e0!3m2!1sen!2s!4v1706000000000!5m2!1sen!2s"
                    width="100%" height="380" style={{ border: 0 }}
                    allowFullScreen loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${siteName} Office Location`} />
                </div>

                <div className="space-y-3">

                  {address && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</p>
                        <p className="text-gray-800 text-sm whitespace-pre-line">{address}</p>
                      </div>
                    </div>
                  )}

                  {email && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                        <a href={`mailto:${email}`} className="text-blue-600 hover:underline text-sm">{email}</a>
                      </div>
                    </div>
                  )}

                  {phone && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                        <a href={`tel:${phoneTel}`} className="text-blue-600 hover:underline text-sm">{phone}</a>
                      </div>
                    </div>
                  )}

                  {phone && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">WhatsApp / Viber</p>
                        <a href={`https://wa.me/${whatsappTel}`} target="_blank" rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm">{phone}</a>
                      </div>
                    </div>
                  )}

                  {settings?.social && Object.entries(settings.social).some(([, v]) => v) && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Follow Us</p>
                        <div className="flex flex-wrap gap-3">
                          {Object.entries(settings.social)
                            .filter(([, val]) => val)
                            .map(([key, val]) => (
                              <a key={key} href={val as string} target="_blank" rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm capitalize font-medium">{key}</a>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Get Directions Button — Forest Green gradient ── */}
                  <a
                    href="https://www.google.com/maps/dir//27.758888888888890,85.308333333333340"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "14px 24px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #16a34a, #15803d, #166534)",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "16px",
                      letterSpacing: "0.03em",
                      textDecoration: "none",
                      boxShadow: "0 4px 20px rgba(22,163,74,0.45), 0 2px 8px rgba(0,0,0,0.12)",
                      transition: "all 0.25s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "linear-gradient(135deg, #22c55e, #16a34a, #15803d)";
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                        "0 6px 28px rgba(22,163,74,0.6), 0 2px 10px rgba(0,0,0,0.15)";
                      (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "linear-gradient(135deg, #16a34a, #15803d, #166534)";
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                        "0 4px 20px rgba(22,163,74,0.45), 0 2px 8px rgba(0,0,0,0.12)";
                      (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                    }}
                  >
                    <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Get Directions
                  </a>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-br from-blue-600 to-teal-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Adventure?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied trekkers who have explored the Himalayas with {siteName}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {phone && (
                <a href={`tel:${phoneTel}`}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Now
                </a>
              )}
              {phone && (
                <a href={`https://wa.me/${whatsappTel}`} target="_blank" rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}
