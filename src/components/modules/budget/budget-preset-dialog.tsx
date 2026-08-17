"use client";

import * as React from "react";
import { Sparkles, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BUDGET_STARTER_ITEMS } from "@/types/presets.types";
import { createBudgetItemWithMilestonesAction } from "@/actions/budget-actions";
import { useToast } from "@/components/ui/use-toast";

export interface BudgetPresetDialogProps {
  weddingId: string;
  eventId?: string;
}

export function BudgetPresetDialog({
  weddingId,
  eventId,
}: BudgetPresetDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [totalBudgetEst, setTotalBudgetEst] = React.useState<number>(100000000);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  async function handleApplyBudgetSeeder() {
    if (!eventId) {
      toast({
        title: "Perhatian",
        description: "Mohon pilih sub-event terlebih dahulu di topbar header.",
        variant: "warning",
      });
      return;
    }

    if (totalBudgetEst <= 0) {
      toast({
        title: "Perhatian",
        description: "Estimasi total anggaran harus lebih besar dari Rp 0.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);

    try {
      let createdCount = 0;
      for (const starter of BUDGET_STARTER_ITEMS) {
        const itemCost = Math.round((totalBudgetEst * starter.ratioPercentage) / 100);
        const dpCost = Math.round(itemCost * 0.3);
        const pelunasanCost = itemCost - dpCost;

        const now = Date.now();
        const dpDueDate = new Date(now + 7 * 86400000).toISOString().split("T")[0];
        const finalDueDate = new Date(now + 30 * 86400000).toISOString().split("T")[0];

        await createBudgetItemWithMilestonesAction({
          weddingId,
          eventId,
          itemName: starter.itemName,
          estimatedCost: itemCost,
          targetPayer: starter.payer,
          notes: `${starter.notes} (Starter Seeder Preset)`,
          milestones: [
            {
              milestoneName: "DP (Down Payment 30%)",
              amount: dpCost,
              dueDate: dpDueDate,
              paymentStatus: "unpaid",
              paidBy: starter.payer,
            },
            {
              milestoneName: "Pelunasan Final (70%)",
              amount: pelunasanCost,
              dueDate: finalDueDate,
              paymentStatus: "unpaid",
              paidBy: starter.payer,
            },
          ],
        });
        createdCount++;
      }

      toast({
        title: "Seeder Budget Berhasil Diterapkan!",
        description: `Sebanyak ${createdCount} pos anggaran starter (Sewa Gedung, Catering, MUA, Foto/Video, Dekorasi, dll.) telah otomatis dibuat.`,
        variant: "success",
      });

      setOpen(false);
    } catch (err) {
      toast({
        title: "Gagal Menerapkan Seeder Budget",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Seeder Presets Anggaran
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-600" />
            Seeder Template Pos Pembelian Anggaran
          </DialogTitle>
          <DialogDescription className="text-xs">
            Otomatis menggenerasi pos anggaran utama (Gedung, Catering 45%, Dekorasi 15%, MUA 12%, Dokumentasi 10%, dll) beserta 2 termin pembayaran (DP 30% & Pelunasan 70%).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Total Target Anggaran Keseluruhan (Rp)
            </label>
            <Input
              type="number"
              value={totalBudgetEst}
              onChange={(e) => setTotalBudgetEst(Number(e.target.value))}
              placeholder="e.g. 100000000"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Rp {totalBudgetEst.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-accent/20 space-y-1.5 text-xs">
            <span className="font-semibold text-foreground block">
              Item Pembelian yang Akan Di-generate (9 Pos Utama):
            </span>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
              <li>Sewa Gedung / Ballroom Utama (15%)</li>
              <li>Paket Catering Prasmanan & Stall (30%)</li>
              <li>Dekorasi Pelaminan & Photobooth (15%)</li>
              <li>MUA & Make Up Touch Up (6%)</li>
              <li>Sewa Busana Pengantin & Seragam (6%)</li>
              <li>Foto, Video Cinematic & Album (10%)</li>
              <li>MC & Band Music Performance (5%)</li>
              <li>Cetak Undangan, Souvenir & Hantaran (5%)</li>
              <li>Biaya KUA & Operational Emergency (8%)</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleApplyBudgetSeeder} disabled={loading}>
            {loading ? "Generasi Pos..." : "Generate 9 Pos Anggaran"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
