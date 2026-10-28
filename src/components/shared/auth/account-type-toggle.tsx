"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface AccountTypeToggleProps {
  activeTab: "couple" | "vendor";
  className?: string;
}

/**
 * Reusable Account Type Segmented Pill Control (Airbnb Design Tokens)
 * Harmonizes registration navigation between Couple and Vendor accounts.
 */
export function AccountTypeToggle({ activeTab, className }: AccountTypeToggleProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center p-1 bg-muted/70 rounded-full border border-border/70 max-w-xs mx-auto w-full select-none",
        className
      )}
    >
      <Link
        href="/register"
        className={cn(
          "flex-1 py-1.5 px-3.5 text-xs font-semibold rounded-full text-center transition-all duration-150",
          activeTab === "couple"
            ? "bg-background text-foreground shadow-xs cursor-default"
            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
        )}
        aria-current={activeTab === "couple" ? "page" : undefined}
      >
        Calon Pengantin
      </Link>
      <Link
        href="/vendor-register"
        className={cn(
          "flex-1 py-1.5 px-3.5 text-xs font-semibold rounded-full text-center transition-all duration-150",
          activeTab === "vendor"
            ? "bg-background text-foreground shadow-xs cursor-default"
            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
        )}
        aria-current={activeTab === "vendor" ? "page" : undefined}
      >
        Mitra Vendor
      </Link>
    </div>
  );
}
