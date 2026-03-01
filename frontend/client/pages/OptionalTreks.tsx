import { Layout } from "@/components/Layout";
import { Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export default function OptionalTreks() {
  const { data: treks, isLoading } = useQuery({
    queryKey: ["optional-treks"],
    queryFn: async () => {
      const response = await api.get("/api/treks");
      return response.data;
    },
  });

  const optionalTreks = (treks || []).filter(
    (trek: any) => trek.is_optional && trek.is_active
  );

  return (
    <Layout>
      <div className="min-h-screen" style={{ background: "#0f172a" }}>

        {/* ══════════════ HERO ══════════════ */}
        <section
          className="relative overflow-hidden pt-32 pb-20"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f4c3a 100%)",
            minHeight: "420px",
          }}
        >
          {/* Stars */}
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width:  i % 5 === 0 ? 2 : 1,
                height: i % 5 === 0 ? 2 : 1,
                top:  `${(i * 37 + 11) % 90}%`,
                left: `${(i * 53 + 7)  % 100}%`,
                opacity: 0.15 + (i % 4) * 0.15,
              }}
            />
          ))}

          {/* Glowing orbs */}
          <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full blur-3xl"
            style={{ background: "rgba(13,148,136,0.12)" }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl"
            style={{ background: "rgba(15,76,58,0.2)" }} />
          <div className="absolute top-20 right-10 w-48 h-48 rounded-full blur-3xl"
            style={{ background: "rgba(251,191,36,0.06)" }} />

          <div className="relative z-10 container mx-auto px-6 text-center">
            <p className="text-xs uppercase tracking-[0.35em] font-semibold mb-4"
              style={{ color: "#5eead4" }}>
              ✦ Gele Trekking
            </p>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Optional{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(90deg, #fbbf24, #f97316)",
                }}
              >
                Activities
              </span>
            </h1>
            <p className="text-lg font-light max-w-xl mx-auto mb-10"
              style={{ color: "#94a3b8" }}>
              Enhance your adventure with our curated trekking experiences — from cultural immersions to wellness retreats.
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-10 flex-wrap">
              {[
                { value: optionalTreks.length || "12+", label: "Activities" },
                { value: "7",                            label: "Max Days" },
                { value: "All",                          label: "Skill Levels" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-black" style={{ color: "#fbbf24" }}>
                    {stat.value}
                  </div>
                  <div className="text-xs uppercase tracking-widest mt-1"
                    style={{ color: "#64748b" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0" style={{ lineHeight: 0 }}>
            <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none" style={{ height: 50 }}>
              <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#0f172a" />
            </svg>
          </div>
        </section>

        {/* ══════════════ TREKS GRID ══════════════ */}
        <section className="py-16" style={{ background: "#0f172a" }}>
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div
                  className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
                  style={{ borderColor: "#0d9488", borderTopColor: "transparent" }}
                />
              </div>
            ) : optionalTreks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-4">🏔️</div>
                <p className="text-lg font-semibold mb-2" style={{ color: "#e2e8f0" }}>
                  No optional activities available at the moment.
                </p>
                <p className="text-sm mb-6" style={{ color: "#64748b" }}>
                  Check back later or explore our main destinations.
                </p>
                <Link
                  to="/destinations"
                  className="px-6 py-3 rounded-xl font-semibold text-white transition-colors"
                  style={{ background: "linear-gradient(90deg,#0d9488,#0f766e)" }}
                >
                  View Main Destinations
                </Link>
              </div>
            ) : (
              <>
                {/* Count label */}
                <p className="mb-8 text-sm" style={{ color: "#64748b" }}>
                  Showing{" "}
                  <span style={{ color: "#5eead4" }} className="font-semibold">
                    {optionalTreks.length}
                  </span>{" "}
                  optional {optionalTreks.length === 1 ? "activity" : "activities"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {optionalTreks.map((trek: any) => (
                    <div
                      key={trek._id}
                      className="group rounded-2xl overflow-hidden transition-all duration-300"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        backdropFilter: "blur(4px)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(13,148,136,0.4)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(13,148,136,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(255,255,255,0.08)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
                      }}
                    >
                      {/* Image */}
                      <div className="h-52 overflow-hidden"
                        style={{ background: "linear-gradient(135deg,#1e3a5f,#0f4c3a)" }}>
                        {trek.image_url ? (
                          <img
                            src={trek.image_url}
                            alt={trek.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-5xl opacity-30">🏔️</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h2
                          className="text-xl font-bold mb-2 transition-colors"
                          style={{ color: "#f1f5f9" }}
                        >
                          {trek.name}
                        </h2>
                        <p className="text-sm leading-relaxed mb-4 line-clamp-3"
                          style={{ color: "#94a3b8" }}>
                          {trek.overview || "Explore this amazing trekking adventure."}
                        </p>

                        {/* Trek Details */}
                        <div className="flex items-center justify-between text-sm mb-4 flex-wrap gap-2">
                          {trek.duration_days > 0 && (
                            <span className="flex items-center gap-1" style={{ color: "#5eead4" }}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {trek.duration_days} {trek.duration_days === 1 ? "day" : "days"}
                            </span>
                          )}

                          {trek.difficulty && (
                            <span
                              className="px-2 py-1 rounded-full text-xs font-semibold"
                              style={{
                                background:
                                  trek.difficulty === "Hard"
                                    ? "rgba(239,68,68,0.15)"
                                    : trek.difficulty === "Moderate"
                                    ? "rgba(249,115,22,0.15)"
                                    : "rgba(34,197,94,0.15)",
                                color:
                                  trek.difficulty === "Hard"
                                    ? "#fca5a5"
                                    : trek.difficulty === "Moderate"
                                    ? "#fdba74"
                                    : "#86efac",
                              }}
                            >
                              {trek.difficulty}
                            </span>
                          )}

                          {trek.price_usd > 0 && (
                            <span className="font-bold text-lg" style={{ color: "#fbbf24" }}>
                              ${trek.price_usd}
                            </span>
                          )}
                        </div>

                        {/* Divider */}
                        <div className="mb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <Link
                            to={`/optional-trek/${trek._id}`}
                            className="inline-flex items-center gap-1 text-sm font-semibold transition-colors"
                            style={{ color: "#5eead4" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#2dd4bf")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#5eead4")}
                          >
                            View Details →
                          </Link>

                          <div className="flex items-center gap-3">
                            {[
                              { Icon: Share2,   title: "Share" },
                              { Icon: Facebook, title: "Facebook" },
                              { Icon: Twitter,  title: "Twitter" },
                              { Icon: Linkedin, title: "LinkedIn" },
                            ].map(({ Icon, title }, i) => (
                              <button
                                key={i}
                                title={title}
                                className="transition-colors"
                                style={{ color: "#475569" }}
                                onMouseEnter={(e) =>
                                  ((e.currentTarget as HTMLButtonElement).style.color = "#5eead4")
                                }
                                onMouseLeave={(e) =>
                                  ((e.currentTarget as HTMLButtonElement).style.color = "#475569")
                                }
                              >
                                <Icon size={16} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}