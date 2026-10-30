"use client";

import * as React from "react";
import { useAppBranding } from "@/hooks/use-app-branding";

/**
 * DynamicFaviconUpdater:
 * Ensures browser favicon tag updates immediately on client navigation or after admin branding saves,
 * avoiding browser HTTP tab icon caching delays.
 */
export function DynamicFaviconUpdater({ initialFavicon }: { initialFavicon?: string }) {
  const { branding } = useAppBranding(initialFavicon ? { faviconUrl: initialFavicon } : undefined);

  React.useEffect(() => {
    const faviconUrl = branding.faviconUrl || initialFavicon;
    if (!faviconUrl) return;

    // Find or create favicon link tag
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement("link");
      link.type = "image/x-icon";
      link.rel = "shortcut icon";
      document.getElementsByTagName("head")[0].appendChild(link);
    }
    link.href = faviconUrl;
  }, [branding.faviconUrl, initialFavicon]);

  return null;
}
