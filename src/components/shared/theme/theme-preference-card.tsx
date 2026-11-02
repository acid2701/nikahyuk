"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon, Heart, Monitor, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES = [
  {
    key: "light",
    title: "Terang (Clean White)",
    description: "Tampilan bersih bernuansa putih terang dengan kontras tajam.",
    icon: Sun,
    previewBg: "bg-white border-zinc-200",
    previewAccent: "bg-[#ff385c]",
  },
  {
    key: "dark",
    title: "Gelap (Dark Slate)",
    description: "Latar belakang slate gelap yang nyaman untuk mata di malam hari.",
    icon: Moon,
    previewBg: "bg-slate-900 border-slate-700",
    previewAccent: "bg-[#ff385c]",
  },
  {
    key: "cute",
    title: "Pastel Rose (Cute Blush)",
    description: "Latar belakang Rose Milk lembut (#FFF5F5) dengan aksen romantis.",
    icon: Heart,
    previewBg: "bg-[#FFF5F5] border-rose-200",
    previewAccent: "bg-[#F43F5E]",
  },
  {
    key: "system",
    title: "Sistem Otomatis",
    description: "Menyesuaikan otomatis dengan preferensi tema perangkat Anda.",
    icon: Monitor,
    previewBg: "bg-gradient-to-r from-white to-slate-900 border-zinc-300",
    previewAccent: "bg-[#ff385c]",
  },
] as const;

export function ThemePreferenceCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme || "system";

  return (
    <Card className="rounded-2xl border border-border/80 bg-card shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-foreground">
          Preferensi Tema Tampilan
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Pilih tema visual aplikasi yang paling nyaman untuk Anda dan pasangan. Pilihan ini tersimpan di browser dan berlaku di seluruh halaman.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {THEMES.map((item) => {
            const isSelected = currentTheme === item.key;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTheme(item.key)}
                className={cn(
                  "flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer relative",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                    : "border-border/70 hover:border-border hover:bg-muted/40"
                )}
              >
                <div
                  className={cn(
                    "h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 shadow-xs",
                    item.previewBg
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      item.key === "cute"
                        ? "text-rose-500 fill-rose-500/20"
                        : item.key === "dark"
                        ? "text-sky-400"
                        : item.key === "light"
                        ? "text-amber-500"
                        : "text-muted-foreground"
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0 pr-6 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {isSelected && (
                  <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
