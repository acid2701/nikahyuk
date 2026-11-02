"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export function useThemeColorSync() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const current = theme === "system" ? resolvedTheme : theme;
    let color = "#FFFFFF";
    if (current === "dark") {
      color = "#0B1120";
    } else if (current === "cute") {
      color = "#FFF5F5";
    }

    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", color);
  }, [theme, resolvedTheme]);
}
