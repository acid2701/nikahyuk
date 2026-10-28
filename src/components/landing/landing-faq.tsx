"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

export interface LandingFaqProps {
  appName: string;
}

export function LandingFaq({ appName }: LandingFaqProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const faqs = [
    {
      q: `Apakah ${appName} dapat digunakan secara gratis?`,
      a: `Ya! ${appName} dapat digunakan secara gratis untuk membuat jadwal acara pernikahan, mengelola sub-event (Akad/Resepsi), rundown, anggaran, dan daftar tamu.`,
    },
    {
      q: "Bagaimana cara panitia atau kru lapangan mengakses jadwal tanpa login?",
      a: "Melalui fitur Tautan Berbagi (Shareable Link), pasangan pengantin atau WO dapat membuat tautan khusus yang bisa langsung dibuka di browser HP kru tanpa perlu login akun, serta dapat diamankan dengan PIN 4–6 digit.",
    },
    {
      q: "Apakah fitur buku tamu & check-in tetap berjalan jika sinyal gedung hilang?",
      a: "Bisa. Sistem dilengkapi penyimpanan offline di memori browser perangkat. Saat sinyal terputus, pencatatan tamu tetap berjalan lancar dan otomatis tersinkronisasi ke pusat saat internet kembali terhubung.",
    },
    {
      q: "Apakah data rencana pernikahan kami aman dan bisa diunduh?",
      a: "Sangat aman. Anda memiliki kendali penuh atas data dan dapat mengunduh salinan berkas lengkap (.zip) berisi arsip CSV dan dokumen pendukung kapan saja melalui menu Ekspor Data.",
    },
  ];

  return (
    <section id="faq" className="py-16 md:py-24 border-t border-border/50 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-border bg-card overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-foreground hover:bg-muted/30 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
