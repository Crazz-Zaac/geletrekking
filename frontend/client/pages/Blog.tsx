import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export default function Blog() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["public-blogs"],
    queryFn: async () => (await api.get("/api/blogs")).data,
  });

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Inter:wght@400;500;600&display=swap');

        .blog-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          cursor: pointer;
        }
        .blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.12) !important;
        }
        .blog-card:hover .blog-card-img img {
          transform: scale(1.05);
        }
        .blog-card-img img {
          transition: transform 0.5s ease;
        }
        .read-btn {
          transition: background 0.2s ease, color 0.2s ease;
        }
        .read-btn:hover {
          background: #111 !important;
          color: #fff !important;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ background: "#faf8f5", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

        {/* ══════════════ HERO ══════════════ */}
        <section style={{ borderBottom: "1px solid #e8e2d8", padding: "100px 40px 28px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              letterSpacing: "0.3em",
              color: "#a0856a",
              textTransform: "uppercase",
              margin: "0 0 10px",
            }}>
              ✦ Gele Trekking · Nepal
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(36px, 5vw, 52px)",
                fontWeight: 900,
                color: "#111",
                margin: 0,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}>
                Travel{" "}
                <em style={{ fontStyle: "italic", fontWeight: 400 }}>Stories</em>
              </h1>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: "#888",
                maxWidth: 280,
                lineHeight: 1.65,
                margin: 0,
              }}>
                Tales, tips and guides from every trail we have walked across Nepal.
              </p>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 36, marginTop: 28, paddingTop: 20, borderTop: "1px solid #e8e2d8" }}>
              {[
                { value: posts?.length || "—", label: "Articles" },
                { value: "4",                   label: "Categories" },
                { value: "Weekly",              label: "New Posts" },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#111" }}>{s.value}</div>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#aaa", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ POSTS GRID ══════════════ */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 40px 80px" }}>

          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "3px solid #e8e2d8", borderTopColor: "#111",
                animation: "spin 0.8s linear infinite",
              }} />
            </div>

          ) : !posts || posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✍️</div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#111", marginBottom: 8 }}>No posts yet.</p>
              <p style={{ fontSize: 14, color: "#aaa" }}>Stories from the trail are coming soon.</p>
            </div>

          ) : (
            <>
              {/* Count */}
              <p style={{ fontSize: 12, color: "#aaa", marginBottom: 24 }}>
                {posts.length} {posts.length === 1 ? "article" : "articles"}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2 }}>
                {posts.map((p: any) => (
                  <Link
                    key={p._id}
                    to={`/blog/${p.slug}`}
                    className="blog-card"
                    style={{
                      display: "block",
                      background: "#fff",
                      border: "1px solid #e8e2d8",
                      overflow: "hidden",
                      textDecoration: "none",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                    }}
                  >
                    {/* Image */}
                    <div
                      className="blog-card-img"
                      style={{ height: 210, overflow: "hidden", position: "relative", background: "#e8e2d8" }}
                    >
                      {p.coverImage ? (
                        <img
                          src={p.coverImage}
                          alt={p.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 40, opacity: 0.2 }}>✍️</span>
                        </div>
                      )}

                      {/* Category badge */}
                      {p.category && (
                        <div style={{
                          position: "absolute", top: 14, left: 14,
                          background: "#fff",
                          padding: "3px 10px",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "#a0856a",
                          fontFamily: "'Inter', sans-serif",
                        }}>
                          {p.category}
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div style={{ padding: "20px 22px 22px" }}>

                      {/* Date */}
                      {p.createdAt && (
                        <p style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11,
                          color: "#bbb",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          margin: "0 0 8px",
                        }}>
                          {new Date(p.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </p>
                      )}

                      {/* Title */}
                      <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#111",
                        margin: "0 0 10px",
                        lineHeight: 1.25,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {p.title}
                      </h2>

                      {/* Excerpt */}
                      {(p.excerpt || p.content) && (
                        <p style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13,
                          color: "#777",
                          lineHeight: 1.65,
                          margin: "0 0 18px",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>
                          {p.excerpt || p.content?.slice(0, 140) + "..."}
                        </p>
                      )}

                      {/* Footer */}
                      <div style={{
                        paddingTop: 16,
                        borderTop: "1px solid #f0ede8",
                        display: "flex",
                        justifyContent: "flex-end",
                      }}>
                        <button
                          className="read-btn"
                          style={{
                            padding: "8px 20px",
                            border: "1px solid #111",
                            borderRadius: 0,
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            background: "transparent",
                            color: "#111",
                            cursor: "pointer",
                          }}
                        >
                          Read More
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
