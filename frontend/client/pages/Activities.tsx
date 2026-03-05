import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { Share2, Calendar, Tag, Mountain } from "lucide-react";

export default function Activities() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const res = await api.get("/api/activities");
      return res.data;
    },
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">

        {/* ── Simple Hero ── */}
        <section className="relative h-56 overflow-hidden">
          {/* Background image */}
          <img
            src="/geletrekking.png"
            alt="Activities Hero"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.45)" }}
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, rgba(15,23,42,0.7) 0%, rgba(15,23,42,0.3) 100%)",
            }}
          />
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center px-8 max-w-7xl mx-auto">
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.3em",
                color: "#fbbf24",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Gele Trekking
            </p>
            <h1
              style={{
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.15,
              }}
            >
              Company Activities
            </h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, marginTop: 8 }}>
              Where every journey begins with community
            </p>
          </div>
        </section>

        {/* ── Grid ── */}
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Count badge */}
          {!isLoading && activities?.length > 0 && (
            <div className="flex items-center gap-2 mb-8">
              <span className="text-sm font-semibold text-gray-500">
                {activities.length} {activities.length === 1 ? "Activity" : "Activities"}
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-24">
              <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {activities.map((activity: any) => (
                <ActivityCard key={activity._id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 text-gray-400">
              <Mountain className="w-14 h-14 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold text-gray-600">No activities yet</p>
              <p className="text-sm mt-1">Check back soon for upcoming events!</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

function ActivityCard({ activity }: { activity: any }) {
  const [shared, setShared] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: activity.title,
        text: activity.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const formattedDate = activity.date
    ? new Date(activity.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Image — small/compact */}
      <div className="relative w-full h-44 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
        {activity.image ? (
          <img
            src={activity.image}
            alt={activity.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Mountain className="w-12 h-12 text-slate-300" />
          </div>
        )}
        {/* Date chip overlaid on image */}
        {formattedDate && (
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: "rgba(15,23,42,0.65)", color: "#fff", backdropFilter: "blur(6px)" }}
          >
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h2 className="text-base font-bold text-gray-900 mb-2 leading-snug">
          {activity.title}
        </h2>

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
          {activity.description}
        </p>

        {/* Tags */}
        {activity.tags && activity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {activity.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium"
                style={{ background: "#fff7ed", color: "#ea580c", border: "1px solid #fed7aa" }}
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer row */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">Gele Trekking</span>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{
              background: shared ? "#dcfce7" : "#fff7ed",
              color: shared ? "#16a34a" : "#ea580c",
              border: shared ? "1px solid #bbf7d0" : "1px solid #fed7aa",
            }}
          >
            <Share2 className="w-3.5 h-3.5" />
            {shared ? "Copied!" : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
