// pages/admin/treks/new.js
import { useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Head from "next/head";
import axios from "axios";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

function applyStyle(text, setText, style) {
  const wrap = { bold: "**", italic: "*", underline: "__" };
  const sel = window.getSelection();
  if (!sel || !sel.toString()) {
    setText(wrap[style] + (text || "") + wrap[style]);
  } else {
    const s = sel.toString();
    setText((prev) => prev.replace(s, wrap[style] + s + wrap[style]));
  }
}

function Toolbar({ text, setText }) {
  return (
    <div className="flex gap-2 text-sm mb-1">
      <button type="button" className="px-2 border rounded" onClick={() => applyStyle(text, setText, "bold")}>B</button>
      <button type="button" className="px-2 border rounded italic" onClick={() => applyStyle(text, setText, "italic")}>I</button>
      <button type="button" className="px-2 border rounded underline" onClick={() => applyStyle(text, setText, "underline")}>U</button>
      <button type="button" className="px-2 border rounded" onClick={() => setText(text + "\n- ")}>•</button>
    </div>
  );
}

export default function NewTrek() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [overview, setOverview] = useState("");
  const [image_url, setImg] = useState("");
  const [gallery_images, setGallery] = useState([""]);
  const [map_image_url, setMapImg] = useState("");

  const [highlights, setHighlights] = useState([""]);
  const [includes, setIncludes] = useState([""]);
  const [excludes, setExcludes] = useState([""]);

  const [duration_days, setDuration] = useState(0);
  const [difficulty, setDifficulty] = useState("Moderate");
  const [price_usd, setUsd] = useState(0);
  const [price_gbp, setGbp] = useState(0);
  const [max_altitude_meters, setMaxAlt] = useState(0);
  const [best_season, setSeason] = useState("");
  const [start_point, setStart] = useState("");
  const [end_point, setEnd] = useState("");
  const [trek_map_embed_url, setEmbed] = useState("");
  const [booking_link, setBooking] = useState("");

  const [itinerary, setItinerary] = useState([{ title: "", description: "" }]);
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [extra_sections, setExtra] = useState([{ title: "", content: "" }]);

  const [has_offer, setOffer] = useState(false);
  const [offer_title, setOffTitle] = useState("");
  const [offer_description, setOffDesc] = useState("");
  const [discounted_price_usd, setDiscUsd] = useState(0);
  const [discounted_price_gbp, setDiscGbp] = useState(0);

  const [is_active, setActive] = useState(false);
  const [is_featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const clean = (list) => list.filter((x) => x && x.trim());

  const chart = {
    xAxis: { type: "category", data: has_offer ? ["USD", "USD(discount)", "GBP", "GBP(discount)"] : ["USD", "GBP"] },
    yAxis: { type: "value" },
    series: [{
      type: "bar",
      data: has_offer
        ? [price_usd, discounted_price_usd, price_gbp, discounted_price_gbp]
        : [price_usd, price_gbp],
    }],
  };

  const submit = async (e, publish) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name, overview, image_url,
      gallery_images: clean(gallery_images),
      map_image_url, highlights: clean(highlights),
      includes: clean(includes), excludes: clean(excludes),
      itinerary: itinerary.map((d, i) => ({ day: i+1, title: d.title, description: d.description })),
      best_season, start_point, end_point,
      price_usd: Number(price_usd), price_gbp: Number(price_gbp),
      duration_days, difficulty, max_altitude_meters,
      trek_map_embed_url, booking_link,
      has_offer, offer_title, offer_description,
      discounted_price_usd, discounted_price_gbp,
      faqs: faqs.filter((f) => f.question || f.answer),
      extra_sections,
      is_featured, is_active: publish,
    };

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/treks`, payload);
      router.push(`/trek/${res.data._id}`);
    } catch {
      setMsg("❌ Error, check console");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <Head><title>Create Trek</title></Head>
      <h1 className="text-2xl font-bold mb-4">Create New Trek</h1>

      {msg && <div className="bg-yellow-200 p-2 mb-2">{msg}</div>}

      <form onSubmit={(e) => submit(e, true)} className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* ------------- Left Column --------------- */}
        <div className="md:col-span-2 space-y-4">

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Basic Info</h2>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 mb-2" placeholder="Trek Name" />
            <Toolbar text={overview} setText={setOverview} />
            <textarea value={overview} onChange={(e) => setOverview(e.target.value)} className="w-full border p-2 h-24" placeholder="Overview..." />
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Images</h2>
            <input value={image_url} onChange={(e) => setImg(e.target.value)} className="w-full border p-2 mb-2" placeholder="Hero Image URL" />
            <input value={map_image_url} onChange={(e) => setMapImg(e.target.value)} className="w-full border p-2 mb-2" placeholder="Map Image URL" />
          </div>

          {/* Itinerary */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Itinerary</h2>
            {itinerary.map((it, i) => (
              <div key={i} className="mb-2">
                <input
                  value={it.title}
                  onChange={(e) => {
                    const a = [...itinerary];
                    a[i].title = e.target.value;
                    setItinerary(a);
                  }}
                  className="w-full border p-2 mb-1"
                  placeholder={`Day ${i+1} title`}
                />
                <textarea
                  value={it.description}
                  onChange={(e) => {
                    const a = [...itinerary];
                    a[i].description = e.target.value;
                    setItinerary(a);
                  }}
                  className="w-full border p-2"
                  placeholder="Description"
                />
              </div>
            ))}
            <button type="button" onClick={() => setItinerary([...itinerary, { title:"", description:"" }])} className="bg-gray-600 text-white px-2 py-1 rounded">+ Add Day</button>
          </div>
        </div>

        {/* ------------- Right Column --------------- */}
        <div className="space-y-4">

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Pricing</h2>
            <input type="number" value={price_usd} onChange={(e) => setUsd(e.target.value)} className="w-full border p-2 mb-1" placeholder="USD Price" />
            <input type="number" value={price_gbp} onChange={(e) => setGbp(e.target.value)} className="w-full border p-2 mb-1" placeholder="GBP Price" />
            <ReactECharts option={chart} style={{ height: 150 }} />
          </div>

          <button className="bg-green-600 text-white px-4 py-2 rounded w-full">
            {saving ? "Saving..." : "Publish Trek"}
          </button>
        </div>
      </form>
    </div>
  );
}
