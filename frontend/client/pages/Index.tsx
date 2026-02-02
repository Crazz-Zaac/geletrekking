import { Layout } from "@/components/Layout";
import { useHero } from "@/hooks/useHero";
import { Link } from "react-router-dom";
import { ArrowRight, Mountain, Users, MapPin, Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";

// Helper function to safely get a field value
const getField = (obj: any, ...fieldNames: string[]): any => {
  for (const field of fieldNames) {
    if (obj[field] !== undefined && obj[field] !== null && obj[field] !== '') {
      return obj[field];
    }
  }
  return null;
};

// Helper function to get trek image
const getTrekImage = (trek: any): string => {
  // Try to get image from various possible field names
  // IMPORTANT: image_url is your database field!
  const imageField = getField(
    trek,
    'image_url',    // ← YOUR DATABASE USES THIS! (with underscore)
    'images',
    'image',
    'imageUrl',     // camelCase version
    'coverImage',
    'thumbnail',
    'photo',
    'photos',
    'img',
    'picture'
  );
  
  // If it's an array, get the first item
  if (Array.isArray(imageField) && imageField.length > 0) {
    return imageField[0];
  }
  
  // If it's a string, return it
  if (typeof imageField === 'string' && imageField.trim() !== '') {
    return imageField;
  }
  
  // Fallback
  return "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop";
};

// Helper function to get trek name
const getTrekName = (trek: any): string => {
  return getField(trek, 'name', 'title', 'trekName', 'packageName') || 'Unnamed Trek';
};

// Helper function to get trek difficulty
const getTrekDifficulty = (trek: any): string => {
  const difficulty = getField(trek, 'difficulty', 'level', 'difficultyLevel') || 'Moderate';
  // Capitalize properly: "easy" → "Easy"
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
};

// Helper function to get trek duration
const getTrekDuration = (trek: any): string => {
  const duration = getField(
    trek,
    'duration',
    'days',
    'length',
    'tripDuration',
    'numberOfDays'
  );
  
  if (!duration) return 'N/A';
  
  // If it's already a string like "7 Days", return it
  if (typeof duration === 'string') return duration;
  
  // If it's a number, format it
  if (typeof duration === 'number') return `${duration} Days`;
  
  return 'N/A';
};

// Helper function to get trek rating
const getTrekRating = (trek: any): number => {
  const rating = getField(trek, 'rating', 'averageRating', 'stars');
  if (typeof rating === 'number' && rating > 0) return rating;
  return 5; // Default rating
};

export default function Index() {
  const { data: hero } = useHero();
  
  // State for fetched data
  const [treks, setTreks] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get API URL from environment or use default
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch data from your existing backend APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch treks
        const treksRes = await fetch(`${API_URL}/api/treks`);
        if (treksRes.ok) {
          const treksData = await treksRes.json();
          const allTreks = treksData.treks || treksData || [];
          setTreks(allTreks.slice(0, 3));
        }

        // Fetch gallery images
        const galleryRes = await fetch(`${API_URL}/api/gallery`);
        if (galleryRes.ok) {
          const galleryData = await galleryRes.json();
          const allImages = galleryData.images || galleryData || [];
          setGallery(allImages.slice(0, 3));
        }

        // Fetch testimonials
        const testimonialsRes = await fetch(`${API_URL}/api/testimonials`);
        if (testimonialsRes.ok) {
          const testimonialsData = await testimonialsRes.json();
          const allTestimonials = testimonialsData.testimonials || testimonialsData || [];
          setTestimonials(allTestimonials.slice(0, 5));
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-screen bg-cover bg-center bg-no-repeat overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `${hero?.overlay || 'linear-gradient(135deg, rgba(13, 110, 140, 0.5) 0%, rgba(59, 130, 246, 0.5) 100%)'} , url("${hero?.backgroundImage || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=1200&fit=crop"}")`,
            backgroundPosition: "center",
          }}
        />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {hero?.title || "Explore the World, One Trail at a Time"}
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
              {hero?.subtitle || "Embark on unforgettable journeys through breathtaking landscapes."}
            </p>
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 bg-brand-accent hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95"
            >
              Explore Destinations
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-white">
            <span className="text-sm">Scroll to explore</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-brand-dark mb-16">
            Why Choose GELE TREKKING?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Mountain className="w-12 h-12 text-brand-accent" />,
                title: "Expert Guides",
                description:
                  "Professional guides with decades of experience leading treks across the world.",
              },
              {
                icon: <Users className="w-12 h-12 text-brand-accent" />,
                title: "Community",
                description:
                  "Join a community of passionate adventurers and explore together.",
              },
              {
                icon: <MapPin className="w-12 h-12 text-brand-accent" />,
                title: "Diverse Destinations",
                description:
                  "Choose from hundreds of carefully curated trek packages worldwide.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="text-center p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-brand-dark mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations - FROM DATABASE */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-brand-dark mb-4">
            Featured Destinations
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Discover some of our most popular and breathtaking trek packages
          </p>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-brand-accent" />
            </div>
          ) : treks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {treks.map((trek) => {
                const trekImage = getTrekImage(trek);
                const trekName = getTrekName(trek);
                const trekDifficulty = getTrekDifficulty(trek);
                const trekDuration = getTrekDuration(trek);
                const trekRating = getTrekRating(trek);
                
                return (
                  <Link
                    key={trek._id}
                    to={`/destination/${trek._id}`}
                    className="block bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
                  >
                    <div className="relative overflow-hidden h-64">
                      <img
                        src={trekImage}
                        alt={trekName}
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop";
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-brand-accent text-white px-4 py-2 rounded-lg">
                        {trekDifficulty}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-brand-dark mb-2 group-hover:text-brand-accent transition-colors">
                        {trekName}
                      </h3>
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-sm text-gray-600">
                          {trekDuration}
                        </span>
                        <span className="flex items-center gap-1 text-brand-accent">
                          {[...Array(Math.round(trekRating))].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </span>
                      </div>
                      <span className="inline-block text-brand-accent font-semibold group-hover:gap-2 transition-all">
                        Learn More →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl">No featured destinations available yet.</p>
              <p className="mt-2">Check back soon for amazing treks!</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 bg-brand-accent hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all"
            >
              View All Destinations
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Section - FROM DATABASE */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-brand-dark mb-4">
            Stunning Destinations
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Get inspired by our most breathtaking trek destinations
          </p>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-brand-accent" />
            </div>
          ) : gallery.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gallery.map((photo) => (
                <div
                  key={photo._id}
                  className="relative overflow-hidden rounded-lg h-64 group cursor-pointer"
                >
                  <img
                    src={photo.imageUrl || photo.image || photo.url}
                    alt={photo.title || photo.name || 'Gallery Image'}
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop";
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                    <div className="p-4 text-white w-full translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="font-semibold text-lg">{photo.title || photo.name || 'Beautiful View'}</p>
                      {photo.description && (
                        <p className="text-sm text-gray-200 mt-1">{photo.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl">No gallery images available yet.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 bg-brand-accent hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all"
            >
              View Full Gallery
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Experience Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-teal-600 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Our Experience</h2>
          <p className="text-center text-blue-100 mb-16 max-w-2xl mx-auto">
            Join thousands of adventurers who have discovered the world's most beautiful destinations
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                number: "25+",
                label: "Years Of Experiences",
                icon: "📅",
              },
              {
                number: "60+",
                label: "Best Destinations",
                icon: "🗺️",
              },
              {
                number: "3,210+",
                label: "Satisfied Trekkers",
                icon: "👥",
              },
              {
                number: "40+",
                label: "Countries of International Trekkers",
                icon: "🌍",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="text-center p-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
              >
                <div className="text-5xl mb-4">{stat.icon}</div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - FROM DATABASE */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-brand-dark mb-4">
            What Our Adventurers Say
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Real stories from people who've explored the world with us
          </p>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-brand-accent" />
            </div>
          ) : testimonials.length > 0 ? (
            <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial._id}
                  className="flex-shrink-0 w-96 bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.text || testimonial.message || testimonial.review}"
                  </p>
                  <div>
                    <p className="font-semibold text-brand-dark">
                      {testimonial.name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {testimonial.location || 'Location not specified'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl">No testimonials available yet.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/testimonials"
              className="inline-flex items-center gap-2 bg-brand-accent hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all"
            >
              Read More Reviews
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-teal-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready for Your Next Adventure?</h2>
          <p className="text-lg mb-8 text-gray-100">
            Browse our curated collection of treks and book your unforgettable journey today.
          </p>
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 bg-brand-accent hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            Start Exploring
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </Layout>
  );
}
