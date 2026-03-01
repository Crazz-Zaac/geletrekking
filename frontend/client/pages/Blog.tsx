import { Layout } from "@/components/Layout";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useMemo } from "react";

const POLAROID_CONFIGS = [
  { width: 180, height: 210, top: "12%", left: "5%",  rotate: -8 },
  { width: 160, height: 190, top: "8%",  left: "22%", rotate:  5 },
  { width: 190, height: 220, top: "50%", left: "3%",  rotate:  6 },
  { width: 155, height: 185, top: "55%", left: "20%", rotate: -4 },
  { width: 170, height: 200, top: "10%", right: "8%", rotate:  7 },
  { width: 165, height: 195, top: "52%", right: "6%", rotate: -6 },
];

export default function Blog() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["public-blogs"],
    queryFn: async () => (await api.get("/api/blogs")).data,
  });

  // Pick up to 6 posts with cover images for polaroids
  const polaroidPosts = useMemo(() => {
    if (!posts) return [];
    return posts.filter((p: any) => p.coverImage).slice(0, 6);
  }, [posts]);

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Outfit:wght@300;400;500;600;700&family=Caveat:wght@400;600;700&display=swap');

        .blog-container { font-family: 'Outfit', sans-serif; }
        .blog-title     { font-family: 'Playfair Display', serif; }
        .blog-handwrite { font-family: 'Caveat', cursive; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollDown {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(8px); }
        }

        .animate-fade-in-up { animation: fadeInUp 0.7s ease-out both; }
        .scroll-bounce      { animation: scrollDown 2s ease-in-out infinite; }

        /* Polaroid card */
        .polaroid-card {
          position: absolute;
          background: white;
          padding: 10px 10px 38px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.55);
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.4s ease,
                      z-index 0s;
          cursor: pointer;
        }
        .polaroid-card:hover {
          box-shadow: 0 32px 80px rgba(0,0,0,0.65);
          z-index: 30 !important;
        }
        .polaroid-card img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }
        .polaroid-caption {
          text-align: center; margin-top: 6px;
          font-family: 'Caveat', cursive;
          font-size: 14px; color: #555; line-height: 1.2;
        }

        /* Blog post card */
        .blog-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .blog-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 48px -12px rgba(0,0,0,0.18);
        }
        .blog-card-img {
          transition: transform 0.6s ease;
        }
        .blog-card:hover .blog-card-img {
          transform: scale(1.06);
        }
      `}</style>

      <div className="min-h-screen blog-container bg-white">

        {/* ══════════════ POLAROID HERO ══════════════ */}
        <section
          className="relative overflow-hidden flex items-center justify-center"
          style={{
            minHeight: "100vh",
            background: "linear-gradient(160deg, #1a0a2e 0%, #0d1117 50%, #1a0505 100%)",
          }}
        >
          {/* Ambient glows */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: "15%", left: "8%", width: 320, height: 320,
              background: "radial-gradient(circle, rgba(244,114,182,0.12) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              bottom: "10%", right: "12%", width: 280, height: 280,
              background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: "40%", left: "40%", width: 400, height: 400,
              background: "radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)",
            }}
          />

          {/* Scattered polaroids */}
          {POLAROID_CONFIGS.map((cfg, i) => {
            const post = polaroidPosts[i];
            const posStyle: React.CSSProperties = {
              width:   cfg.width,
              height:  cfg.height,
              top:     cfg.top,
              left:    (cfg as any).left,
              right:   (cfg as any).right,
              transform:       `rotate(${cfg.rotate}deg)`,
              ["--base-rotate" as any]: `rotate(${cfg.rotate}deg)`,
              zIndex: 10 + i,
              animationDelay: `${i * 0.15}s`,
            };

            return (
              <div
                key={i}
                className="polaroid-card animate-fade-in-up"
                style={posStyle}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform =
                    `rotate(${cfg.rotate}deg) scale(1.1) translateY(-10px)`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform =
                    `rotate(${cfg.rotate}deg)`;
                }}
              >
                {post?.coverImage ? (
                  <img src={post.coverImage} alt={post.title || ""} />
                ) : (
                  <div
                    style={{
                      width: "100%", height: "100%",
                      background: `linear-gradient(135deg,
                        ${["#667eea,#764ba2","#f093fb,#f5576c","#4facfe,#00f2fe",
                           "#43e97b,#38f9d7","#fa709a,#fee140","#a18cd1,#fbc2eb"][i]})`,
                    }}
                  />
                )}
                <div className="polaroid-caption blog-handwrite">
                  {post?.title?.slice(0, 20) || ["Annapurna Base","Dawn at EBC","Langtang Valley","Local Culture","Prayer Flags","Summit Views"][i]}
                </div>
              </div>
            );
          })}

          {/* Centre text */}
          <div
            className="relative z-20 text-center px-6"
            style={{ maxWidth: 480 }}
          >
            <p
              className="animate-fade-in-up"
              style={{
                animationDelay: "0.1s",
                fontSize: 11, letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(244,114,182,0.85)",
                marginBottom: 14,
              }}
            >
              Gele Trekking
            </p>
            <h1
              className="blog-title animate-fade-in-up"
              style={{
                animationDelay: "0.2s",
                fontSize: "clamp(56px, 10vw, 100px)",
                fontWeight: 900, lineHeight: 1,
                color: "white",
                marginBottom: 16,
                textShadow: "0 4px 40px rgba(0,0,0,0.6)",
              }}
            >
              Travel<br />Blog
            </h1>
            <p
              className="animate-fade-in-up"
              style={{
                animationDelay: "0.3s",
                fontSize: 15,
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.7,
                marginBottom: 32,
              }}
            >
              Memories pinned from every trail we've walked
            </p>

            {/* Scroll indicator */}
            <div
              className="scroll-bounce animate-fade-in-up flex flex-col items-center gap-2"
              style={{ animationDelay: "0.5s" }}
            >
              <div
                style={{
                  width: 1, height: 40,
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)",
                }}
              />
              <span
                style={{
                  fontSize: 10, letterSpacing: "0.2em",
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "uppercase",
                }}
              >
                Scroll to read
              </span>
            </div>
          </div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0" style={{ lineHeight: 0, zIndex: 25 }}>
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ height: 55, width: "100%", display: "block" }}>
              <path d="M0,40 C360,0 1080,60 1440,20 L1440,60 L0,60 Z" fill="white" />
            </svg>
          </div>
        </section>
        {/* ════════════════════════════════════════════ */}

        {/* Blog Posts Grid */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">

            {/* Section header */}
            <div className="mb-12 flex items-end justify-between flex-wrap gap-4">
              <div>
                <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#ec4899", fontWeight: 600, marginBottom: 6 }}>
                  Latest Stories
                </p>
                <h2 className="blog-title" style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, color: "#111" }}>
                  From the Trail
                </h2>
              </div>
              {posts && posts.length > 0 && (
                <p style={{ fontSize: 14, color: "#9ca3af" }}>
                  {posts.length} {posts.length === 1 ? "post" : "posts"}
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <div
                  style={{
                    width: 48, height: 48, borderRadius: "50%",
                    border: "4px solid #ec4899",
                    borderTopColor: "transparent",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(posts || []).map((p: any, idx: number) => (
                  <article
                    key={p._id}
                    className="blog-card rounded-2xl bg-white overflow-hidden animate-fade-in-up"
                    style={{
                      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                      animationDelay: `${idx * 0.07}s`,
                    }}
                  >
                    {/* Cover image */}
                    <div className="overflow-hidden" style={{ height: 200 }}>
                      {p.coverImage ? (
                        <img
                          src={p.coverImage}
                          alt={p.title}
                          className="blog-card-img w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{
                            background: `linear-gradient(135deg,
                              ${["#667eea,#764ba2","#f093fb,#f5576c","#4facfe,#00f2fe",
                                 "#43e97b,#38f9d7","#fa709a,#fee140","#a18cd1,#fbc2eb"][idx % 6]})`,
                          }}
                        />
                      )}
                    </div>

                    <div style={{ padding: "20px 24px 24px" }}>
                      <div
                        className="flex items-center gap-2"
                        style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10 }}
                      >
                        <Calendar size={14} />
                        <span>
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                        </span>
                      </div>
                      <h2
                        className="blog-title"
                        style={{
                          fontSize: 18, fontWeight: 700,
                          color: "#111", lineHeight: 1.4,
                          marginBottom: 10,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {p.title}
                      </h2>
                      <p
                        style={{
                          fontSize: 14, color: "#6b7280",
                          lineHeight: 1.65, marginBottom: 16,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {p.excerpt || p.content?.slice(0, 140) + "..."}
                      </p>
                      <Link
                        to={`/blog/${p.slug}`}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          fontSize: 13, fontWeight: 600,
                          color: "#ec4899",
                          textDecoration: "none",
                          transition: "gap 0.2s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.gap = "10px")}
                        onMouseLeave={e => (e.currentTarget.style.gap = "6px")}
                      >
                        Read More →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && (!posts || posts.length === 0) && (
              <div className="text-center py-20">
                <div
                  className="inline-block p-10 rounded-3xl"
                  style={{ background: "#fdf2f8", border: "1px solid #fce7f3" }}
                >
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✍️</div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 6 }}>No posts yet</p>
                  <p style={{ fontSize: 14, color: "#9ca3af" }}>Stories from the trail are coming soon.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}