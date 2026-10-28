"use client";

import * as React from "react";

export interface AppBrandingState {
  appName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaButtonText: string;
  contactEmail: string;
}

const DEFAULT_BRANDING: AppBrandingState = {
  appName: "NikahYuk",
  tagline: "Wedding & Event Companion SaaS",
  logoUrl: "",
  faviconUrl: "",
  heroTitle: "Kelola Pernikahan Impian Anda dengan Mudah & Terstruktur",
  heroSubtitle:
    "Platform all-in-one terdepan untuk Pasangan Pengantin & Wedding Organizer (WO) di Indonesia.",
  ctaButtonText: "Mulai Workspace Gratis",
  contactEmail: "support@nikahyu.my.id",
};

/**
 * Reusable hook to consume active app branding in client components
 * Automatically caches in memory and falls back safely.
 */
export function useAppBranding(initialBranding?: Partial<AppBrandingState>) {
  const [branding, setBranding] = React.useState<AppBrandingState>({
    ...DEFAULT_BRANDING,
    ...initialBranding,
  });
  const [loading, setLoading] = React.useState<boolean>(!initialBranding);

  const fetchBranding = React.useCallback(async () => {
    try {
      const res = await fetch("/api/public/branding");
      if (res.ok) {
        const json = await res.json();
        if (json.branding) {
          setBranding((prev) => ({ ...prev, ...json.branding }));
        }
      }
    } catch (e) {
      console.warn("[useAppBranding] fallback to default:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!initialBranding) {
      fetchBranding();
    }
  }, [fetchBranding, initialBranding]);

  return {
    branding,
    loading,
    refresh: fetchBranding,
  };
}
