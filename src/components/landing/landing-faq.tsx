"use client";

import * as React from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface LandingFaqProps {
  appName: string;
}

export function LandingFaq({ appName }: LandingFaqProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const faqs = [
    {
      q: `Apakah ${appName} beneran 100% gratis dipakai pengantin?`,
      a: `Iya, 100% gratis! Kamu dan pasangan bisa langsung bikin workspace acara, atur rangkaian akad & resepsi, susun rundown live, kurasi moodboard warna tema, dan catat tamu tanpa dipungut biaya langganan.`,
    },
    {
      q: "Gimana kalau pas hari-H sinyal di ballroom atau gedung mendadak hilang?",
      a: "Aman banget. Modul check-in buku tamu di meja registrasi dilengkapi teknologi offline-ready di browser. Panitia tetap bisa scan barcode dan centang kehadiran tamu tanpa sinyal, lalu otomatis sinkron begitu internet nyala lagi.",
    },
    {
      q: "Apakah panitia keluarga, MC, atau vendor harus download aplikasi?",
      a: "Nggak perlu sama sekali! Kamu cukup bagikan tautan khusus yang diproteksi PIN 4–6 digit. Panitia dan MC bisa langsung buka rundown dan daftar tamu lewat browser HP apa saja tanpa perlu bikin akun.",
    },
    {
      q: "Bisa kolaborasi bareng Wedding Organizer (WO) atau pasangan?",
      a: "Bisa banget! Kamu bisa undang pasanganmu sebagai Co-Owner atau undang tim WO dengan hak akses teratur, jadi kalian bisa nyicil persiapan bareng tanpa saling tumpuk file spreadsheet yang beda versi.",
    },
    {
      q: "Apakah data rencana pernikahan kami aman dan bisa diekspor?",
      a: "Sangat aman dan terisolasi. Seluruh arsip berkas, kontak tamu, dan rincian anggaran pernikahanmu bisa diunduh kapan saja dalam format arsip lengkap (.zip / Excel).",
    },
  ];

  return (
    <section id="faq" className="py-16 md:py-24 border-t border-border/60 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-normal">
            Informasi seputar persiapan acara dan penggunaan {appName}.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-foreground hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <span className="pr-4">{faq.q}</span>
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/60 pt-3.5 font-normal">
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
