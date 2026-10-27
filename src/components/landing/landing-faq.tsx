"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

export function LandingFaq() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const faqs = [
    {
      q: "Apakah NikahYuk dapat digunakan secara gratis?",
      a: "Ya! NikahYuk dapat digunakan secara gratis untuk membuat workspace pernikahan, mengelola sub-event (Akad/Resepsi), rundown acara, anggaran, dan master tamu.",
    },
    {
      q: "Bagaimana cara panitia/kru lapangan mengakses portal tanpa login?",
      a: "Melalui fitur Shareable Token, pengantin/WO dapat membuat link publik yang dapat dibuka langsung di HP kru (PWA) tanpa perlu registrasi akun. Akses dapat dilindungi dengan PIN 4-6 digit.",
    },
    {
      q: "Apakah fitur check-in tamu tetap bisa berjalan jika sinyal HP hilang?",
      a: "Bisa! NikahYuk dilengkapi engine Offline Dexie IndexedDB. Saat sinyal HP hilang (offline), check-in tetap tersimpan di memori HP dan otomatis terunggah ke server saat internet pulih.",
    },
    {
      q: "Apakah data pengantin aman dan dapat diunduh (backup)?",
      a: "Sangat aman. Pengantin memiliki hak penuh atas data mereka dan dapat mengunduh arsip backup lengkap (.zip) berisi seluruh file CSV dan dokumen kapan saja dari modul Data Export.",
    },
  ];

  return (
    <section id="faq" className="py-16 md:py-24 border-t border-border/50 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
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
