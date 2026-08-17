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
import { deleteEventAction } from "@/actions/event-actions";
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

export interface DeleteEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventName: string;
  weddingId: string;
}

export function DeleteEventModal({
  open,
  onOpenChange,
  eventId,
  eventName,
  weddingId,
}: DeleteEventModalProps) {
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteEventAction(eventId, weddingId);

      toast({
        title: "Sub-Event Berhasil Dihapus",
        description: `Acara '${eventName}' dan seluruh data terkait telah dihapus secara permanen.`,
        variant: "success",
      });

      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Gagal Menghapus Sub-Event",
        description: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-rose-200 dark:border-rose-900/50">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-serif text-lg text-foreground">
                Hapus Sub-Event Permanen
              </DialogTitle>
              <DialogDescription className="text-xs">
                Konfirmasi penghapusan data rangkaian acara pernikahan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <p className="text-sm text-foreground">
            Apakah Anda yakin ingin menghapus sub-event{" "}
            <span className="font-bold text-rose-600 dark:text-rose-400 font-serif">
              &ldquo;{eventName}&rdquo;
            </span>
            ?
          </p>

          <div className="rounded-md bg-rose-50 dark:bg-rose-950/40 p-3 border border-rose-200/80 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300 space-y-1">
            <p className="font-semibold flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Peringatan Dampak Penghapusan (Cascading Operations):
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90 pl-1">
              <li>Seluruh susunan sesi rundown pada acara ini akan dimusnahkan.</li>
              <li>Pos anggaran & termin pembayaran spesifik acara akan terhapus.</li>
              <li>Denah meja & penugasan tempat duduk tamu akan direset.</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="text-xs font-semibold gap-1.5 bg-rose-600 hover:bg-rose-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Hapus Sub-Event
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
