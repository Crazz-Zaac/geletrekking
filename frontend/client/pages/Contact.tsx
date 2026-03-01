import { Layout } from "@/components/Layout";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/apiClient";

// ── Brand tokens ──────────────────────────────────────────────
const C = {
  orange : "#e84610",
  gold   : "#fed81e",
  forest : "#2a3a19",
  navy   : "#282c62",
  cream  : "#fff9f0",
  light  : "#fdf6ec",
};

// ── Tiny helpers ──────────────────────────────────────────────
function InfoRow({ icon, label, value, href }: {
  icon: React.ReactNode; label: string; value: string; href?: string;
}) {
  const content = (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 14,
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14, padding: "13px 18px",
        transition: "all .25s", cursor: href ? "pointer" : "default",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.background = "rgba(254,216,30,.08)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(254,216,30,.3)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateX(5px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.1)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateX(0)";
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: `linear-gradient(135deg,${C.orange},${C.gold})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 12px rgba(232,70,16,.35)`,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".14em", color: "rgba(254,216,30,.6)", marginBottom: 2, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 14, color: "rgba(255,249,240,.9)", fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href} style={{ textDecoration: "none" }}>{content}</a> : content;
}

function FormField({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: ".06em", textTransform: "uppercase" }}>{label}</label>
      {children}
    </div>
  );
}

// ── Input / Textarea shared style ─────────────────────────────
const inputStyle = (focus: boolean, borderClr: string): React.CSSProperties => ({
  padding: "11px 14px",
  border: `1.5px solid ${focus ? borderClr : "#e8ddd0"}`,
  borderRadius: 10,
  fontFamily: "'Outfit', sans-serif",
  fontSize: 13,
  color: "#1a0a00",
  outline: "none",
  background: focus ? "#fff" : "#fdf6ec",
  transition: "all .2s",
  width: "100%",
  boxSizing: "border-box" as const,
});

