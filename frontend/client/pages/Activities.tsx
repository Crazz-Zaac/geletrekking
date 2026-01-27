import { Layout } from "@/components/Layout";
import { useState } from "react";
import { Tag, Share2, Facebook, Twitter, Linkedin } from "lucide-react";

interface Activity {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  date: string;
}

const activities: Activity[] = [
  {
    id: 1,
    title: "Community Trail Cleanup",
    description:
      "Join us as we maintain and improve trails in popular trekking destinations. This volunteer activity helps preserve nature and support local communities.",
    image:
      "https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=600&h=400&fit=crop",
    tags: ["volunteer", "environmental", "community"],
    date: "2024-02-15",
  },
  {
    id: 2,
    title: "Photography Workshop",
    description:
      "Learn landscape photography from professionals during our mountain expeditions. Capture stunning views and improve your skills.",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a08e8be313?w=600&h=400&fit=crop",
    tags: ["photography", "workshop", "learning"],
    date: "2024-02-20",
  },
  {
    id: 3,
    title: "Mountain Wellness Retreat",
    description:
      "Combine trekking with yoga and meditation. Experience wellness activities in the serene mountain environment.",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop",
    tags: ["wellness", "yoga", "meditation"],
    date: "2024-03-01",
  },
  {
    id: 4,
    title: "Local Culture Exchange",
    description:
      "Immerse yourself in local traditions, cuisine, and customs. Experience authentic mountain village life.",
    image:
      "https://images.unsplash.com/photo-1530281700549-f2b2038caf00?w=600&h=400&fit=crop",
    tags: ["cultural", "community", "experience"],
    date: "2024-03-10",
  },
];

const ALL_TAGS = Array.from(
  new Set(activities.flatMap((activity) => activity.tags))
).sort();

export default function Activities() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [shareOpen, setShareOpen] = useState<number | null>(null);

  const filteredActivities =
    selectedTags.length === 0
      ? activities
      : activities.filter((activity) =>
          selectedTags.some((tag) => activity.tags.includes(tag))
        );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Layout>
      <section className="bg-gradient-to-r from-brand-dark to-brand-navy text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Company Activities</h1>
          <p className="text-lg text-gray-200">
            Join us for special events and activities beyond trekking
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Tag Filter */}
        <div className="mb-12">
          <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-brand-accent" />
            Filter by Tags
          </h3>
          <div className="flex flex-wrap gap-3">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all capitalize ${
                  selectedTags.includes(tag)
                    ? "bg-brand-accent text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tag}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <img
                src={activity.image}
                alt={activity.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-brand-dark flex-1">
                    {activity.title}
                  </h3>
                  <span className="text-sm text-gray-500 ml-4 flex-shrink-0">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{activity.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {activity.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-brand-accent/10 text-brand-accent text-xs px-3 py-1 rounded-full capitalize"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <button
                    onClick={() =>
                      setShareOpen(shareOpen === activity.id ? null : activity.id)
                    }
                    className="flex items-center gap-2 bg-brand-accent hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                  {shareOpen === activity.id && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10">
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
                      >
                        <Facebook className="w-5 h-5" />
                        Facebook
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out ${activity.title} on GELE TREKKINGs!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700 border-t border-gray-200"
                      >
                        <Twitter className="w-5 h-5" />
                        Twitter
                      </a>
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700 border-t border-gray-200"
                      >
                        <Linkedin className="w-5 h-5" />
                        LinkedIn
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No activities match the selected tags
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
