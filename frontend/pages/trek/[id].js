"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const COLORS = {
  primary: "#e84610",
  gold: "#fed81e",
  greenDark: "#2a3a19",
  navy: "#282c62",
  bgDark: "#0a0f14",
};

export default function TrekDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [trek, setTrek] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchTrek() {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/treks/${id}`);
        setTrek(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    fetchTrek();
  }, [id]);

  if (loading) return <div className="text-white p-10">Loading…</div>;
  if (!trek) return <div className="text-red-400 p-10">Trek not found.</div>;

  return (
    <div
      style={{
        background: COLORS.bgDark,
        color: "white",
        minHeight: "100vh",
        paddingBottom: "50px",
      }}
    >
      {/* HERO SECTION */}
      <div className="relative w-full h-[380px]">
        <img
          src={trek.image_url}
          alt={trek.name}
          className="w-full h-full object-cover opacity-70"
        />

        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-6 md:px-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: COLORS.gold }}>
            {trek.name}
          </h1>
          <p className="max-w-2xl text-gray-300">{trek.overview?.substring(0, 180)}...</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-10">
        {/* QUICK INFO GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <Info label="Best Season" value={trek.best_season} />
          <Info label="Difficulty" value={trek.difficulty} />
          <Info label="Duration" value={`${trek.duration_days} Days`} />
          <Info label="Max Altitude" value={`${trek.max_altitude_meters} m`} />
          <Info label="Group Size" value={`${trek.group_size_min} - ${trek.group_size_max}`} />
          <Info label="Price (USD)" value={`$${trek.price_usd}`} highlight />
        </div>

        {/* HIGHLIGHTS */}
        {trek.highlights?.length > 0 && (
          <Section title="Highlights">
            <ul className="list-disc ml-6 text-gray-300 space-y-1">
              {trek.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </Section>
        )}

        {/* GALLERY */}
        {trek.gallery_images?.length > 0 && (
          <Section title="Gallery">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {trek.gallery_images.map((url, i) => (
                <img key={i} src={url} className="rounded-lg shadow-lg h-40 object-cover" />
              ))}
            </div>
          </Section>
        )}

        {/* INCLUDES */}
        {trek.includes?.length > 0 && (
          <Section title="What’s Included">
            <ul className="list-disc ml-6 text-gray-300 space-y-1">
              {trek.includes.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </Section>
        )}

        {/* EXCLUDES */}
        {trek.excludes?.length > 0 && (
          <Section title="What’s Not Included">
            <ul className="list-disc ml-6 text-red-300 space-y-1">
              {trek.excludes.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </Section>
        )}

        {/* LIMITED TIME OFFERS */}
        {trek.has_offer && (
          <Section title="🔥 Limited-Time Offer">
            <div
              style={{
                background: COLORS.greenDark,
                padding: "20px",
                borderRadius: "10px",
                border: `1px solid ${COLORS.gold}`,
              }}
            >
              <h3 className="text-xl font-bold text-yellow-300">{trek.offer_title}</h3>
              <p className="mt-1 text-gray-200">{trek.offer_description}</p>

              <ul className="list-disc ml-6 mt-2 text-gray-200 space-y-1">
                {trek.offer_includes?.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>

              <p className="mt-3 text-lg font-semibold">
                Price:{" "}
                <span className="text-yellow-300">
                  ${trek.offer_price_from} → ${trek.offer_price_to}
                </span>
              </p>
            </div>
          </Section>
        )}

        {/* ITINERARY */}
        {trek.itinerary?.length > 0 && (
          <Section title="Day-by-Day Itinerary">
            {trek.itinerary.map((d, i) => (
              <div
                key={i}
                className="p-5 mb-4 rounded-lg shadow-lg"
                style={{
                  background: COLORS.navy,
                  borderLeft: `4px solid ${COLORS.primary}`,
                }}
              >
                <h3 className="text-xl font-bold text-yellow-300">
                  Day {d.day}: {d.title}
                </h3>
                <p className="mt-2 text-gray-200 whitespace-pre-line">{d.description}</p>
              </div>
            ))}
          </Section>
        )}

        {/* EXTRA SECTIONS */}
        {trek.extra_sections?.map((sec, i) => (
          <Section key={i} title={sec.title}>
            <p className="text-gray-300 whitespace-pre-line">{sec.content}</p>
          </Section>
        ))}
      </div>
    </div>
  );
}

/* INFO BOX COMPONENT */
function Info({ label, value, highlight }) {
  if (!value) return null;
  return (
    <div
      className="p-4 rounded-lg shadow text-center"
      style={{
        background: highlight ? "#e8461033" : "#ffffff11",
        border: highlight ? "1px solid #fed81e" : "1px solid #333",
      }}
    >
      <p className="text-sm text-gray-300">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}

/* SECTION WRAPPER */
function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-3xl font-bold mb-4" style={{ color: COLORS.gold }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
