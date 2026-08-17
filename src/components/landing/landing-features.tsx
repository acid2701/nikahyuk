"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, DollarSign, Briefcase, Share2, ShieldCheck, Heart, Sparkles } from "lucide-react";

export function LandingFeatures() {
  const features = [
    {
      icon: Clock,
      color: "text-primary bg-primary/10",
      title: "Live Rundown & Cue Badges",
      description:
        "Atur agenda susunan acara dengan 1-klik Shift Timeline math, cetak PDF resmi WO via hidden iframe, dan petunjuk audio/lighting cue badges.",
    },
    {
      icon: Users,
      color: "text-amber-600 bg-amber-500/10",
      title: "Master Tamu & WA Blast",
      description:
        "Master guest pool dengan alokasi pax, CSV bulk parser 500+ tamu, status RSVP, dan generator link WhatsApp 1-klik dengan template dinamis.",
    },
    {
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-500/10",
      title: "Financial Core & Payment Milestones",
      description:
        "Kelola estimasi anggaran, catat pembayaran bertahap (DP, Pelunasan), kalkulasi HOS (Head of Expenditure), dan lampirkan kuitansi bukti transfer.",
    },
    {
      icon: Briefcase,
      color: "text-blue-600 bg-blue-500/10",
      title: "Vendor Directory & Contract Manager",
      description:
        "Direktori vendor pernikahan dikategorikan per bidang jasa, upload kontrak fisik via presigned R2, dan sanitizer WhatsApp nomor HP otomatis.",
    },
    {
      icon: Share2,
      color: "text-purple-600 bg-purple-500/10",
      title: "Shareable Token & Field Crew PWA",
      description:
        "Bagikan link PWA publik dengan PIN pengaman 4-6 digit untuk kru lapangan, meja registrasi check-in, dan door greeter tanpa perlu login akun.",
    },
    {
      icon: ShieldCheck,
      color: "text-indigo-600 bg-indigo-500/10",
      title: "Resiliensi Offline & Realtime Sync",
      description:
        "Dukungan penyimpanan browser Dexie IndexedDB untuk lokasi acara dengan sinyal terbatas, serta sinkronisasi otomatis WebSocket CDC saat online.",
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 border-t border-border/50 bg-accent/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Modul & Fitur Unggulan
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Semua yang Anda Butuhkan untuk Acara Sempurna
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Dirancang khusus untuk memenuhi standar operasional Wedding Organizer (WO) profesional & pasangan pengantin di Indonesia.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <Card key={idx} className="border-border/70 hover:border-primary/50 transition-all bg-card shadow-xs">
                <CardContent className="p-6 space-y-3">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${f.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
