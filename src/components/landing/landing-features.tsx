"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, Users, DollarSign, Briefcase, Share2, ShieldCheck, Layers } from "lucide-react";

export function LandingFeatures() {
  const features = [
    {
      icon: Clock,
      color: "text-primary bg-primary/10",
      title: "Live Rundown & Aba-Aba Acara",
      description:
        "Susun jadwal acara dengan penyesuaian jam otomatis saat agenda mundur. Siap cetak dokumen panduan PDF resmi untuk pegangan kru lapangan.",
    },
    {
      icon: Users,
      color: "text-amber-600 bg-amber-500/10",
      title: "Daftar Tamu & Sebar Undangan WA",
      description:
        "Kelola daftar tamu dengan alokasi pax, impor data kontak dari Excel/CSV, pantau konfirmasi kehadiran (RSVP), dan kirim pesan WhatsApp sekali klik.",
    },
    {
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-500/10",
      title: "Rencana Anggaran & Catatan DP",
      description:
        "Catat perkiraan biaya per kategori, pantau sisa tagihan dari uang muka (DP) hingga pelunasan, serta simpan foto bukti kuitansi pembayaran.",
    },
    {
      icon: Briefcase,
      color: "text-blue-600 bg-blue-500/10",
      title: "Direktori & Arsip Kontrak Vendor",
      description:
        "Pusatkan daftar vendor pernikahan yang bekerjasama lengkap dengan nomor WhatsApp terhubung dan lampiran berkas kesepakatan kerjasama.",
    },
    {
      icon: Share2,
      color: "text-sky-600 bg-sky-500/10",
      title: "Akses Kru & Buku Tamu Tanpa Login",
      description:
        "Cukup bagikan tautan khusus yang dilindungi PIN untuk tim meja registrasi, penerima tamu, dan koordinator acara langsung dari layar ponsel.",
    },
    {
      icon: ShieldCheck,
      color: "text-emerald-600 bg-emerald-500/10",
      title: "Tetap Aktif Saat Sinyal Drop",
      description:
        "Pencatatan kehadiran tamu di lokasi resepsi tetap berjalan lancar meski sinyal hilang, lalu otomatis tersinkronisasi saat koneksi pulih.",
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 border-t border-border/50 bg-accent/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
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
                  <h3 className="font-sans font-bold text-base text-foreground">{f.title}</h3>
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
