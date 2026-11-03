"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { updateChecklistItemAction } from "@/actions/checklist-actions";
import { ChecklistItem } from "./prewedding-checklist-manager";
import { Pencil, Save, Calendar, User, Tag, Link2, DollarSign } from "lucide-react";

export interface EditChecklistModalProps {
  item: ChecklistItem | null;
  weddingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (updatedItem: ChecklistItem) => void;
}

export function EditChecklistModal({
  item,
  weddingId,
  open,
  onOpenChange,
  onUpdated,
}: EditChecklistModalProps) {
  const [itemName, setItemName] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [assigneeName, setAssigneeName] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [price, setPrice] = React.useState<string>("");
  const [actualPrice, setActualPrice] = React.useState<string>("");
  const [purchaseUrl, setPurchaseUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (item) {
      setItemName(item.item_name || "");
      setNotes(item.notes || "");
      setAssigneeName(item.assignee_name || "");
      setDueDate(item.due_date ? String(item.due_date).split("T")[0] : "");
      setPrice(item.price !== undefined && item.price !== null ? String(item.price) : "");
      setActualPrice(item.actual_price !== undefined && item.actual_price !== null ? String(item.actual_price) : "");
      setPurchaseUrl(item.purchase_url || "");
    }
  }, [item]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;

    if (!itemName.trim()) {
      toast({
        title: "Perhatian",
        description: "Nama tugas tidak boleh kosong.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await updateChecklistItemAction({
        id: item.id,
        weddingId,
        itemName: itemName.trim(),
        category: item.category,
        notes: notes.trim() || null,
        assigneeName: assigneeName.trim() || null,
        dueDate: dueDate || null,
        price: price ? Number(price) : null,
        actualPrice: actualPrice ? Number(actualPrice) : null,
        purchaseUrl: purchaseUrl.trim() || null,
      });

      if (res.success && res.data) {
        toast({
          title: "Tugas Berhasil Diperbarui",
          description: `Perubahan pada '${itemName}' telah disimpan.`,
          variant: "success",
        });
        onUpdated(res.data as ChecklistItem);
        onOpenChange(false);
      } else {
        throw new Error(res.error || "Gagal memperbarui item");
      }
    } catch (err) {
      toast({
        title: "Gagal Menyimpan",
        description: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!item) return null;

  const isSeserahan = item.category === "seserahan";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5 sm:p-6 rounded-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="text-left pb-2 border-b border-border/60">
          <DialogTitle className="font-sans text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Pencil className="h-4 w-4 text-primary" />
            Edit Tugas Checklist
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Nama Tugas / Barang
            </label>
            <Input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Fotokopi KTP & KK Calon Pengantin"
              className="h-10 text-xs rounded-xl"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Catatan Instruksi / Panduan Khusus
            </label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Siapkan 3 rangkap, legalisir kelurahan"
              className="h-10 text-xs rounded-xl"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <User className="h-3 w-3 text-muted-foreground" /> PIC / Penanggung Jawab
              </label>
              <Input
                type="text"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                placeholder="e.g. Mas Raden / Mbak Siti"
                className="h-10 text-xs rounded-xl"
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" /> Target Selesai
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10 text-xs rounded-xl"
                disabled={loading}
              />
            </div>
          </div>

          {/* Kolom Tambahan Khusus Kotak Seserahan */}
          {isSeserahan && (
            <div className="space-y-3 pt-1 border-t border-border/50">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" /> Estimasi (Rp)
                  </label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 500000"
                    className="h-10 text-xs rounded-xl"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-emerald-600" /> Realisasi Beli (Rp)
                  </label>
                  <Input
                    type="number"
                    value={actualPrice}
                    onChange={(e) => setActualPrice(e.target.value)}
                    placeholder="e.g. 475000"
                    className="h-10 text-xs rounded-xl border-emerald-500/40 focus-visible:ring-emerald-500 font-semibold text-emerald-700 dark:text-emerald-400"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Link2 className="h-3 w-3 text-sky-600" /> Link Belanja Online
                </label>
                <Input
                  type="url"
                  value={purchaseUrl}
                  onChange={(e) => setPurchaseUrl(e.target.value)}
                  placeholder="https://shopee.co.id/..."
                  className="h-10 text-xs rounded-xl"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="h-9 rounded-full text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="h-9 px-5 rounded-full bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-semibold shadow-xs meld-bouncy gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
