import { Layout } from "@/components/Layout";
import { useHero } from "@/hooks/useHero";
import { Link } from "react-router-dom";
import { ArrowRight, Mountain, Users, MapPin, Star, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function Index() {
  const { data: hero } = useHero();
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
            Why Choose GELE TREKKINGs?
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

      {/* Featured Destinations */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-brand-dark mb-4">
            Featured Destinations
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Discover some of our most popular and breathtaking trek packages
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                id: 1,
                name: "Everest Base Camp",
                difficulty: "Hard",
                days: "14 Days",
                image:
                  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
              },
              {
                id: 2,
                name: "Kilimanjaro Summit",
                difficulty: "Moderate",
                days: "7 Days",
                image:
                  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop",
              },
              {
                id: 3,
                name: "Machu Picchu Trail",
                difficulty: "Moderate",
                days: "4 Days",
                image:
                  "https://images.unsplash.com/photo-1587595431973-160550115063?w=400&h=300&fit=crop",
              },
            ].map((destination) => (
              <Link
                key={destination.id}
                to={`/destination/${destination.id}`}
                className="block bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
              >
                <div className="relative overflow-hidden h-64">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-brand-accent text-white px-4 py-2 rounded-lg">
                    {destination.difficulty}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-brand-dark mb-2 group-hover:text-brand-accent transition-colors">
                    {destination.name}
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm text-gray-600">
                      {destination.days}
                    </span>
                    <span className="flex items-center gap-1 text-brand-accent">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </span>
                  </div>
                  <span
                    className="inline-block text-brand-accent font-semibold group-hover:gap-2 transition-all"
                  >
                    Learn More →
                  </span>
                </div>
              </Link>
            ))}
          </div>
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

      {/* Gallery Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-brand-dark mb-4">
            Stunning Destinations
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Get inspired by our most breathtaking trek destinations
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
                alt: "Snow-covered mountain peak",
                title: "High Peaks",
              },
              {
                src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop",
                alt: "Golden mountain landscape",
                title: "Sunlit Summits",
              },
              {
                src: "https://images.unsplash.com/photo-1587595431973-160550115063?w=400&h=300&fit=crop",
                alt: "Ancient mountain ruins",
                title: "Ancient Wonders",
              },
            ].map((photo, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-lg h-64 group cursor-pointer"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                  <div className="p-4 text-white w-full translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="font-semibold text-lg">{photo.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-brand-dark mb-4">
            What Our Adventurers Say
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Real stories from people who've explored the world with us
          </p>
          <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
            {[
              {
                name: "Sarah Johnson",
                location: "New York, USA",
                text: "The Everest Base Camp trek was life-changing! The guides were knowledgeable and the experience unforgettable.",
                rating: 5,
              },
              {
                name: "Marco Rossi",
                location: "Rome, Italy",
                text: "Kilimanjaro was the adventure of a lifetime. Every moment was worth it. Highly recommended!",
                rating: 5,
              },
              {
                name: "Elena García",
                location: "Madrid, Spain",
                text: "The Machu Picchu trail exceeded all expectations. The team made it magical and safe.",
                rating: 5,
              },
              {
                name: "David Chen",
                location: "Singapore",
                text: "Professional guides, incredible views, and an amazing community. Can't wait for the next trek!",
                rating: 5,
              },
              {
                name: "Priya Patel",
                location: "Mumbai, India",
                text: "This company understands adventure. Every detail was thoughtfully planned.",
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-96 bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-brand-dark">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
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

      {/* Social Media Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-brand-dark mb-4">Follow Our Adventures</h2>
          <p className="text-gray-600 text-lg mb-8">
            Stay connected with us on social media to see stunning photos, trek updates, and travel tips
          </p>
          <div className="flex gap-6 justify-center items-center flex-wrap">
            <a
              href="https://www.facebook.com/trekways"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Facebook className="w-5 h-5" />
              Facebook
            </a>
            <a
              href="https://www.instagram.com/trekways"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Instagram className="w-5 h-5" />
              Instagram
            </a>
            <a
              href="https://twitter.com/trekways"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Twitter className="w-5 h-5" />
              Twitter
            </a>
            <a
              href="https://www.linkedin.com/company/trekways"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-800 hover:bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Linkedin className="w-5 h-5" />
              LinkedIn
            </a>
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
