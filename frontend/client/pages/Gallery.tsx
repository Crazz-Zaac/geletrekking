import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useState, useMemo } from "react";

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: items, isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => (await api.get("/api/gallery")).data,
  });

  const { data: heroData } = useQuery({
    queryKey: ["gallery-hero"],
    queryFn: async () => (await api.get("/api/gallery/hero")).data,
  });

  // Extract unique categories from featured items
  const categories = useMemo(() => {
    if (!items) return [];
    
    const featuredItems = items.filter((item: any) => item.isFeatured);
    const uniqueCategories = Array.from(
      new Set(
        featuredItems
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

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((i: any) => (
                    <div
                      key={i._id}
                      className="rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow"
                    >
                      <div className="h-56 bg-gray-100 relative">
                        <img
                          src={i.imageUrl}
                          alt={i.title || "Gallery image"}
                          className="h-full w-full object-cover"
                        />
                        {i.isFeatured && (
                          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            Featured
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="font-semibold text-gray-900">
                          {i.title || "Untitled"}
                        </div>
                        {i.category && (
                          <div className="text-sm text-gray-500 mt-1">
                            {i.category}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
