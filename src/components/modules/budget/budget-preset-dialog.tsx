"use client";

import * as React from "react";
import { Wallet, Heart, Gift, Coins } from "lucide-react";
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
import {
  BUDGET_STARTER_ITEMS,
  LAMARAN_BUDGET_STARTER_ITEMS,
} from "@/types/presets.types";
import { createBudgetItemWithMilestonesAction } from "@/actions/budget-actions";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface BudgetPresetDialogProps {
  weddingId: string;
  eventId?: string;
}

export function BudgetPresetDialog({
  weddingId,
  eventId,
}: BudgetPresetDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [presetType, setPresetType] = React.useState<"wedding" | "lamaran">("wedding");
  const [totalBudgetEst, setTotalBudgetEst] = React.useState<number>(100000000);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (presetType === "lamaran") {
      setTotalBudgetEst(15000000);
    } else {
      setTotalBudgetEst(100000000);
    }
  }, [presetType]);

  async function handleApplyBudgetSeeder() {
    if (!eventId) {
      toast({
        title: "Perhatian",
        description: "Mohon pilih sub-event terlebih dahulu di bar navigasi atas.",
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
    const starterItems =
      presetType === "lamaran"
        ? LAMARAN_BUDGET_STARTER_ITEMS
        : BUDGET_STARTER_ITEMS;

    try {
      let createdCount = 0;
      for (const starter of starterItems) {
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
          notes: `${starter.notes} (${presetType === "lamaran" ? "Preset Lamaran" : "Preset Nikahan"})`,
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
        description: `Sebanyak ${createdCount} pos anggaran starter ${
          presetType === "lamaran" ? "Lamaran" : "Pernikahan"
        } telah otomatis dibuat.`,
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
          <Coins className="h-4 w-4 text-primary" />
          Template Alokasi Anggaran
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-600" />
            Template Seeder Pos Anggaran
          </DialogTitle>
          <DialogDescription className="text-xs">
            Pilih jenis template preset sesuai acara yang sedang dikelola (Lamaran vs Akad/Resepsi).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Tabs
            value={presetType}
            onValueChange={(val) => setPresetType(val as "wedding" | "lamaran")}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="lamaran" className="text-xs gap-1.5 font-medium">
                💍 Preset Lamaran
              </TabsTrigger>
              <TabsTrigger value="wedding" className="text-xs gap-1.5 font-medium">
                💒 Preset Akad & Resepsi
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Total Target Anggaran ({presetType === "lamaran" ? "Acara Lamaran" : "Pernikahan Utama"})
            </label>
            <Input
              type="number"
              value={totalBudgetEst}
              onChange={(e) => setTotalBudgetEst(Number(e.target.value))}
              placeholder="e.g. 15000000"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Estimasi: Rp {totalBudgetEst.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-accent/20 space-y-1.5 text-xs">
            <span className="font-semibold text-foreground block">
              Pos Pembelian yang Akan Di-generate (
              {presetType === "lamaran" ? "6 Pos Lamaran" : "9 Pos Nikahan"}):
            </span>
            {presetType === "lamaran" ? (
              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
                <li>Catering & Konsumsi Keluarga (35%)</li>
                <li>Cincin Tunangan / Pengikat (25%)</li>
                <li>Dekorasi Backdrop & Welcome Board (15%)</li>
                <li>Kotak Seserahan & Hantaran (10%)</li>
                <li>Busana Sarimbit & MUA Tunangan (10%)</li>
                <li>Fotografer Liputan Acara (5%)</li>
              </ul>
            ) : (
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
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleApplyBudgetSeeder} disabled={loading}>
            {loading
              ? "Generasi Pos..."
              : `Generate Preset ${presetType === "lamaran" ? "Lamaran" : "Nikahan"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
