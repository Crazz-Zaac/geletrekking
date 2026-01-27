import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export type SiteSettings = {
  siteName: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
};

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const res = await api.get<SiteSettings>("/api/settings");
      return res.data;
    },
    staleTime: 60_000,
  });
}
