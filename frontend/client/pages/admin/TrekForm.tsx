import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/apiClient";
import { getToken, getUser } from "@/lib/auth";
import { ArrowLeft, Plus, Trash2, Edit2, Check, X, Calendar } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { showToast } from "@/lib/toast";

type ItineraryDay = {
  day: number;
  title: string;
  description: string;
  altitude?: string;
  distance?: string;
  highlights: string[];
};

type FAQ = {
  question: string;
  answer: string;
};

type ExtraSection = {
  title: string;
  content: string;
};

type AvailabilityEntry = {
  _id: string;
  start_date: string;
  end_date: string;
  status: "available" | "booked" | "limited";
  note: string;
};

const STATUS_STYLES = {
  available: { bg: "bg-green-500/20",  text: "text-green-400",  dot: "bg-green-500",  label: "Available" },
  booked:    { bg: "bg-red-500/20",    text: "text-red-400",    dot: "bg-red-500",    label: "Booked"    },
  limited:   { bg: "bg-yellow-500/20", text: "text-yellow-400", dot: "bg-yellow-500", label: "Limited"   },
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ── sections list ──────────────────────────────────────────────
const getSections = (_isEditMode: boolean) => [
  { id: "basic",        label: "Basic Info"      },
  { id: "pricing",      label: "Pricing"         },
  { id: "group",        label: "Group Size"      },
  { id: "highlights",   label: "Highlights"      },
  { id: "includes",     label: "Includes"        },
  { id: "excludes",     label: "Excludes"        },
  { id: "itinerary",    label: "Itinerary"       },
  { id: "offers",       label: "Offers"          },
  { id: "faqs",         label: "FAQs"            },
  { id: "extra",        label: "Extra Sections"  },
  { id: "categories",   label: "Categories"      },
  { id: "availability", label: "📅 Availability" }, // always visible
];

export default function TrekForm() {
  const navigate   = useNavigate();
  const { id }     = useParams();
  const isEditMode = !!id;

  const [loading,       setLoading]       = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");

  const [form, setForm] = useState({
    name: "", overview: "", difficulty: "Moderate",
    duration_days: 0, price_usd: 0, price_gbp: 0,
    start_point: "", end_point: "", best_season: "",
    group_size_min: 1, group_size_max: 15, max_altitude_meters: 0,
    image_url: "", is_featured: false, is_active: true, is_optional: false,
    has_offer: false, offer_title: "", offer_description: "",
    discounted_price_usd: 0, discounted_price_gbp: 0,
    offer_valid_from: "", offer_valid_to: "",
  });

  const [highlights,    setHighlights]    = useState<string[]>([]);
  const [includes,      setIncludes]      = useState<string[]>([]);
  const [excludes,      setExcludes]      = useState<string[]>([]);
  const [itinerary,     setItinerary]     = useState<ItineraryDay[]>([]);
  const [faqs,          setFaqs]          = useState<FAQ[]>([]);
  const [extraSections, setExtraSections] = useState<ExtraSection[]>([]);

  // ── Availability state ─────────────────────────────────────
  const [availability,       setAvailability]       = useState<AvailabilityEntry[]>([]);
  const [pendingAvailability, setPendingAvailability] = useState<Omit<AvailabilityEntry, "_id">[]>([]); // create mode
  const [availLoading,       setAvailLoading]       = useState(false);
  const [showAvailForm,      setShowAvailForm]      = useState(false);
  const [availSaving,        setAvailSaving]        = useState(false);
  const [editingAvailId,     setEditingAvailId]     = useState<string | null>(null);
  const [availForm, setAvailForm] = useState({
    start_date: "", end_date: "", status: "available", note: "",
  });
  const [editAvailForm, setEditAvailForm] = useState<any>({});

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const offset = 180;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  // AUTH CHECK
  useEffect(() => {
    const token = getToken();
    const user  = getUser();
    if (!token || !user) { navigate("/admin/login"); return; }
    if (user.role !== "admin" && user.role !== "superadmin") { navigate("/admin/login"); return; }
    setLoading(false);
  }, [navigate]);

  // LOAD TREK DATA
  useEffect(() => {
    if (isEditMode && !loading) {
      loadTrekData();
      loadAvailability();
    }
  }, [isEditMode, loading]);

  const loadTrekData = async () => {
    try {
      const response = await api.get(`/api/treks/${id}`);
      const trek = response.data;
      setForm({
        name: trek.name || "", overview: trek.overview || "",
        difficulty: trek.difficulty || "Moderate",
        duration_days: trek.duration_days || 0,
        price_usd: trek.price_usd || 0, price_gbp: trek.price_gbp || 0,
        start_point: trek.start_point || "", end_point: trek.end_point || "",
        best_season: trek.best_season || "",
        group_size_min: trek.group_size_min || 1, group_size_max: trek.group_size_max || 15,
        max_altitude_meters: trek.max_altitude_meters || 0,
        image_url: trek.image_url || "",
        is_featured: trek.is_featured || false, is_active: trek.is_active || false,
        is_optional: trek.is_optional || false, has_offer: trek.has_offer || false,
        offer_title: trek.offer_title || "", offer_description: trek.offer_description || "",
        discounted_price_usd: trek.discounted_price_usd || 0,
        discounted_price_gbp: trek.discounted_price_gbp || 0,
        offer_valid_from: trek.offer_valid_from ? trek.offer_valid_from.split("T")[0] : "",
        offer_valid_to:   trek.offer_valid_to   ? trek.offer_valid_to.split("T")[0]   : "",
      });
      setHighlights(trek.highlights || []);
      setIncludes(trek.includes || []);
      setExcludes(trek.excludes || []);
      setItinerary(trek.itinerary || []);
      setFaqs(trek.faqs || []);
      setExtraSections(trek.extra_sections || []);
    } catch (err: any) {
      showToast.error("Failed to load trek data");
      navigate("/admin/treks");
    }
  };

  // ── Availability API calls ─────────────────────────────────
  const loadAvailability = async () => {
    setAvailLoading(true);
    try {
      const res = await api.get(`/api/treks/${id}/availability`);
      setAvailability(res.data || []);
    } catch {
      showToast.error("Failed to load availability");
    } finally {
      setAvailLoading(false);
    }
  };

  const handleAddAvailability = async () => {
    if (!availForm.start_date || !availForm.end_date) {
      showToast.error("Start and end date are required");
      return;
    }
    if (new Date(availForm.start_date) > new Date(availForm.end_date)) {
      showToast.error("Start date must be before end date");
      return;
    }
    setAvailSaving(true);
    try {
      const res = await api.post(`/api/treks/${id}/availability`, availForm);
      setAvailability(res.data.availability || []);
      setAvailForm({ start_date: "", end_date: "", status: "available", note: "" });
      setShowAvailForm(false);
      showToast.success("Availability range added!");
    } catch (err: any) {
      showToast.error(err.response?.data?.message || "Failed to add availability");
    } finally {
      setAvailSaving(false);
    }
  };

  const handleUpdateAvailability = async (availId: string) => {
    if (new Date(editAvailForm.start_date) > new Date(editAvailForm.end_date)) {
      showToast.error("Start date must be before end date");
      return;
    }
    setAvailSaving(true);
    try {
      const res = await api.put(`/api/treks/${id}/availability/${availId}`, editAvailForm);
      setAvailability(res.data.availability || []);
      setEditingAvailId(null);
      showToast.success("Availability updated!");
    } catch (err: any) {
      showToast.error(err.response?.data?.message || "Failed to update availability");
    } finally {
      setAvailSaving(false);
    }
  };

  const handleDeleteAvailability = async (availId: string) => {
    if (!window.confirm("Delete this availability range?")) return;
    try {
      const res = await api.delete(`/api/treks/${id}/availability/${availId}`);
      setAvailability(res.data.availability || []);
      showToast.success("Availability range deleted");
    } catch {
      showToast.error("Failed to delete availability");
    }
  };

  const startEditAvail = (entry: AvailabilityEntry) => {
    setEditingAvailId(entry._id);
    setEditAvailForm({
      start_date: entry.start_date.split("T")[0],
      end_date:   entry.end_date.split("T")[0],
      status:     entry.status,
      note:       entry.note,
    });
  };

  // ── Shared field handlers ──────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm({ ...form, [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value });
  };

  const addHighlight    = () => { setHighlights([...highlights, ""]); };
  const updateHighlight = (i: number, v: string) => { const u = [...highlights]; u[i] = v; setHighlights(u); };
  const removeHighlight = (i: number) => setHighlights(highlights.filter((_, j) => j !== i));

  const addInclude    = () => setIncludes([...includes, ""]);
  const updateInclude = (i: number, v: string) => { const u = [...includes]; u[i] = v; setIncludes(u); };
  const removeInclude = (i: number) => setIncludes(includes.filter((_, j) => j !== i));

  const addExclude    = () => setExcludes([...excludes, ""]);
  const updateExclude = (i: number, v: string) => { const u = [...excludes]; u[i] = v; setExcludes(u); };
  const removeExclude = (i: number) => setExcludes(excludes.filter((_, j) => j !== i));

  const addItineraryDay    = () => setItinerary([...itinerary, { day: itinerary.length + 1, title: "", description: "", highlights: [] }]);
  const updateItinerary    = (i: number, field: keyof ItineraryDay, value: any) => { const u = [...itinerary]; (u[i] as any)[field] = value; setItinerary(u); };
  const removeItineraryDay = (i: number) => setItinerary(itinerary.filter((_, j) => j !== i));

  const addFaq    = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const updateFaq = (i: number, field: "question" | "answer", v: string) => { const u = [...faqs]; u[i][field] = v; setFaqs(u); };
  const removeFaq = (i: number) => setFaqs(faqs.filter((_, j) => j !== i));

  const addExtraSection    = () => setExtraSections([...extraSections, { title: "", content: "" }]);
  const updateExtraSection = (i: number, field: "title" | "content", v: string) => { const u = [...extraSections]; u[i][field] = v; setExtraSections(u); };
  const removeExtraSection = (i: number) => setExtraSections(extraSections.filter((_, j) => j !== i));

  const handleSubmit = async () => {
    if (!form.name.trim())     { showToast.error("Trek name is required!");  return; }
    if (!form.overview.trim()) { showToast.error("Overview is required!");   return; }
    setSubmitLoading(true);
    try {
      const token = getToken();
      if (!token) { showToast.error("No auth token. Please login again."); navigate("/admin/login"); return; }
      const payload = {
        ...form,
        highlights, includes, excludes, itinerary, faqs,
        extra_sections: extraSections,
        ...(!isEditMode && { availability: pendingAvailability }),
      };
      if (isEditMode) {
        await api.put(`/api/treks/${id}`, payload);
        showToast.success("Trek updated successfully!");
        navigate("/admin/treks");
      } else {
        const res = await api.post("/api/treks", payload);
        showToast.success("Trek created! You can now manage availability.");
        navigate(`/admin/treks/edit/${res.data.trek._id}`);
      }
    } catch (err: any) {
      showToast.error(err.response?.data?.message || err.message || "Server error");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <p className="text-white p-8">Loading...</p>;

  const sections = getSections(isEditMode); // availability always shown

  // ── Input class helpers ────────────────────────────────────
  const inp  = "w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none";
  const inp2 = "w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none";

  return (
    <>
      <Toaster />
      <div className="p-8 text-white min-h-screen bg-slate-950">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate("/admin/treks")} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">
              {isEditMode ? "✏️ Edit Trek" : "🗻 Create Trek"}
            </h1>
            <p className="text-slate-400 mt-1">
              {isEditMode ? "Update trek information" : "Add a new trekking package"}
            </p>
          </div>
        </div>

        {/* Sticky Section Navigation */}
        <div className="sticky top-0 z-10 bg-slate-900 border-y border-slate-700 py-3 mb-6 -mx-8 px-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={[
                  "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                  activeSection === section.id
                    ? "bg-yellow-500 text-black shadow-lg"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white",
                ].join(" ")}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8 max-w-6xl">

          {/* SECTION 1: BASIC */}
          <section id="basic" ref={(el) => (sectionRefs.current["basic"] = el)} className="bg-slate-900 rounded-lg p-6 scroll-mt-48">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Trek Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Everest Base Camp Trek" className={inp} required />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Overview *</label>
                <textarea name="overview" value={form.overview} onChange={handleChange} placeholder="Describe the trek..." rows={4} className={inp} required />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Image URL</label>
                <input name="image_url" value={form.image_url} onChange={handleChange} placeholder="https://example.com/image.jpg" className={inp} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Difficulty</label>
                  <select name="difficulty" value={form.difficulty} onChange={handleChange} className={inp}>
                    <option>Easy</option><option>Moderate</option><option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Duration (days)</label>
                  <input type="number" name="duration_days" value={form.duration_days || ""} onChange={handleChange} placeholder="e.g. 14" min="0" className={inp} />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Max Altitude (m)</label>
                  <input type="number" name="max_altitude_meters" value={form.max_altitude_meters || ""} onChange={handleChange} placeholder="e.g. 5364" min="0" className={inp} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Start Point</label>
                  <input name="start_point" value={form.start_point} onChange={handleChange} placeholder="e.g. Kathmandu" className={inp} />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">End Point</label>
                  <input name="end_point" value={form.end_point} onChange={handleChange} placeholder="e.g. Lukla" className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Best Season</label>
                <input name="best_season" value={form.best_season} onChange={handleChange} placeholder="e.g. Spring, Autumn" className={inp} />
              </div>
            </div>
          </section>

          {/* SECTION 2: PRICING */}
          <section id="pricing" ref={(el) => (sectionRefs.current["pricing"] = el)} className="bg-slate-900 rounded-lg p-6 scroll-mt-48">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Price USD ($)</label>
                <input type="number" name="price_usd" value={form.price_usd || ""} onChange={handleChange} placeholder="e.g. 1500" min="0" step="0.01" className={inp} />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Price GBP (£)</label>
                <input type="number" name="price_gbp" value={form.price_gbp || ""} onChange={handleChange} placeholder="e.g. 1200" min="0" step="0.01" className={inp} />
              </div>
            </div>
          </section>

          {/* SECTION 3: GROUP SIZE */}
          <section id="group" ref={(el) => (sectionRefs.current["group"] = el)} className="bg-slate-900 rounded-lg p-6 scroll-mt-48">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Group Size</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Min Group Size</label>
                <input type="number" name="group_size_min" value={form.group_size_min || ""} onChange={handleChange} placeholder="e.g. 1" min="1" className={inp} />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Max Group Size</label>
                <input type="number" name="group_size_max" value={form.group_size_max || ""} onChange={handleChange} placeholder="e.g. 15" min="1" className={inp} />
              </div>
            </div>
          </section>

          {/* SECTION 4: HIGHLIGHTS */}
          <section id="highlights" ref={(el) => (sectionRefs.current["highlights"] = el)} className="bg-slate-900 rounded-lg p-6 scroll-mt-48">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Highlights</h2>
            <div className="space-y-3">
              {highlights.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input value={h} onChange={(e) => updateHighlight(i, e.target.value)} placeholder="e.g. Views of Mount Everest" className="flex-1 p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none" />
                  <button onClick={() => removeHighlight(i)} className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"><Trash2 size={18} /></button>
                </div>
              ))}
              <button onClick={addHighlight} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"><Plus size={18} />Add Highlight</button>
            </div>
          </section>

          {/* SECTION 5: INCLUDES */}
          <section id="includes" ref={(el) => (sectionRefs.current["includes"] = el)} className="bg-slate-900 rounded-lg p-6 scroll-mt-48">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Cost Includes</h2>
            <div className="space-y-3">
              {includes.map((inc, i) => (
                <div key={i} className="flex gap-2">
                  <input value={inc} onChange={(e) => updateInclude(i, e.target.value)} placeholder="e.g. Professional guide" className="flex-1 p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none" />
                  <button onClick={() => removeInclude(i)} className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"><Trash2 size={18} /></button>
                </div>
              ))}
              <button onClick={addInclude} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"><Plus size={18} />Add Include Item</button>
            </div>
          </section>

          {/* SECTION 6: EXCLUDES */}
          <section id="excludes" ref={(el) => (sectionRefs.current["excludes"] = el)} className="bg-slate-900 rounded-lg p-6 scroll-mt-48">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Cost Does Not Include</h2>
            <div className="space-y-3">
              {excludes.map((exc, i) => (
                <div key={i} className="flex gap-2">
                  <input value={exc} onChange={(e) => updateExclude(i, e.target.value)} placeholder="e.g. International flights" className="flex-1 p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none" />
                  <button onClick={() => removeExclude(i)} className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"><Trash2 size={18} /></button>
                </div>
              ))}
              <button onClick={addExclude} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"><Plus size={18} />Add Exclude Item</button>
            </div>
          </section>

          {/* SECTION 7: ITINERARY */}
          <section id="itinerary" ref={(el) => (sectionRefs.current["itinerary"] = el)} className="bg-slate-900 rounded-lg p-6 scroll-mt-48">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Itinerary</h2>
            <div className="space-y-4">
              {itinerary.map((day, i) => (
                <div key={i} className="border border-slate-700 rounded-lg p-4 bg-slate-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">Day {day.day}</h3>
                    <button onClick={() => removeItineraryDay(i)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                  <div className="space-y-3">
                    <input value={day.title} onChange={(e) => updateItinerary(i, "title", e.target.value)} placeholder="Day Title" className={inp2} />
                    <textarea value={day.description} onChange={(e) => updateItinerary(i, "description", e.target.value)} placeholder="Day Description" rows={3} className={inp2} />
                    <div className="grid grid-cols-2 gap-3">
                      <input value={day.altitude || ""} onChange={(e) => updateItinerary(i, "altitude", e.target.value)} placeholder="Altitude (e.g. 2,610m)" className={inp2} />
                      <input value={day.distance || ""} onChange={(e) => updateItinerary(i, "distance", e.target.value)} placeholder="Distance (e.g. 5km)" className={inp2} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addItineraryDay} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"><Plus size={18} />Add Itinerary Day</button>
            </div>
          </section>

          {/* SECTION 8: OFFERS */}
          <section id="offers" ref={(el) => (sectionRefs.current["offers"] = el)} className="bg-slate-900 rounded-lg p-6 scroll-mt-48">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Special Offers</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.has_offer} onChange={(e) => setForm({ ...form, has_offer: e.target.checked })} className="w-5 h-5 rounded" />
                <span className="font-semibold">This trek has a special offer</span>
              </label>
              {form.has_offer && (
                <div className="space-y-4 pl-7">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Offer Title</label>
                    <input name="offer_title" value={form.offer_title} onChange={handleChange} placeholder="e.g. Early Bird Discount" className={inp} />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Offer Description</label>
                    <textarea name="offer_description" value={form.offer_description} onChange={handleChange} placeholder="Describe the offer..." rows={2} className={inp} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Discounted Price USD ($)</label>
                      <input type="number" name="discounted_price_usd" value={form.discounted_price_usd || ""} onChange={handleChange} placeholder="e.g. 1200" min="0" step="0.01" className={inp} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Discounted Price GBP (£)</label>
                      <input type="number" name="discounted_price_gbp" value={form.discounted_price_gbp || ""} onChange={handleChange} placeholder="e.g. 900" min="0" step="0.01" className={inp} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Valid From</label>
                      <input type="date" name="offer_valid_from" value={form.offer_valid_from} onChange={handleChange} className={inp} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Valid To</label>
                      <input type="date" name="offer_valid_to" value={form.offer_valid_to} onChange={handleChange} className={inp} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 9: FAQs */}
          <section id="faqs" ref={(el) => (sectionRefs.current["faqs"] = el)} className="bg-slate-900 rounded-lg p-6 scroll-mt-48">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">FAQs</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-slate-700 rounded-lg p-4 bg-slate-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">FAQ {i + 1}</h3>
                    <button onClick={() => removeFaq(i)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                  <div className="space-y-3">
                    <input value={faq.question} onChange={(e) => updateFaq(i, "question", e.target.value)} placeholder="Question" className={inp2} />
                    <textarea value={faq.answer} onChange={(e) => updateFaq(i, "answer", e.target.value)} placeholder="Answer" rows={2} className={inp2} />
                  </div>
                </div>
              ))}
              <button onClick={addFaq} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"><Plus size={18} />Add FAQ</button>
            </div>
          </section>

          {/* SECTION 10: EXTRA SECTIONS */}
          <section id="extra" ref={(el) => (sectionRefs.current["extra"] = el)} className="bg-slate-900 rounded-lg p-6 scroll-mt-48">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Extra Sections</h2>
            <p className="text-sm text-slate-400 mb-4">Add additional sections like "What to Bring", "Accommodation", etc.</p>
            <div className="space-y-4">
              {extraSections.map((section, i) => (
                <div key={i} className="border border-slate-700 rounded-lg p-4 bg-slate-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Section {i + 1}</h3>
                    <button onClick={() => removeExtraSection(i)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                  <div className="space-y-3">
                    <input value={section.title} onChange={(e) => updateExtraSection(i, "title", e.target.value)} placeholder="Section Title" className={inp2} />
                    <textarea value={section.content} onChange={(e) => updateExtraSection(i, "content", e.target.value)} placeholder="Section Content" rows={3} className={inp2} />
                  </div>
                </div>
              ))}
              <button onClick={addExtraSection} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"><Plus size={18} />Add Extra Section</button>
            </div>
          </section>

          {/* SECTION 11: CATEGORIES */}
          <section id="categories" ref={(el) => (sectionRefs.current["categories"] = el)} className="bg-slate-900 rounded-lg p-6 scroll-mt-48">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Trek Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-yellow-500 transition-colors">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-5 h-5 rounded" />
                <div><div className="font-semibold">Featured Trek</div><div className="text-xs text-slate-400">Show on homepage</div></div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-green-500 transition-colors">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-5 h-5 rounded" />
                <div><div className="font-semibold">Active</div><div className="text-xs text-slate-400">Visible to users</div></div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors">
                <input type="checkbox" checked={form.is_optional} onChange={(e) => setForm({ ...form, is_optional: e.target.checked })} className="w-5 h-5 rounded" />
                <div><div className="font-semibold">Optional Activity</div><div className="text-xs text-slate-400">Show in Optional Treks</div></div>
              </label>
            </div>
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-200">
              <strong>Note:</strong> If "Optional Activity" is checked, this trek will appear on the <strong>Optional Activities</strong> page. Otherwise it appears on the <strong>Destinations</strong> page.
            </div>
          </section>

          {/* SECTION 12: AVAILABILITY */}
          <section id="availability" ref={(el) => (sectionRefs.current["availability"] = el)} className="bg-slate-900 rounded-lg p-6 scroll-mt-48">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-yellow-400" />
                <div>
                  <h2 className="text-2xl font-bold text-yellow-400">Availability</h2>
                  <p className="text-slate-400 text-sm mt-0.5">
                    {isEditMode
                      ? "Changes save instantly to the database"
                      : "These ranges will be saved when you create the trek"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowAvailForm(!showAvailForm); setEditingAvailId(null); }}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors"
              >
                <Plus size={18} /> Add Range
              </button>
            </div>

            {/* Add form */}
            {showAvailForm && (
              <div className="bg-slate-800 border border-slate-600 rounded-xl p-5 mb-5">
                <h3 className="font-semibold text-slate-200 mb-4">New Availability Range</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                    <input type="date" value={availForm.start_date} onChange={(e) => setAvailForm({ ...availForm, start_date: e.target.value })} className={inp2} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">End Date</label>
                    <input type="date" value={availForm.end_date} onChange={(e) => setAvailForm({ ...availForm, end_date: e.target.value })} className={inp2} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Status</label>
                    <select value={availForm.status} onChange={(e) => setAvailForm({ ...availForm, status: e.target.value })} className={inp2}>
                      <option value="available">✅ Available</option>
                      <option value="limited">⚠️ Limited</option>
                      <option value="booked">🔴 Booked</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Note (optional)</label>
                    <input type="text" value={availForm.note} onChange={(e) => setAvailForm({ ...availForm, note: e.target.value })} placeholder="e.g. Only 3 spots left" className={inp2} />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      if (!availForm.start_date || !availForm.end_date) { showToast.error("Start and end date required"); return; }
                      if (new Date(availForm.start_date) > new Date(availForm.end_date)) { showToast.error("Start must be before end date"); return; }
                      if (isEditMode) {
                        handleAddAvailability();
                      } else {
                        setPendingAvailability([...pendingAvailability, { ...availForm }]);
                        setAvailForm({ start_date: "", end_date: "", status: "available", note: "" });
                        setShowAvailForm(false);
                        showToast.success("Availability range added!");
                      }
                    }}
                    disabled={availSaving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black font-semibold rounded-lg text-sm transition-colors"
                  >
                    <Check size={16} />
                    {availSaving ? "Saving..." : "Save Range"}
                  </button>
                  <button
                    onClick={() => setShowAvailForm(false)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </div>
            )}

            {/* List — edit mode uses DB availability, create mode uses pendingAvailability */}
            {(() => {
              const list = isEditMode ? availability : pendingAvailability;
              if (availLoading) return <div className="text-slate-400 text-sm py-6 text-center">Loading availability...</div>;
              if (list.length === 0) return (
                <div className="text-center py-10 border border-dashed border-slate-700 rounded-xl">
                  <div className="text-4xl mb-2">📅</div>
                  <div className="text-slate-400 text-sm">No availability ranges yet. Click "Add Range" to get started.</div>
                </div>
              );
              return (
                <div className="space-y-3">
                  {list
                    .slice()
                    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                    .map((entry, index) => {
                      const s = STATUS_STYLES[entry.status as keyof typeof STATUS_STYLES];
                      const entryWithId = entry as AvailabilityEntry;
                      const isEditing = isEditMode && editingAvailId === entryWithId._id;
                      return (
                        <div key={isEditMode ? entryWithId._id : index} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                          {isEditing ? (
                            <div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                                  <input type="date" value={editAvailForm.start_date} onChange={(e) => setEditAvailForm({ ...editAvailForm, start_date: e.target.value })} className={inp2} />
                                </div>
                                <div>
                                  <label className="block text-xs text-slate-400 mb-1">End Date</label>
                                  <input type="date" value={editAvailForm.end_date} onChange={(e) => setEditAvailForm({ ...editAvailForm, end_date: e.target.value })} className={inp2} />
                                </div>
                                <div>
                                  <label className="block text-xs text-slate-400 mb-1">Status</label>
                                  <select value={editAvailForm.status} onChange={(e) => setEditAvailForm({ ...editAvailForm, status: e.target.value })} className={inp2}>
                                    <option value="available">✅ Available</option>
                                    <option value="limited">⚠️ Limited</option>
                                    <option value="booked">🔴 Booked</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs text-slate-400 mb-1">Note</label>
                                  <input type="text" value={editAvailForm.note} onChange={(e) => setEditAvailForm({ ...editAvailForm, note: e.target.value })} placeholder="Optional note" className={inp2} />
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <button onClick={() => handleUpdateAvailability(entryWithId._id)} disabled={availSaving} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg">
                                  <Check size={14} /> {availSaving ? "Saving..." : "Save"}
                                </button>
                                <button onClick={() => setEditingAvailId(null)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-xs font-semibold rounded-lg">
                                  <X size={14} /> Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
                                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                                  {s.label}
                                </span>
                                <span className="text-sm font-semibold text-slate-200">
                                  {fmt(entry.start_date)} — {fmt(entry.end_date)}
                                </span>
                                {entry.note && <span className="text-xs text-slate-400 italic">"{entry.note}"</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                {isEditMode ? (
                                  <>
                                    <button onClick={() => { startEditAvail(entryWithId); setShowAvailForm(false); }} className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors">
                                      <Edit2 size={15} />
                                    </button>
                                    <button onClick={() => handleDeleteAvailability(entryWithId._id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
                                      <Trash2 size={15} />
                                    </button>
                                  </>
                                ) : (
                                  <button onClick={() => setPendingAvailability(pendingAvailability.filter((_, i) => i !== index))} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              );
            })()}

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-300">
              {isEditMode
                ? <><strong>Note:</strong> Availability ranges save instantly — no need to click "Update Trek".</>
                : <><strong>Note:</strong> These ranges will be saved together when you click "Create Trek".</>
              }
            </div>
          </section>

                    {/* SUBMIT */}
          <div className="flex gap-4 sticky bottom-0 bg-slate-950 py-4 border-t border-slate-800">
            <button
              onClick={handleSubmit}
              disabled={submitLoading}
              type="button"
              className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors shadow-lg"
            >
              {submitLoading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Trek" : "Create Trek")}
            </button>
            <button
              onClick={() => navigate("/admin/treks")}
              type="button"
              className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