function FocusInput({ borderClr, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { borderClr: string }) {
  const [f, setF] = useState(false);
  return <input {...props} style={inputStyle(f, borderClr)} onFocus={() => setF(true)} onBlur={() => setF(false)} />;
}
function FocusTextarea({ borderClr, rows = 5, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { borderClr: string }) {
  const [f, setF] = useState(false);
  return <textarea {...props} rows={rows} style={{ ...inputStyle(f, borderClr), resize: "none" }} onFocus={() => setF(true)} onBlur={() => setF(false)} />;
}

// ── Card component ────────────────────────────────────────────
function ContactCard({ icon, label, value, bg }: { icon: string; label: string; value: string; bg: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 16,
        background: "#fff", borderRadius: 18,
        padding: "18px 20px", marginBottom: 12,
        border: "1.5px solid #f0e8de",
        boxShadow: hov ? "0 12px 32px rgba(232,70,16,.12)" : "0 3px 12px rgba(0,0,0,.06)",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        transition: "all .25s",
      }}
    >
      <div style={{ width: 46, height: 46, borderRadius: 13, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", color: C.orange, fontWeight: 700, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1a0a00" }}>{value}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
export default function Contact() {
  const [settings, setSettings]       = useState<any>(null);
  const [formData, setFormData]       = useState({ name: "", email: "", phone: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [letterVisible, setLetterVisible] = useState(false);

  useEffect(() => {
    api.get("/api/settings").then(r => setSettings(r.data)).catch(console.error);
    // Trigger envelope animation on mount
    const t1 = setTimeout(() => setEnvelopeOpen(true), 600);
    const t2 = setTimeout(() => setLetterVisible(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");
    try {
      await api.post("/api/contact", { name: formData.name, email: formData.email, message: formData.message });
      setSubmitMessage("Thank you! We'll get back to you soon.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      setSubmitMessage(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const siteName    = settings?.siteName    || "GELE TREKKING";
  const phone       = settings?.phone       || "+977 98XXXXXXXX";
  const email       = settings?.email       || "info@geletrekking.com";
  const address     = settings?.address     || "Thamel, Kathmandu, Nepal";
  const phoneTel    = phone.replace(/[\s\-]/g, "");
  const whatsappTel = phoneTel.replace("+", "");

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Outfit:wght@300;400;500;600;700&display=swap');

        .contact-page { font-family:'Outfit',sans-serif; }
        .contact-title { font-family:'Playfair Display',serif; }

        @keyframes envelopeDrop {
          from { opacity:0; transform:translateY(-50px) scale(.88); }
          to   { opacity:1; transform:translateY(0)      scale(1); }
        }
        @keyframes flapOpen {
          from { transform:rotateX(0deg); }
          to   { transform:rotateX(-180deg); }
        }
        @keyframes letterRise {
          from { transform:translateY(60px); opacity:0; }
          to   { transform:translateY(-30px); opacity:1; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes floatEnv {
          0%,100% { transform:translateY(0); }
          50%     { transform:translateY(-10px); }
        }
        @keyframes shimmer {
          0%   { background-position:-400px 0; }
          100% { background-position:400px 0; }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes particleDrift {
          0%,100% { transform:translateY(0) translateX(0); opacity:.4; }
          50%     { transform:translateY(-18px) translateX(6px); opacity:.9; }
        }

        .fu   { animation:fadeUp .65s ease-out both; }
        .float-env { animation:floatEnv 5s ease-in-out infinite; }

        /* Envelope 3-D flap */
        .env-scene   { perspective:900px; }
        .env-flap-wrap { transform-style:preserve-3d; transform-origin:top center; transition:transform 1.1s cubic-bezier(.4,0,.2,1); }
        .env-flap-wrap.open { transform:rotateX(-180deg); }

        /* Hover lift on info chips */
        .chip-hover { transition:all .25s; }
        .chip-hover:hover { transform:translateX(5px); }

        /* Smooth form inputs */
        input::placeholder, textarea::placeholder { color:#c4a882; }

        /* Submit btn */
        .submit-btn {
          width:100%; padding:14px; border:none; border-radius:13px;
          background:linear-gradient(135deg,${C.orange},#c73a0a);
          color:white; font-weight:700; font-size:15px;
          cursor:pointer; letter-spacing:.03em;
          box-shadow:0 4px 20px rgba(232,70,16,.4);
          transition:all .25s; display:flex; align-items:center; justify-content:center; gap:8px;
          font-family:'Outfit',sans-serif;
        }
        .submit-btn:hover:not(:disabled) {
          background:linear-gradient(135deg,#ff5a20,${C.orange});
          box-shadow:0 8px 28px rgba(232,70,16,.55);
          transform:translateY(-2px);
        }
        .submit-btn:disabled { opacity:.65; cursor:not-allowed; }

        /* CTA section */
        .cta-btn-white {
          padding:13px 28px; background:white; border:none; border-radius:12px;
          color:${C.navy}; font-weight:700; font-size:14px; cursor:pointer;
          transition:all .2s; font-family:'Outfit',sans-serif;
          box-shadow:0 4px 16px rgba(0,0,0,.15);
        }
        .cta-btn-white:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.2); }
        .cta-btn-outline {
          padding:13px 28px; background:rgba(255,255,255,.1); border:1.5px solid rgba(255,255,255,.3);
          backdrop-filter:blur(8px); border-radius:12px;
          color:white; font-weight:600; font-size:14px; cursor:pointer;
          transition:all .2s; font-family:'Outfit',sans-serif;
        }
        .cta-btn-outline:hover { background:rgba(255,255,255,.18); border-color:rgba(255,255,255,.55); }
      `}</style>

      <div className="contact-page" style={{ background: C.cream, minHeight: "100vh" }}>

        {/* ══════════════════════════════════════════════
            HERO — ENVELOPE UNFOLD
        ══════════════════════════════════════════════ */}
        <section style={{
          minHeight: "100vh", paddingTop: 60,
          background: `linear-gradient(160deg, ${C.navy} 0%, #1c2050 40%, #1a2a10 80%, ${C.forest} 100%)`,
          position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>

          {/* Star-like particles */}
          {Array.from({ length: 55 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width:  i % 6 === 0 ? 2.5 : 1.5,
              height: i % 6 === 0 ? 2.5 : 1.5,
              borderRadius: "50%",
              background: i % 3 === 0 ? C.gold : "white",
              top:  `${(i * 41 + 7)  % 90}%`,
              left: `${(i * 67 + 13) % 100}%`,
              opacity: .08 + (i % 5) * .06,
              animation: `particleDrift ${4 + (i % 5)}s ease-in-out ${(i % 4) * .8}s infinite`,
            }} />
          ))}

          {/* Big ambient glows */}
          <div style={{ position:"absolute", top:"10%", left:"5%", width:380, height:380, borderRadius:"50%", background:`radial-gradient(circle,rgba(232,70,16,.12) 0%,transparent 65%)`, pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"5%", right:"8%", width:320, height:320, borderRadius:"50%", background:`radial-gradient(circle,rgba(254,216,30,.08) 0%,transparent 65%)`, pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:"40%", left:"45%", width:500, height:300, borderRadius:"50%", background:`radial-gradient(ellipse,rgba(42,58,25,.4) 0%,transparent 70%)`, pointerEvents:"none" }} />

          {/* ── ENVELOPE ── */}
          <div
            className="env-scene float-env"
            style={{
              animation: "envelopeDrop .9s cubic-bezier(.34,1.56,.64,1) .2s both, floatEnv 6s ease-in-out 2s infinite",
              position: "relative", zIndex: 10,
            }}
          >
            {/* Envelope body */}
            <div style={{
              width: "min(520px, 88vw)", height: 300,
              position: "relative",
              animation: "none",
            }}>

              {/* Back panel */}
              <div style={{
                position: "absolute", inset: 0,
                background: `linear-gradient(160deg,#1e2d5a,#182214)`,
                borderRadius: 12,
                border: "1px solid rgba(254,216,30,.15)",
                boxShadow: "0 40px 80px rgba(0,0,0,.55), 0 0 0 1px rgba(254,216,30,.06)",
              }} />

              {/* Left & right bottom triangles */}
              <div style={{
                position: "absolute", bottom: 0, left: 0,
                width: "50%", height: "55%",
                background: `linear-gradient(135deg,#16213a,#1a2c14)`,
                clipPath: "polygon(0 100%,100% 100%,100% 0)",
              }} />
              <div style={{
                position: "absolute", bottom: 0, right: 0,
                width: "50%", height: "55%",
                background: `linear-gradient(135deg,#1a2c14,#16213a)`,
                clipPath: "polygon(0 100%,0 0,100% 100%)",
              }} />

              {/* Flap — rotates open */}
              <div className={`env-flap-wrap${envelopeOpen ? " open" : ""}`} style={{ position: "absolute", top: 0, left: 0, right: 0, height: "52%" }}>
                <div style={{
                  width: "100%", height: "100%",
                  background: `linear-gradient(160deg,#253565,#1c3020)`,
                  clipPath: "polygon(0 0,50% 100%,100% 0)",
                  borderRadius: "12px 12px 0 0",
                  borderTop: `2px solid rgba(254,216,30,.2)`,
                  boxShadow: "inset 0 -4px 16px rgba(0,0,0,.3)",
                }}>
                  {/* Wax seal on flap */}
                  <div style={{
                    position: "absolute", top: "22%", left: "50%",
                    transform: "translateX(-50%)",
                    width: 44, height: 44, borderRadius: "50%",
                    background: `radial-gradient(circle,${C.orange},#c73a0a)`,
                    boxShadow: `0 4px 14px rgba(232,70,16,.5)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, zIndex: 2,
                  }}>
                    🏔️
                  </div>
                </div>
              </div>

              {/* Gold decorative lines on envelope */}
              <div style={{ position:"absolute", bottom:12, left:"50%", transform:"translateX(-50%)", display:"flex", gap:4, alignItems:"center" }}>
                <div style={{ width:30, height:1, background:`linear-gradient(to right,transparent,${C.gold})` }} />
                <div style={{ width:5, height:5, borderRadius:"50%", background:C.gold, opacity:.6 }} />
                <div style={{ width:30, height:1, background:`linear-gradient(to left,transparent,${C.gold})` }} />
              </div>

              {/* ── LETTER rising out ── */}
              <div style={{
                position: "absolute", top: "8%", left: "8%", right: "8%",
                background: C.cream,
                borderRadius: 8,
                padding: "22px 26px",
                boxShadow: "0 8px 40px rgba(0,0,0,.4)",
                zIndex: envelopeOpen ? 20 : 5,
                transition: "transform 1s cubic-bezier(.34,1.2,.64,1) .3s, opacity .6s .3s",
                transform: letterVisible ? "translateY(-58%)" : "translateY(10%)",
                opacity: letterVisible ? 1 : 0,
              }}>
                {/* Letter header */}
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <div style={{
                    width:34, height:34, borderRadius:"50%",
                    background:`linear-gradient(135deg,${C.orange},${C.gold})`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:`0 3px 10px rgba(232,70,16,.35)`, flexShrink:0,
                  }}>
                    <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:900, color:C.navy }}>A letter from {siteName}</div>
                    <div style={{ fontSize:10, color:"#9a7a5a", letterSpacing:".08em" }}>Tarkeshowr-7, Kathmandu Nepal </div>
                  </div>
                </div>
                {/* Ruled lines */}
                {[0,1,2].map(i => (
                  <div key={i} style={{ height:1, background:"#f0e4d0", marginBottom:8, borderRadius:1 }} />
                ))}
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:11, fontStyle:"italic", color:"#7a5a3a", lineHeight:1.6 }}>
                  We're always here to help plan<br/>your Himalayan adventure…
                </div>
              </div>
            </div>
          </div>

          {/* ── Hero text below envelope ── */}
          <div style={{ position:"relative", zIndex:10, textAlign:"center", padding:"0 20px", marginTop: 120 }}>
            <p className="fu" style={{
              animationDelay:".5s",
              fontSize:11, letterSpacing:".28em", textTransform:"uppercase",
              color:"rgba(254,216,30,.8)", fontWeight:700, marginBottom:14,
            }}>
              {siteName}
            </p>
            <h1 className="contact-title fu" style={{
              animationDelay:".6s",
              fontSize:"clamp(44px,7vw,80px)", fontWeight:900, color:"white",
              lineHeight:1, marginBottom:14,
              textShadow:"0 4px 30px rgba(0,0,0,.5)",
            }}>
              Get in <span style={{ color:C.gold }}>Touch</span>
            </h1>
            <p className="fu" style={{
              animationDelay:".75s",
              fontSize:16, color:"rgba(255,249,240,.5)",
              maxWidth:420, margin:"0 auto 32px", lineHeight:1.7,
            }}>
              Drop us a line — we reply within 24 hours and we'd love to plan your next trek together.
            </p>
            <div className="fu" style={{ animationDelay:".9s", display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
              <button
                onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior:"smooth" })}
                style={{
                  padding:"13px 28px", borderRadius:13,
                  background:`linear-gradient(135deg,${C.orange},#c73a0a)`,
                  color:"white", fontWeight:700, fontSize:14, border:"none", cursor:"pointer",
                  boxShadow:`0 4px 20px rgba(232,70,16,.45)`,
                  transition:"all .25s", fontFamily:"'Outfit',sans-serif",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform="translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow=`0 8px 28px rgba(232,70,16,.6)`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform="translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow=`0 4px 20px rgba(232,70,16,.45)`; }}
              >
                ✉️ Send a Message
              </button>
              {phone && (
                <a
                  href={`https://wa.me/${whatsappTel}`} target="_blank" rel="noopener noreferrer"
                  style={{
                    padding:"13px 28px", borderRadius:13,
                    background:"rgba(255,255,255,.08)", border:"1.5px solid rgba(254,216,30,.3)",
                    color:C.gold, fontWeight:600, fontSize:14,
                    backdropFilter:"blur(8px)", textDecoration:"none",
                    transition:"all .25s", fontFamily:"'Outfit',sans-serif",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="rgba(254,216,30,.12)"; (e.currentTarget as HTMLElement).style.borderColor="rgba(254,216,30,.6)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="rgba(255,255,255,.08)"; (e.currentTarget as HTMLElement).style.borderColor="rgba(254,216,30,.3)"; }}
                >
                  💬 WhatsApp Us
                </a>
              )}
            </div>
          </div>

          {/* Quick info chips row */}
          <div className="fu" style={{
            animationDelay:"1.1s",
            position:"relative", zIndex:10,
            display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center",
            padding:"32px 20px 0", maxWidth:640,
          }}>
            {[
              { icon:"📍", text: address },
              { icon:"📞", text: phone },
              { icon:"✉️", text: email },
            ].map((c, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:8,
                background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)",
                backdropFilter:"blur(8px)", borderRadius:24, padding:"7px 14px",
                fontSize:12, color:"rgba(255,249,240,.7)",
              }}>
                <span>{c.icon}</span><span>{c.text}</span>
              </div>
            ))}
          </div>

          {/* Bottom wave */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, lineHeight:0, zIndex:20 }}>
            <svg viewBox="0 0 1440 65" preserveAspectRatio="none" style={{ height:60, width:"100%", display:"block" }}>
              <path d="M0,40 C360,0 1080,65 1440,25 L1440,65 L0,65 Z" fill={C.cream} />
            </svg>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            FORM + INFO SECTION
        ══════════════════════════════════════════════ */}
        <section id="contact-form" style={{ padding:"80px 0", background:C.cream }}>
          <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 32px" }}>

            {/* Section heading */}
            <div style={{ marginBottom:48 }}>
              <p style={{ fontSize:11, textTransform:"uppercase", letterSpacing:".22em", color:C.orange, fontWeight:700, marginBottom:8 }}>
                Get In Touch
              </p>
              <h2 className="contact-title" style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:900, color:C.navy, lineHeight:1.1 }}>
                Send Us a Message
              </h2>
              <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:12 }}>
                <div style={{ width:40, height:3, borderRadius:2, background:`linear-gradient(to right,${C.orange},${C.gold})` }} />
                <div style={{ width:8, height:8, borderRadius:"50%", background:C.gold }} />
                <div style={{ width:20, height:3, borderRadius:2, background:`linear-gradient(to right,${C.gold},transparent)` }} />
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:40 }}>

              {/* ── FORM ── */}
              <div style={{
                background:"white", borderRadius:24, padding:36,
                boxShadow:"0 8px 36px rgba(232,70,16,.1)",
                border:`1.5px solid #f0e4d4`,
              }}>
                <h3 className="contact-title" style={{ fontSize:20, fontWeight:700, color:C.navy, marginBottom:22 }}>
                  Your Message
                </h3>
                <form onSubmit={handleSubmit}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div style={{ gridColumn:"1/-1" }}>
                      <FormField label="Full Name *" accent={C.orange}>
                        <FocusInput borderClr={C.orange} type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name:e.target.value })} placeholder="Your full name" />
                      </FormField>
                    </div>
                    <FormField label="Email *" accent={C.orange}>
                      <FocusInput borderClr={C.orange} type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email:e.target.value })} placeholder="your@email.com" />
                    </FormField>
                    <FormField label="Phone" accent={C.forest}>
                      <FocusInput borderClr={C.forest} type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone:e.target.value })} placeholder="+977 98XXXXXXXX" />
                    </FormField>
                    <div style={{ gridColumn:"1/-1" }}>
                      <FormField label="Message *" accent={C.navy}>
                        <FocusTextarea borderClr={C.navy} required value={formData.message} onChange={e => setFormData({ ...formData, message:e.target.value })} placeholder="Tell us about your trekking plans, preferred dates, group size…" rows={6} />
                      </FormField>
                    </div>
                  </div>

                  {submitMessage && (
                    <div style={{
                      padding:"12px 16px", borderRadius:10, fontSize:13, marginBottom:14,
                      background: submitMessage.includes("Thank") ? "#f0fdf4" : "#fff1f2",
                      color:       submitMessage.includes("Thank") ? "#166534"  : "#9f1239",
                      border:      `1px solid ${submitMessage.includes("Thank") ? "#bbf7d0" : "#fecdd3"}`,
                    }}>
                      {submitMessage}
                    </div>
                  )}

                  <button type="submit" disabled={isSubmitting} className="submit-btn">
                    {isSubmitting ? (
                      <>
                        <svg style={{ width:18, height:18, animation:"spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity=".3"/>
                          <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                        Sending…
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                        Send Message
                      </>
                    )}
                  </button>
                  <p style={{ textAlign:"center", fontSize:12, color:"#9a8070", marginTop:10 }}>We typically respond within 24 hours</p>
                </form>
              </div>

              {/* ── INFO SIDE ── */}
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>

                {/* Dark info card with brand gradient */}
                <div style={{
                  background:`linear-gradient(145deg,${C.navy},#1c2050,${C.forest})`,
                  borderRadius:24, padding:"28px 24px", marginBottom:16,
                  boxShadow:"0 12px 40px rgba(40,44,98,.25)",
                  border:"1px solid rgba(254,216,30,.1)",
                }}>
                  <h3 className="contact-title" style={{ fontSize:18, fontWeight:700, color:"white", marginBottom:6 }}>
                    Visit Our Office
                  </h3>
                  <p style={{ fontSize:13, color:"rgba(255,249,240,.45)", marginBottom:20, lineHeight:1.6 }}>
                    We're in Thamel — the trekker's hub of Kathmandu.
                  </p>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <InfoRow icon={<svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} label="Address" value={address} />
                    {email && <InfoRow icon={<svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>} label="Email" value={email} href={`mailto:${email}`} />}
                    {phone && <InfoRow icon={<svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>} label="Phone" value={phone} href={`tel:${phoneTel}`} />}
                    {phone && <InfoRow icon={<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style={{ color:"white" }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>} label="WhatsApp / Viber" value={phone} href={`https://wa.me/${whatsappTel}`} />}
                  </div>
                </div>

                {/* Map embed */}
                <div style={{ borderRadius:20, overflow:"hidden", border:`1.5px solid #f0e4d4`, boxShadow:"0 4px 20px rgba(0,0,0,.08)", marginBottom:14 }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d220.89674534448734!2d85.30833333333334!3d27.75888888888889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjfCsDQ1JzMyLjAiTiA4NcKwMTgnMzAuMCJF!5e0!3m2!1sen!2s!4v1706000000000"
                    width="100%" height="200" style={{ border:0, display:"block" }}
                    allowFullScreen loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${siteName} Office`}
                  />
                </div>

                {/* Directions button */}
                <a
                  href="https://www.google.com/maps/dir//27.758888888888890,85.308333333333340"
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    padding:"13px 24px", borderRadius:13,
                    background:`linear-gradient(135deg,${C.forest},#1e2e10)`,
                    color:"white", fontWeight:700, fontSize:14,
                    textDecoration:"none", fontFamily:"'Outfit',sans-serif",
                    boxShadow:`0 4px 18px rgba(42,58,25,.35)`,
                    transition:"all .25s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform="translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow="0 8px 28px rgba(42,58,25,.5)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform="translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow=`0 4px 18px rgba(42,58,25,.35)`; }}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                  🧭 Get Directions
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            CTA FOOTER STRIP
        ══════════════════════════════════════════════ */}
        <section style={{
          padding:"64px 32px",
          background:`linear-gradient(135deg,${C.navy} 0%,#1e2460 40%,${C.forest} 100%)`,
          textAlign:"center", position:"relative", overflow:"hidden",
        }}>
          {/* Gold accent line top */}
          <div style={{ position:"absolute", top:0, left:"10%", right:"10%", height:2, background:`linear-gradient(to right,transparent,${C.gold},transparent)`, opacity:.4 }} />

          <p style={{ fontSize:11, letterSpacing:".22em", textTransform:"uppercase", color:`rgba(254,216,30,.7)`, fontWeight:700, marginBottom:12 }}>
            Ready to Trek?
          </p>
          <h2 className="contact-title" style={{ fontSize:"clamp(26px,4vw,42px)", color:"white", fontWeight:900, marginBottom:12 }}>
            Start Your Adventure Today
          </h2>
          <p style={{ fontSize:16, color:"rgba(255,249,240,.5)", maxWidth:500, margin:"0 auto 32px", lineHeight:1.7 }}>
            Join thousands of trekkers who have explored the Himalayas with {siteName}
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            {phone && (
              <a href={`tel:${phoneTel}`} style={{ textDecoration:"none" }}>
                <button className="cta-btn-white">
                  📞 Call Now
                </button>
              </a>
            )}
            {phone && (
              <a href={`https://wa.me/${whatsappTel}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                <button className="cta-btn-outline">
                  💬 WhatsApp
                </button>
              </a>
            )}
          </div>

          {/* Decorative bottom dots */}
          <div style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", display:"flex", gap:6, paddingBottom:16 }}>
            {[C.orange, C.gold, C.forest].map((c, i) => (
              <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:c, opacity:.5 }} />
            ))}
          </div>
        </section>

      </div>
    </Layout>
  );
}
