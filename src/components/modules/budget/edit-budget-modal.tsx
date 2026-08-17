"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateBudgetItemAction } from "@/actions/budget-actions";
import { useToast } from "@/components/ui/use-toast";
import { DollarSign, Save } from "lucide-react";

export interface EditBudgetItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingId: string;
  item: {
    id: string;
    item_name: string;
    estimated_cost: number;
    target_payer: "groom" | "bride" | "joint";
    notes?: string | null;
  };
  onSuccess?: () => void;
}

export function EditBudgetItemModal({
  open,
  onOpenChange,
  weddingId,
  item,
  onSuccess,
}: EditBudgetItemModalProps) {
  const [itemName, setItemName] = React.useState(item.item_name || "");
  const [estimatedCost, setEstimatedCost] = React.useState(String(item.estimated_cost || ""));
  const [targetPayer, setTargetPayer] = React.useState<"groom" | "bride" | "joint">(
    item.target_payer || "joint"
  );
  const [notes, setNotes] = React.useState(item.notes || "");
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setItemName(item.item_name || "");
    setEstimatedCost(String(item.estimated_cost || ""));
    setTargetPayer(item.target_payer || "joint");
    setNotes(item.notes || "");
  }, [item]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!itemName.trim() || !estimatedCost) {
      toast({
        title: "Perhatian",
        description: "Nama pos anggaran dan estimasi biaya wajib diisi.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      await updateBudgetItemAction(item.id, weddingId, {
        itemName: itemName.trim(),
        estimatedCost: Number(estimatedCost),
        targetPayer,
        notes: notes.trim() || null,
      });

      toast({
        title: "Pos Anggaran Diperbarui",
        description: `Perubahan pos '${itemName}' telah disimpan.`,
        variant: "success",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast({
        title: "Gagal Memperbarui Pos Anggaran",
        description: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" /> Edit Pos Anggaran
            </DialogTitle>
            <DialogDescription className="text-xs">
              Perbarui nama, target biaya, penanggung jawab (side), atau catatan pos anggaran.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Nama Pos Anggaran</label>
              <Input
                type="text"
                placeholder="e.g. Catering Prasmanan"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Target Anggaran (IDR)</label>
              <Input
                type="number"
                placeholder="e.g. 50000000"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Penanggung Jawab (Side)</label>
              <Select
                value={targetPayer}
                onValueChange={(val: any) => setTargetPayer(val)}
                disabled={loading}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Pilih Pihak" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="joint">Bersama (Joint Budget)</SelectItem>
                  <SelectItem value="groom">Pihak Pria (Groom)</SelectItem>
                  <SelectItem value="bride">Pihak Wanita (Bride)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Catatan Internal</label>
              <Input
                type="text"
                placeholder="e.g. Sudah termasuk bonus stall"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-xs"
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="text-xs font-semibold gap-1.5">
              <Save className="h-3.5 w-3.5" />
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
