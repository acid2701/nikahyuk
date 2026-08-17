"use client";

import * as React from "react";
import { Plus, Trash2, DollarSign, Save } from "lucide-react";
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
import { PaymentMilestoneInput } from "@/types/budget.types";

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
    payment_milestones?: any[];
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
  const [milestones, setMilestones] = React.useState<PaymentMilestoneInput[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setItemName(item.item_name || "");
    setEstimatedCost(String(item.estimated_cost || ""));
    setTargetPayer(item.target_payer || "joint");
    setNotes(item.notes || "");

    if (item.payment_milestones && item.payment_milestones.length > 0) {
      setMilestones(
        item.payment_milestones.map((m) => ({
          milestoneName: m.milestone_name || m.milestoneName || "",
          amount: Number(m.amount) || 0,
          dueDate: m.due_date || m.dueDate || "",
          paymentStatus: m.payment_status || m.paymentStatus || "unpaid",
          paidBy: m.paid_by || m.paidBy || item.target_payer || "joint",
        }))
      );
    } else {
      setMilestones([
        {
          milestoneName: "DP 1 (Booking Fee)",
          amount: 0,
          dueDate: "",
          paymentStatus: "unpaid",
          paidBy: item.target_payer || "joint",
        },
      ]);
    }
  }, [item]);

  function handleAddMilestoneRow() {
    setMilestones([
      ...milestones,
      {
        milestoneName: `Termin ${milestones.length + 1}`,
        amount: 0,
        dueDate: "",
        paymentStatus: "unpaid",
        paidBy: targetPayer,
      },
    ]);
  }

  function handleRemoveMilestoneRow(index: number) {
    setMilestones(milestones.filter((_, i) => i !== index));
  }

  function handleMilestoneChange(
    index: number,
    field: keyof PaymentMilestoneInput,
    value: any
  ) {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  }

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
        milestones,
      });

      toast({
        title: "Pos Anggaran Berhasil Diperbarui",
        description: `Pos '${itemName}' dengan ${milestones.length} termin pembayaran telah diperbarui.`,
        variant: "success",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast({
        title: "Gagal Memperbarui Pos Anggaran",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Edit Pos Anggaran & Termin Pembayaran
            </DialogTitle>
            <DialogDescription>
              Perbarui rincian pos anggaran, target biaya, penanggung jawab, serta skema multi-termin (installments & due dates).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Nama Pos Anggaran</label>
                <Input
                  type="text"
                  placeholder="e.g. Catering 500 Pax / MUA Paes Ageng"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Target Anggaran (IDR)</label>
                <Input
                  type="number"
                  placeholder="e.g. 50000000"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Penanggung Jawab (Side)</label>
                <Select
                  value={targetPayer}
                  onValueChange={(val: any) => setTargetPayer(val)}
                >
                  <SelectTrigger className="h-9">
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
                <label className="text-xs font-medium">Catatan Internal</label>
                <Input
                  type="text"
                  placeholder="e.g. Sudah termasuk bonus 2 stall kambing guling"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="border border-border rounded-lg p-3 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-foreground">
                  Termin & Skema Pembayaran (Milestones)
                </h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddMilestoneRow}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Termin
                </Button>
              </div>

              <div className="space-y-2">
                {milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded bg-card border border-border/60"
                  >
                    <Input
                      type="text"
                      placeholder="Nama Termin"
                      value={m.milestoneName}
                      onChange={(e) =>
                        handleMilestoneChange(idx, "milestoneName", e.target.value)
                      }
                      className="h-8 text-xs flex-1"
                      required
                    />
                    <Input
                      type="number"
                      placeholder="Nominal (IDR)"
                      value={m.amount || ""}
                      onChange={(e) =>
                        handleMilestoneChange(idx, "amount", Number(e.target.value))
                      }
                      className="h-8 text-xs w-32"
                      required
                    />
                    <Input
                      type="date"
                      value={m.dueDate || ""}
                      onChange={(e) =>
                        handleMilestoneChange(idx, "dueDate", e.target.value)
                      }
                      className="h-8 text-xs w-36"
                    />
                    {milestones.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMilestoneRow(idx)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="gap-1.5 font-semibold">
              <Save className="h-4 w-4" />
              {loading ? "Menyimpan..." : "Simpan Perubahan Anggaran"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
