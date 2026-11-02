"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Heart, Monitor, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeColorSync } from "@/hooks/use-theme-color-sync";

const THEME_OPTIONS = [
  {
    key: "light",
    label: "Terang",
    icon: Sun,
    color: "text-amber-500",
  },
  {
    key: "dark",
    label: "Gelap",
    icon: Moon,
    color: "text-sky-400",
  },
  {
    key: "cute",
    label: "Pastel Rose",
    icon: Heart,
    color: "text-rose-500",
  },
  {
    key: "system",
    label: "Sistem (Otomatis)",
    icon: Monitor,
    color: "text-muted-foreground",
  },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Synchronize mobile top bar / notch theme-color meta tag
  useThemeColorSync();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full border border-border bg-secondary/30"
        aria-label="Pilih Tema Tampilan"
      >
        <Sun className="h-4 w-4 text-muted-foreground" />
      </Button>
    );
  }

  // Active Icon Resolver
  const currentKey = theme || "system";
  const activeOption = THEME_OPTIONS.find((t) => t.key === currentKey);

  let ActiveIcon = Sun;
  let activeIconColor = "text-amber-500";

  if (currentKey === "dark" || (currentKey === "system" && resolvedTheme === "dark")) {
    ActiveIcon = Moon;
    activeIconColor = "text-sky-400";
  } else if (currentKey === "cute") {
    ActiveIcon = Heart;
    activeIconColor = "text-rose-500 fill-rose-500/20";
  } else if (currentKey === "system") {
    ActiveIcon = Monitor;
    activeIconColor = "text-muted-foreground";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 rounded-full border border-border/80 bg-secondary/40 hover:bg-secondary transition-all shadow-xs shrink-0 ${className || ""}`}
          title={`Tema: ${activeOption?.label || "Pilih Tema"}`}
          aria-label="Pilih Tema Tampilan"
        >
          <ActiveIcon className={`h-4 w-4 transition-transform ${activeIconColor}`} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-44 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-md p-1.5 shadow-md space-y-0.5"
      >
        {THEME_OPTIONS.map((item) => {
          const Icon = item.icon;
          const isSelected = currentKey === item.key;

          return (
            <DropdownMenuItem
              key={item.key}
              onClick={() => setTheme(item.key)}
              className={`rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer flex items-center justify-between transition-colors ${
                isSelected
                  ? "bg-accent/60 text-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                <span>{item.label}</span>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
