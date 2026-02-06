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

  const heroImageUrl = heroData?.heroImageUrl;

  const openLightbox = (image: any, index: number) => {
    setLightboxImage(image);
    setLightboxImages(filteredItems);
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
      <div className="min-h-screen bg-white">
        {/* Hero Section with Dynamic Background Image */}
        <section className="pt-32 pb-16 relative overflow-hidden">
          {/* Background Image */}
          {heroImageUrl ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImageUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 to-teal-900/70" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50" />
          )}
          
          {/* Content */}
          <div className="container mx-auto px-4 relative z-10">
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
              heroImageUrl ? "text-white" : "text-gray-900"
            }`}>
              Gallery
            </h1>
            <p className={`text-lg max-w-2xl ${
              heroImageUrl ? "text-white/90" : "text-gray-600"
            }`}>
              Moments from our treks and adventures.
            </p>
          </div>
        </section>

        {/* Category Filters */}
        {categories.length > 0 && (
          <section className="py-6 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-5 py-2 rounded-full font-semibold transition-all ${
                    selectedCategory === "all"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2 rounded-full font-semibold transition-all ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="text-center text-gray-600 py-12">Loading...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg">No images found{selectedCategory !== "all" ? ` in ${selectedCategory}` : ""}.</p>
              </div>
            ) : (
              <>
                {/* Results count */}
                <div className="mb-6 text-sm text-gray-600">
                  Showing {filteredItems.length} {filteredItems.length === 1 ? "image" : "images"}
                  {selectedCategory !== "all" && ` in ${selectedCategory}`}
                </div>

                {/* Single Grid - ALL IMAGES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map((item: any, index: number) => (
                    <div
                      key={item._id}
                      onClick={() => openLightbox(item, index)}
                      className="rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-2xl transition-all group cursor-pointer transform hover:-translate-y-1"
                    >
                      <div className="h-64 bg-gray-100 relative overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.title || "Gallery image"}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {item.isFeatured && (
                          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            Featured
                          </div>
                        )}
                        
                        {/* Hover overlay - show category */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                          {item.category && (
                            <div className="text-white">
                              <p className="text-sm font-medium mb-1 uppercase tracking-wide opacity-80">
                                {item.category}
                              </p>
                              {item.title && (
                                <p className="text-lg font-semibold">
                                  {item.title}
                                </p>
                              )}
                            </div>
                          )}
                          {/* Zoom indicator */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="bg-white/90 rounded-full p-3">
                              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div 
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>

            {/* Previous button */}
            {lightboxImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3 hover:bg-black/70"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {/* Next button */}
            {lightboxImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3 hover:bg-black/70"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            {/* Main image */}
            <div 
              className="relative max-w-7xl max-h-[90vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxImage.imageUrl}
                alt={lightboxImage.title || "Gallery image"}
                className="max-w-full max-h-[90vh] object-contain"
              />
              
              {/* Image info */}
              {(lightboxImage.title || lightboxImage.category) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                  {lightboxImage.title && (
                    <h3 className="text-xl font-semibold mb-1">
                      {lightboxImage.title}
                    </h3>
                  )}
                  {lightboxImage.category && (
                    <p className="text-sm text-gray-300">{lightboxImage.category}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}