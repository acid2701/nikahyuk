"use client";

import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme/theme-toggle";
import { useAppBranding } from "@/hooks/use-app-branding";
import { cn } from "@/lib/utils";

export interface AuthCardShellProps {
  children: React.ReactNode;
  maxWidth?: "md" | "lg" | "xl";
  className?: string;
}

/**
 * Reusable Auth Layout Shell providing unified branding, ThemeToggle, and centering.
 */
export function AuthCardShell({
  children,
  maxWidth = "md",
  className,
}: AuthCardShellProps) {
  const { branding } = useAppBranding();
  const { appName, tagline, logoUrl } = branding;

  const maxWidthClasses = {
    md: "max-w-md",
    lg: "max-w-xl",
    xl: "max-w-2xl",
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4 py-10 sm:px-6 lg:px-8 relative selection:bg-primary/20">
      {/* Top-Right Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className={cn("w-full space-y-6", maxWidthClasses[maxWidth], className)}>
        {/* Unified Top Branding */}
        <div className="text-center space-y-2 select-none">
          {logoUrl ? (
            <Link href="/" className="inline-flex justify-center mb-1 group">
              <img
                src={logoUrl}
                alt={appName}
                className="h-11 w-auto max-w-[170px] object-contain rounded-lg transition-transform group-hover:scale-105"
              />
            </Link>
          ) : null}
          <h1 className="font-sans text-3xl font-extrabold tracking-tight text-primary">
            {appName}
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            {tagline}
          </p>
        </div>

        {/* Auth Content */}
        {children}
      </div>
    </div>
  );
}
