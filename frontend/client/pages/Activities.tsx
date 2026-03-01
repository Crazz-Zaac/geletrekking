import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

function ParticleWaveHero() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 40);
    return () => clearInterval(t);
  }, []);

  const dots = Array.from({ length: 40 }, (_, i) => ({
    x: (i / 40) * 100,
    baseY: 75,
    amp: 8 + (i % 5) * 3,
    speed: 0.05 + (i % 4) * 0.02,
    phase: i * 0.4,
    size: i % 6 === 0 ? 3 : 2,
    color: i % 3 === 0 ? "#5eead4" : i % 3 === 1 ? "#fbbf24" : "#6366f1"
  }));

  return (
    <section className="relative overflow-hidden pt-28 pb-16 text-white text-center" style={{ background: "#0f172a", minHeight: "280px" }}>
      {/* SVG particle wave */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {dots.map((dot, i) => (
          <circle
            key={i}
            cx={`${dot.x}%`}
            cy={`${dot.baseY + Math.sin(tick * dot.speed + dot.phase) * dot.amp}%`}
            r={dot.size}
            fill={dot.color}
            opacity={0.4 + Math.sin(tick * 0.03 + i) * 0.3}
          />
        ))}
        <polyline
          points={dots.map(dot =>
            `${dot.x * 10},${(dot.baseY + Math.sin(tick * dot.speed + dot.phase) * dot.amp) * 2.8}`
          ).join(" ")}
          fill="none"
          stroke="rgba(94,234,212,0.15)"
          strokeWidth="1"
        />
      </svg>

      {/* Text content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        <p style={{ fontSize: "11px", color: "#5eead4", letterSpacing: "0.3em", marginBottom: "10px" }}>
          ✦ GELE TREKKING
        </p>
        <h1 className="text-5xl font-extrabold mb-4">
          Company <span style={{ color: "#fbbf24" }}>Activities</span>
        </h1>
        <p className="text-blue-200 text-lg max-w-xl mx-auto">
          Where every journey begins with community
        </p>
      </div>
    </section>
  );
}

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

        {/* Hero — Style 6: Particle Wave Animation */}
        <ParticleWaveHero />

        {/* Grid */}
        <section className="py-16 max-w-7xl mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activities.map((activity: any) => (
                <div
                  key={activity._id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Image */}
                  {activity.image ? (
                    <img
                      src={activity.image}
                      alt={activity.title}
                      className="w-full h-52 object-cover"
                    />
                  ) : (
                    <div className="w-full h-52 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                      <span className="text-5xl">🏔️</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h2 className="text-xl font-bold text-gray-900">{activity.title}</h2>
                      <span className="text-xs text-gray-400 whitespace-nowrap mt-1">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {activity.description}
                    </p>

                    {/* Tags */}
                    {activity.tags && activity.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {activity.tags.map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100 font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Share */}
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: activity.title,
                            text: activity.description,
                            url: window.location.href,
                          });
                        }
                      }}
                      className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <div className="text-6xl mb-4">🏔️</div>
              <p className="text-xl font-semibold text-gray-700">No activities yet</p>
              <p className="text-sm mt-2">Check back soon for upcoming events!</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
