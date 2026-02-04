import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/apiClient";
import { getToken, getUser } from "@/lib/auth";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

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

const sections = [
  { id: "basic", label: "Basic Info" },
  { id: "pricing", label: "Pricing" },
  { id: "group", label: "Group Size" },
  { id: "highlights", label: "Highlights" },
  { id: "includes", label: "Includes" },
  { id: "excludes", label: "Excludes" },
  { id: "itinerary", label: "Itinerary" },
  { id: "offers", label: "Offers" },
  { id: "faqs", label: "FAQs" },
  { id: "extra", label: "Extra Sections" },
  { id: "categories", label: "Categories" },
];

export default function TrekForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("basic");

  const [form, setForm] = useState({
    name: "",
    overview: "",
    difficulty: "Moderate",
    duration_days: 0,
    price_usd: 0,
    price_gbp: 0,
    start_point: "",
    end_point: "",
    best_season: "",
    group_size_min: 1,
    group_size_max: 15,
    max_altitude_meters: 0,
    image_url: "",
    is_featured: false,
    is_active: true,
    is_optional: false,
    has_offer: false,
    offer_title: "",
    offer_description: "",
    discounted_price_usd: 0,
    discounted_price_gbp: 0,
    offer_valid_from: "",
    offer_valid_to: "",
  });

  const [highlights, setHighlights] = useState<string[]>([]);
  const [includes, setIncludes] = useState<string[]>([]);
  const [excludes, setExcludes] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [extraSections, setExtraSections] = useState<ExtraSection[]>([]);

  // Section refs for scrolling
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const offset = 180; // sticky nav height + padding
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
      setActiveSection(sectionId);
    }
  };

  // AUTH CHECK
  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      navigate("/admin/login");
      return;
    }

    if (user.role !== "admin" && user.role !== "superadmin") {
      navigate("/admin/login");
      return;
    }

    setLoading(false);
  }, [navigate]);

  // LOAD TREK DATA IF EDITING
  useEffect(() => {
    if (isEditMode && !loading) {
      loadTrekData();
    }
  }, [isEditMode, loading]);

  const loadTrekData = async () => {
    try {
      const response = await api.get(`/api/treks/${id}`);
      const trek = response.data;

      setForm({
        name: trek.name || "",
        overview: trek.overview || "",
        difficulty: trek.difficulty || "Moderate",
        duration_days: trek.duration_days || 0,
        price_usd: trek.price_usd || 0,
        price_gbp: trek.price_gbp || 0,
        start_point: trek.start_point || "",
        end_point: trek.end_point || "",
        best_season: trek.best_season || "",
        group_size_min: trek.group_size_min || 1,
        group_size_max: trek.group_size_max || 15,
        max_altitude_meters: trek.max_altitude_meters || 0,
        image_url: trek.image_url || "",
        is_featured: trek.is_featured || false,
        is_active: trek.is_active || false,
        is_optional: trek.is_optional || false,
        has_offer: trek.has_offer || false,
        offer_title: trek.offer_title || "",
        offer_description: trek.offer_description || "",
        discounted_price_usd: trek.discounted_price_usd || 0,
        discounted_price_gbp: trek.discounted_price_gbp || 0,
        offer_valid_from: trek.offer_valid_from ? trek.offer_valid_from.split("T")[0] : "",
        offer_valid_to: trek.offer_valid_to ? trek.offer_valid_to.split("T")[0] : "",
      });

      setHighlights(trek.highlights || []);
      setIncludes(trek.includes || []);
      setExcludes(trek.excludes || []);
      setItinerary(trek.itinerary || []);
      setFaqs(trek.faqs || []);
      setExtraSections(trek.extra_sections || []);
    } catch (err: any) {
      console.error("Error loading trek:", err);
      alert("Failed to load trek data");
      navigate("/admin/treks");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setForm({ ...form, [name]: value === "" ? 0 : Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // HIGHLIGHTS
  const addHighlight = () => setHighlights([...highlights, ""]);
  const updateHighlight = (index: number, value: string) => {
    const updated = [...highlights];
    updated[index] = value;
    setHighlights(updated);
  };
  const removeHighlight = (index: number) =>
    setHighlights(highlights.filter((_, i) => i !== index));

  // INCLUDES
  const addInclude = () => setIncludes([...includes, ""]);
  const updateInclude = (index: number, value: string) => {
    const updated = [...includes];
    updated[index] = value;
    setIncludes(updated);
  };
  const removeInclude = (index: number) =>
    setIncludes(includes.filter((_, i) => i !== index));

  // EXCLUDES
  const addExclude = () => setExcludes([...excludes, ""]);
  const updateExclude = (index: number, value: string) => {
    const updated = [...excludes];
    updated[index] = value;
    setExcludes(updated);
  };
  const removeExclude = (index: number) =>
    setExcludes(excludes.filter((_, i) => i !== index));

  // ITINERARY
  const addItineraryDay = () => {
    setItinerary([
      ...itinerary,
      { day: itinerary.length + 1, title: "", description: "", highlights: [] },
    ]);
  };
  const updateItinerary = (index: number, field: keyof ItineraryDay, value: any) => {
    const updated = [...itinerary];
    (updated[index] as any)[field] = value;
    setItinerary(updated);
  };
  const removeItineraryDay = (index: number) =>
    setItinerary(itinerary.filter((_, i) => i !== index));

  // FAQs
  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const updateFaq = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };
  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));

  // EXTRA SECTIONS
  const addExtraSection = () =>
    setExtraSections([...extraSections, { title: "", content: "" }]);
  const updateExtraSection = (index: number, field: "title" | "content", value: string) => {
    const updated = [...extraSections];
    updated[index][field] = value;
    setExtraSections(updated);
  };
  const removeExtraSection = (index: number) =>
    setExtraSections(extraSections.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert("❌ Trek name is required!");
      return;
    }

    if (!form.overview.trim()) {
      alert("❌ Overview is required!");
      return;
    }

    setError("");
    setSubmitLoading(true);

    try {
      const token = getToken();

      if (!token) {
        alert("❌ No authentication token found. Please login again.");
        navigate("/admin/login");
        return;
      }

      const payload = {
        ...form,
        highlights,
        includes,
        excludes,
        itinerary,
        faqs,
        extra_sections: extraSections,
      };

      if (isEditMode) {
        await api.put(`/api/treks/${id}`, payload);
        alert("✅ Trek updated successfully!");
      } else {
        await api.post("/api/treks", payload);
        alert("✅ Trek created successfully!");
      }

      navigate("/admin/treks");
    } catch (err: any) {
      console.error("❌ Trek save error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Server error";
      setError(errorMsg);
      alert("❌ " + errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <p className="text-white p-8">Loading...</p>;

  return (
    <div className="p-8 text-white min-h-screen bg-slate-950">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/admin/treks")}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
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

      {/* ✅ STICKY SECTION NAVIGATION */}
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

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-8 max-w-6xl">
        {/* SECTION 1: BASIC INFORMATION */}
        <section
          id="basic"
          ref={(el) => (sectionRefs.current["basic"] = el)}
          className="bg-slate-900 rounded-lg p-6 scroll-mt-48"
        >
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Trek Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Everest Base Camp Trek"
                className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Overview *</label>
              <textarea
                name="overview"
                value={form.overview}
                onChange={handleChange}
                placeholder="Describe the trek..."
                rows={4}
                className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Image URL</label>
              <input
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Difficulty</label>
                <select
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                  className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                >
                  <option>Easy</option>
                  <option>Moderate</option>
                  <option>Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Duration (days)</label>
                <input
                  type="number"
                  name="duration_days"
                  value={form.duration_days || ""}
                  onChange={handleChange}
                  placeholder="e.g. 14"
                  min="0"
                  className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Max Altitude (meters)</label>
                <input
                  type="number"
                  name="max_altitude_meters"
                  value={form.max_altitude_meters || ""}
                  onChange={handleChange}
                  placeholder="e.g. 5364"
                  min="0"
                  className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Start Point</label>
                <input
                  name="start_point"
                  value={form.start_point}
                  onChange={handleChange}
                  placeholder="e.g. Kathmandu"
                  className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">End Point</label>
                <input
                  name="end_point"
                  value={form.end_point}
                  onChange={handleChange}
                  placeholder="e.g. Lukla"
                  className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Best Season</label>
              <input
                name="best_season"
                value={form.best_season}
                onChange={handleChange}
                placeholder="e.g. Spring, Autumn"
                className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: PRICING */}
        <section
          id="pricing"
          ref={(el) => (sectionRefs.current["pricing"] = el)}
          className="bg-slate-900 rounded-lg p-6 scroll-mt-48"
        >
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Price USD ($)</label>
              <input
                type="number"
                name="price_usd"
                value={form.price_usd || ""}
                onChange={handleChange}
                placeholder="e.g. 1500"
                min="0"
                step="0.01"
                className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Price GBP (£)</label>
              <input
                type="number"
                name="price_gbp"
                value={form.price_gbp || ""}
                onChange={handleChange}
                placeholder="e.g. 1200"
                min="0"
                step="0.01"
                className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* SECTION 3: GROUP SIZE */}
        <section
          id="group"
          ref={(el) => (sectionRefs.current["group"] = el)}
          className="bg-slate-900 rounded-lg p-6 scroll-mt-48"
        >
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Group Size</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Minimum Group Size</label>
              <input
                type="number"
                name="group_size_min"
                value={form.group_size_min || ""}
                onChange={handleChange}
                placeholder="e.g. 1"
                min="1"
                className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Maximum Group Size</label>
              <input
                type="number"
                name="group_size_max"
                value={form.group_size_max || ""}
                onChange={handleChange}
                placeholder="e.g. 15"
                min="1"
                className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: HIGHLIGHTS */}
        <section
          id="highlights"
          ref={(el) => (sectionRefs.current["highlights"] = el)}
          className="bg-slate-900 rounded-lg p-6 scroll-mt-48"
        >
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Highlights</h2>

          <div className="space-y-3">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={highlight}
                  onChange={(e) => updateHighlight(index, e.target.value)}
                  placeholder="e.g. Views of Mount Everest"
                  className="flex-1 p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                />
                <button
                  onClick={() => removeHighlight(index)}
                  className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              onClick={addHighlight}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Highlight
            </button>
          </div>
        </section>

        {/* SECTION 5: INCLUDES */}
        <section
          id="includes"
          ref={(el) => (sectionRefs.current["includes"] = el)}
          className="bg-slate-900 rounded-lg p-6 scroll-mt-48"
        >
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Cost Includes</h2>

          <div className="space-y-3">
            {includes.map((include, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={include}
                  onChange={(e) => updateInclude(index, e.target.value)}
                  placeholder="e.g. Professional guide"
                  className="flex-1 p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                />
                <button
                  onClick={() => removeInclude(index)}
                  className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              onClick={addInclude}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Include Item
            </button>
          </div>
        </section>

        {/* SECTION 6: EXCLUDES */}
        <section
          id="excludes"
          ref={(el) => (sectionRefs.current["excludes"] = el)}
          className="bg-slate-900 rounded-lg p-6 scroll-mt-48"
        >
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Cost Does Not Include</h2>

          <div className="space-y-3">
            {excludes.map((exclude, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={exclude}
                  onChange={(e) => updateExclude(index, e.target.value)}
                  placeholder="e.g. International flights"
                  className="flex-1 p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                />
                <button
                  onClick={() => removeExclude(index)}
                  className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              onClick={addExclude}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Exclude Item
            </button>
          </div>
        </section>

        {/* SECTION 7: ITINERARY */}
        <section
          id="itinerary"
          ref={(el) => (sectionRefs.current["itinerary"] = el)}
          className="bg-slate-900 rounded-lg p-6 scroll-mt-48"
        >
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Itinerary</h2>

          <div className="space-y-4">
            {itinerary.map((day, index) => (
              <div key={index} className="border border-slate-700 rounded-lg p-4 bg-slate-800/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Day {day.day}</h3>
                  <button
                    onClick={() => removeItineraryDay(index)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    value={day.title}
                    onChange={(e) => updateItinerary(index, "title", e.target.value)}
                    placeholder="Day Title (e.g. Kathmandu to Lukla)"
                    className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                  />
                  <textarea
                    value={day.description}
                    onChange={(e) => updateItinerary(index, "description", e.target.value)}
                    placeholder="Day Description"
                    rows={3}
                    className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={day.altitude || ""}
                      onChange={(e) => updateItinerary(index, "altitude", e.target.value)}
                      placeholder="Altitude (e.g. 2,610m)"
                      className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                    />
                    <input
                      value={day.distance || ""}
                      onChange={(e) => updateItinerary(index, "distance", e.target.value)}
                      placeholder="Distance (e.g. 5km)"
                      className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addItineraryDay}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Itinerary Day
            </button>
          </div>
        </section>

        {/* SECTION 8: OFFERS */}
        <section
          id="offers"
          ref={(el) => (sectionRefs.current["offers"] = el)}
          className="bg-slate-900 rounded-lg p-6 scroll-mt-48"
        >
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Special Offers</h2>

          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.has_offer}
                onChange={(e) => setForm({ ...form, has_offer: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <span className="font-semibold">This trek has a special offer</span>
            </label>

            {form.has_offer && (
              <div className="space-y-4 pl-7">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Offer Title</label>
                  <input
                    name="offer_title"
                    value={form.offer_title}
                    onChange={handleChange}
                    placeholder="e.g. Early Bird Discount"
                    className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">Offer Description</label>
                  <textarea
                    name="offer_description"
                    value={form.offer_description}
                    onChange={handleChange}
                    placeholder="Describe the offer..."
                    rows={2}
                    className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">
                      Discounted Price USD ($)
                    </label>
                    <input
                      type="number"
                      name="discounted_price_usd"
                      value={form.discounted_price_usd || ""}
                      onChange={handleChange}
                      placeholder="e.g. 1200"
                      min="0"
                      step="0.01"
                      className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">
                      Discounted Price GBP (£)
                    </label>
                    <input
                      type="number"
                      name="discounted_price_gbp"
                      value={form.discounted_price_gbp || ""}
                      onChange={handleChange}
                      placeholder="e.g. 900"
                      min="0"
                      step="0.01"
                      className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Valid From</label>
                    <input
                      type="date"
                      name="offer_valid_from"
                      value={form.offer_valid_from}
                      onChange={handleChange}
                      className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Valid To</label>
                    <input
                      type="date"
                      name="offer_valid_to"
                      value={form.offer_valid_to}
                      onChange={handleChange}
                      className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 9: FAQs */}
        <section
          id="faqs"
          ref={(el) => (sectionRefs.current["faqs"] = el)}
          className="bg-slate-900 rounded-lg p-6 scroll-mt-48"
        >
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">FAQs</h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-slate-700 rounded-lg p-4 bg-slate-800/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">FAQ {index + 1}</h3>
                  <button
                    onClick={() => removeFaq(index)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    value={faq.question}
                    onChange={(e) => updateFaq(index, "question", e.target.value)}
                    placeholder="Question"
                    className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                  />
                  <textarea
                    value={faq.answer}
                    onChange={(e) => updateFaq(index, "answer", e.target.value)}
                    placeholder="Answer"
                    rows={2}
                    className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addFaq}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add FAQ
            </button>
          </div>
        </section>

        {/* SECTION 10: EXTRA SECTIONS */}
        <section
          id="extra"
          ref={(el) => (sectionRefs.current["extra"] = el)}
          className="bg-slate-900 rounded-lg p-6 scroll-mt-48"
        >
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Extra Sections</h2>
          <p className="text-sm text-slate-400 mb-4">
            Add additional sections like "What to Bring", "Accommodation", etc.
          </p>

          <div className="space-y-4">
            {extraSections.map((section, index) => (
              <div key={index} className="border border-slate-700 rounded-lg p-4 bg-slate-800/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Section {index + 1}</h3>
                  <button
                    onClick={() => removeExtraSection(index)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    value={section.title}
                    onChange={(e) => updateExtraSection(index, "title", e.target.value)}
                    placeholder="Section Title"
                    className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                  />
                  <textarea
                    value={section.content}
                    onChange={(e) => updateExtraSection(index, "content", e.target.value)}
                    placeholder="Section Content"
                    rows={3}
                    className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addExtraSection}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Extra Section
            </button>
          </div>
        </section>

        {/* SECTION 11: TREK CATEGORIES */}
        <section
          id="categories"
          ref={(el) => (sectionRefs.current["categories"] = el)}
          className="bg-slate-900 rounded-lg p-6 scroll-mt-48"
        >
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Trek Categories</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-yellow-500 transition-colors">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <div>
                <div className="font-semibold">Featured Trek</div>
                <div className="text-xs text-slate-400">Show on homepage</div>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-green-500 transition-colors">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <div>
                <div className="font-semibold">Active</div>
                <div className="text-xs text-slate-400">Visible to users</div>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors">
              <input
                type="checkbox"
                checked={form.is_optional}
                onChange={(e) => setForm({ ...form, is_optional: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <div>
                <div className="font-semibold">Optional Activity</div>
                <div className="text-xs text-slate-400">Show in Optional Treks</div>
              </div>
            </label>
          </div>

          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-200">
            <strong>Note:</strong> If "Optional Activity" is checked, this trek will appear on
            the <strong>Optional Activities</strong> page. Otherwise, it will appear on the{" "}
            <strong>Destinations</strong> page.
          </div>
        </section>

        {/* SUBMIT BUTTONS */}
        <div className="flex gap-4 sticky bottom-0 bg-slate-950 py-4 border-t border-slate-800">
          <button
            onClick={handleSubmit}
            disabled={submitLoading}
            type="button"
            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors shadow-lg"
          >
            {submitLoading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update Trek"
                : "Create Trek"}
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
  );
}
