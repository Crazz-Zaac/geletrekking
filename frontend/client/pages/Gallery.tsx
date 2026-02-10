import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lightboxImage, setLightboxImage] = useState<any | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [lightboxImages, setLightboxImages] = useState<any[]>([]);

  const { data: items, isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => (await api.get("/api/gallery")).data,
  });

  const { data: heroData } = useQuery({
    queryKey: ["gallery-hero"],
    queryFn: async () => (await api.get("/api/gallery/hero")).data,
  });

  // Extract unique categories from ALL items
  const categories = useMemo(() => {
    if (!items) return [];
    
    const uniqueCategories = Array.from(
      new Set(
        items
          .map((item: any) => item.category)
          .filter((cat: string) => cat && cat.trim())
      )
    ) as string[];
    
    return uniqueCategories.sort();
  }, [items]);

  // Filter items based on selected category
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (selectedCategory === "all") return items;
    
    return items.filter((item: any) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  // Group items by category for stacking
  const stackedCategories = useMemo(() => {
    if (!filteredItems) return [];
    
    const grouped = filteredItems.reduce((acc: any, item: any) => {
      const category = item.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
    
    // Convert to array format for rendering
    return Object.entries(grouped).map(([category, images]: [string, any]) => ({
      category,
      images
    }));
  }, [filteredItems]);

  const heroImageUrl = heroData?.heroImageUrl;

  const openLightbox = (image: any, categoryImages: any[], e: React.MouseEvent) => {
    e.stopPropagation();
    const index = categoryImages.findIndex(item => item._id === image._id);
    setLightboxImage(image);
    setLightboxImages(categoryImages);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setLightboxImages([]);
    setLightboxIndex(0);
  };

  const nextImage = () => {
    const newIndex = (lightboxIndex + 1) % lightboxImages.length;
    setLightboxIndex(newIndex);
    setLightboxImage(lightboxImages[newIndex]);
  };

  const prevImage = () => {
    const newIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    setLightboxIndex(newIndex);
    setLightboxImage(lightboxImages[newIndex]);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!lightboxImage) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  };

  // Add keyboard listener
  useState(() => {
    window.addEventListener("keydown", handleKeyDown as any);
    return () => window.removeEventListener("keydown", handleKeyDown as any);
  });

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Outfit:wght@300;400;500;600&display=swap');
        
        .gallery-container {
          font-family: 'Outfit', sans-serif;
        }
        
        .gallery-title {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
        }
        
        .category-badge {
          font-family: 'Outfit', sans-serif;
          letter-spacing: 0.05em;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .stack-card {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .stack-container:hover .stack-card {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .gradient-border {
          position: relative;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2px;
          border-radius: 24px;
        }
        
        .gradient-border-inner {
          background: white;
          border-radius: 22px;
          width: 100%;
          height: 100%;
        }
        
        .noise-texture {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
          mix-blend-mode: overlay;
        }
      `}</style>
      
      <div className="min-h-screen gallery-container" style={{ background: 'linear-gradient(to bottom, #fdfcfb 0%, #e2d1c3 100%)' }}>
        {/* Hero Section with Artistic Background */}
        <section className="pt-40 pb-24 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0">
            {heroImageUrl ? (
              <>
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-20"
                  style={{ 
                    backgroundImage: `url(${heroImageUrl})`,
                    filter: 'blur(40px)'
                  }}
                />
              </>
            ) : null}
            
            {/* Organic shapes */}
            <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-amber-200/30 to-rose-300/30 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-blue-200/30 to-purple-300/30 rounded-full blur-3xl" />
            <div className="noise-texture absolute inset-0" />
          </div>
          
          {/* Content */}
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="gallery-title text-7xl md:text-8xl mb-6 text-gray-900 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Gallery
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 font-light animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                A curated collection of moments from our adventures
              </p>
              
              {/* Decorative divider */}
              <div className="mt-8 flex items-center justify-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Category Filters */}
        {categories.length > 0 && (
          <section className="py-8 relative z-20">
            <div className="container mx-auto px-6">
              <div className="max-w-5xl mx-auto">
                <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-3xl p-6 shadow-2xl shadow-black/10">
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`category-badge px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                        selectedCategory === "all"
                          ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/50"
                          : "bg-white/80 text-gray-700 hover:bg-white border border-gray-200"
                      }`}
                    >
                      All Collections
                    </button>
                    {categories.map((category, idx) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`category-badge px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                          selectedCategory === category
                            ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/50"
                            : "bg-white/80 text-gray-700 hover:bg-white border border-gray-200"
                        }`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              {isLoading ? (
                <div className="text-center py-20">
                  <div className="inline-block w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-block p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/40">
                    <p className="text-xl text-gray-600 font-light">
                      No moments captured yet{selectedCategory !== "all" ? ` in ${selectedCategory}` : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Results count */}
                  <div className="mb-12 text-center animate-fade-in-up">
                    <p className="text-lg text-gray-600 font-light">
                      {stackedCategories.length} {stackedCategories.length === 1 ? "collection" : "collections"} 
                      <span className="mx-2">·</span> 
                      {filteredItems.length} {filteredItems.length === 1 ? "moment" : "moments"}
                    </p>
                  </div>

                  {/* Stacked Categories Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {stackedCategories.map(({ category, images }, stackIdx) => (
                      <div 
                        key={category} 
                        className="stack-container relative animate-fade-in-up"
                        style={{ 
                          minHeight: '400px',
                          animationDelay: `${stackIdx * 0.1}s`
                        }}
                      >
                        {/* Category label with premium styling */}
                        <div className="absolute -top-6 left-6 z-30">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-rose-400 blur-lg opacity-60" />
                            <div className="relative category-badge bg-gradient-to-r from-amber-500 to-rose-500 text-white px-6 py-2.5 rounded-full font-semibold shadow-xl flex items-center gap-2">
                              <span className="text-sm uppercase tracking-wider">{category}</span>
                              <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs">{images.length}</span>
                            </div>
                          </div>
                        </div>

                        {/* Stacked images with enhanced styling */}
                        <div className="relative h-full pt-4">
                          {images.map((item: any, index: number) => (
                            <div
                              key={item._id}
                              className="stack-card absolute inset-0 cursor-pointer group/card"
                              style={{
                                transform: `translateY(${index * 6}px) translateX(${index * 3}px) rotate(${index * 1}deg)`,
                                zIndex: images.length - index,
                              }}
                            >
                              {/* Collapsed state - show only first image with premium card design */}
                              <div 
                                className="h-full w-full transition-all duration-500 ease-out group-hover/stack:opacity-0 group-hover/stack:pointer-events-none"
                                style={{
                                  transitionDelay: `${index * 60}ms`,
                                }}
                              >
                                {index === 0 && (
                                  <div className="h-full relative overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20 border border-gray-200/50">
                                    {/* Image with overlay gradient */}
                                    <div className="absolute inset-0">
                                      <img
                                        src={item.imageUrl}
                                        alt={item.title || "Gallery image"}
                                        className="h-full w-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                    </div>
                                    
                                    {/* Featured badge with glow */}
                                    {item.isFeatured && (
                                      <div className="absolute top-5 right-5">
                                        <div className="relative">
                                          <div className="absolute inset-0 bg-yellow-400 blur-md opacity-75" />
                                          <div className="relative bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900 px-4 py-2 rounded-full text-xs font-bold shadow-xl uppercase tracking-wider">
                                            ✨ Featured
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Bottom info bar */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                      <p className="text-sm font-medium opacity-90 mb-1">Hover to reveal collection</p>
                                      <div className="h-1 w-12 bg-white/50 rounded-full" />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Expanded state on hover - all images visible and clickable with premium styling */}
                              <div 
                                onClick={(e) => openLightbox(item, images, e)}
                                className="absolute inset-0 opacity-0 group-hover/stack:opacity-100 transition-all duration-500 ease-out"
                                style={{
                                  transform: `translateY(${index * 90}px)`,
                                  transitionDelay: `${index * 60}ms`,
                                }}
                              >
                                <div className="h-72 relative overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20 border border-gray-200/50 hover:shadow-3xl hover:scale-[1.02] transition-all duration-300">
                                  {/* Image */}
                                  <div className="absolute inset-0 overflow-hidden">
                                    <img
                                      src={item.imageUrl}
                                      alt={item.title || "Gallery image"}
                                      className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                  </div>
                                  
                                  {/* Featured badge */}
                                  {item.isFeatured && (
                                    <div className="absolute top-4 right-4">
                                      <div className="relative">
                                        <div className="absolute inset-0 bg-yellow-400 blur-md opacity-75" />
                                        <div className="relative bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-xl uppercase tracking-wider">
                                          ✨ Featured
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Hover overlay with title and click indicator */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                                    <div className="text-white transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300">
                                      {item.title && (
                                        <p className="text-lg font-semibold mb-2 gallery-title">
                                          {item.title}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-2 text-sm opacity-90">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span>Click to view</span>
                                      </div>
                                    </div>
                                    
                                    {/* Decorative corner accent */}
                                    <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-white/30 rounded-br-2xl" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Premium Lightbox Modal */}
        {lightboxImage && (
          <div 
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center backdrop-blur-sm"
            onClick={closeLightbox}
          >
            {/* Close button with premium styling */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/90 hover:text-white transition-all z-50 bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20 hover:rotate-90 duration-300"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image counter with premium styling */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-white backdrop-blur-md bg-white/10 px-6 py-3 rounded-full border border-white/20">
              <span className="font-medium">{lightboxIndex + 1}</span>
              <span className="mx-2 opacity-50">/</span>
              <span className="opacity-75">{lightboxImages.length}</span>
            </div>

            {/* Navigation buttons with premium styling */}
            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white transition-all backdrop-blur-md bg-white/10 rounded-full p-4 hover:bg-white/20 hover:scale-110 border border-white/20"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white transition-all backdrop-blur-md bg-white/10 rounded-full p-4 hover:bg-white/20 hover:scale-110 border border-white/20"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Main image with premium frame */}
            <div 
              className="relative max-w-7xl max-h-[85vh] mx-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={lightboxImage.imageUrl}
                  alt={lightboxImage.title || "Gallery image"}
                  className="max-w-full max-h-[85vh] object-contain"
                />
              </div>
              
              {/* Image info with premium styling */}
              {(lightboxImage.title || lightboxImage.category) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-8 rounded-b-2xl">
                  <div className="backdrop-blur-sm">
                    {lightboxImage.title && (
                      <h3 className="gallery-title text-3xl font-bold mb-2 text-white">
                        {lightboxImage.title}
                      </h3>
                    )}
                    {lightboxImage.category && (
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-8 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full" />
                        <p className="text-sm text-gray-300 uppercase tracking-wider font-medium">{lightboxImage.category}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
