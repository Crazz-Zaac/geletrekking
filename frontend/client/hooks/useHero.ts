import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export type HeroSection = {
  title: string;
  subtitle: string;
  backgroundImage: string;
  overlay: string;
  ctaText: string;
  ctaLink: string;
};

export function useHero() {
  return useQuery({
    queryKey: ["hero-section"],
    queryFn: async () => {
      const res = await api.get<HeroSection>("/api/hero");
      return res.data;
    },
    staleTime: 60_000,
  });
}
