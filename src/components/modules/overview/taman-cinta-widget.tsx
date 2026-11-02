"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, CheckCircle2, ArrowRight, Flower2, Sprout, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TamanCintaWidgetProps {
  weddingId: string;
  groomName: string;
  brideName: string;
  checklistTotal: number;
  checklistCompleted: number;
  budgetEstTotal: number;
  budgetPaidTotal: number;
  daysUntilWedding: number | null;
}

export function TamanCintaWidget({
  weddingId,
  groomName,
  brideName,
  checklistTotal,
  checklistCompleted,
  budgetEstTotal,
  budgetPaidTotal,
  daysUntilWedding,
}: TamanCintaWidgetProps) {
  // Hitung progres komposit (Checklist 50% + Pembayaran Budget 50%)
  const checklistRate = checklistTotal > 0 ? (checklistCompleted / checklistTotal) * 100 : 0;
  const budgetRate = budgetEstTotal > 0 ? Math.min(100, (budgetPaidTotal / budgetEstTotal) * 100) : 0;
  const overallScore = Math.round(checklistRate * 0.5 + budgetRate * 0.5);

  // Penentuan Stage Taman Cinta (MELD Pattern)
  let stageTitle = "Tunas Baru";
  let stageBadge = "Level 1 • Tunas Cinta";
  let stageDesc = "Langkah awal bersama. Mulai kumpulkan inspirasi dan amankan tanggal akad.";
  let StageIcon = Sprout;
  let stageColor = "text-emerald-500 bg-emerald-500/10 border-emerald-200";

  if (overallScore > 80) {
    stageTitle = "Taman Harmoni Sempurna";
    stageBadge = "Level 4 • Sempurna";
    stageDesc = "Taman kebahagiaan Anda telah mekar seutuhnya! Semua persiapan matang dan siap menyambut hari bahagia.";
    StageIcon = Flower2;
    stageColor = "text-rose-500 bg-rose-500/10 border-rose-200";
  } else if (overallScore > 50) {
    stageTitle = "Bunga Asmara Merekah";
    stageBadge = "Level 3 • Bunga Mekar";
    stageDesc = "Bunga-bunga persiapan mulai mekar indah. Sebagian besar vendor dan susunan acara telah terkunci rapat.";
    StageIcon = Flower2;
    stageColor = "text-rose-500 bg-rose-500/10 border-rose-200";
  } else if (overallScore > 20) {
    stageTitle = "Kuncup Harapan";
    stageBadge = "Level 2 • Kuncup Bunga";
    stageDesc = "Kuncup persiapan tumbuh subur. Terus lengkapi rincian anggaran dan konfirmasi vendor pendukung.";
    StageIcon = Leaf;
    stageColor = "text-amber-500 bg-amber-500/10 border-amber-200";
  }

  const milestones = [
    { label: "Tunas", pct: 20 },
    { label: "Kuncup", pct: 50 },
    { label: "Mekar", pct: 80 },
    { label: "Sempurna", pct: 100 },
  ];

  return (
    <Card className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm transition-all hover:shadow-md">
      <div className="p-5 sm:p-7 space-y-6">
        {/* Header Widget */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border", stageColor)}>
              <StageIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans font-bold text-base sm:text-lg text-foreground">
                  Taman Cinta: {stageTitle}
                </span>
                <Badge variant="outline" className="rounded-full text-[10px] font-semibold border-rose-200 text-rose-600 bg-rose-500/5">
                  {stageBadge}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kesiapan pernikahan {groomName} & {brideName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-right">
              <span className="font-mono text-2xl font-black text-foreground">
                {overallScore}%
              </span>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                Persiapan Tuntas
              </p>
            </div>
            <div className="h-10 w-10 rounded-full border border-border/80 bg-muted/30 flex items-center justify-center shrink-0">
              <Heart className="h-5 w-5 text-[#ff385c] fill-[#ff385c]/20" />
            </div>
          </div>
        </div>

        {/* Visual Milestone Track (MELD Gamification Track) */}
        <div className="space-y-2">
          <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden p-0.5 border border-border/50">
            <div
              className="h-full bg-gradient-to-r from-rose-400 via-rose-500 to-[#ff385c] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.max(5, overallScore)}%` }}
            />
          </div>

          <div className="grid grid-cols-4 text-center pt-1">
            {milestones.map((m, idx) => {
              const reached = overallScore >= m.pct;
              return (
                <div key={m.label} className="space-y-1">
                  <div className="flex items-center justify-center">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full transition-all",
                        reached ? "bg-rose-500 ring-4 ring-rose-500/20" : "bg-muted-foreground/30"
                      )}
                    />
                  </div>
                  <p
                    className={cn(
                      "text-[10px] font-semibold tracking-tight",
                      reached ? "text-foreground font-bold" : "text-muted-foreground/70"
                    )}
                  >
                    {m.label} ({m.pct}%)
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Descriptive Message & Quick Direct Actions */}
        <div className="rounded-2xl p-4 bg-muted/40 border border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground leading-relaxed flex-1">
            {stageDesc}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 rounded-full text-xs font-semibold meld-bouncy border-border/80 hover:bg-muted"
            >
              <Link href={`/dashboard/${weddingId}/checklists`}>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                Checklist ({checklistCompleted}/{checklistTotal})
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="h-8 rounded-full text-xs font-semibold meld-bouncy bg-[#ff385c] hover:bg-[#e00b41] text-white shadow-xs"
            >
              <Link href={`/dashboard/${weddingId}/budget`}>
                Anggaran Biaya <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
