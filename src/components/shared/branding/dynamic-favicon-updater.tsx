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

    // Remove any hardcoded or auto-injected favicon links
    const existingLinks = document.querySelectorAll("link[rel*='icon']");
    existingLinks.forEach((el) => {
      if (el.getAttribute("href") !== faviconUrl) {
        el.remove();
      }
    });

    // Create or update canonical link icon
    let link: HTMLLinkElement | null = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconUrl;

    let shortcut: HTMLLinkElement | null = document.querySelector("link[rel='shortcut icon']");
    if (!shortcut) {
      shortcut = document.createElement("link");
      shortcut.rel = "shortcut icon";
      document.head.appendChild(shortcut);
    }
    shortcut.href = faviconUrl;
  }, [branding.faviconUrl, initialFavicon]);

  return null;
}
