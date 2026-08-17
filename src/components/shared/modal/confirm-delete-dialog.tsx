"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  itemName?: string;
  loading?: boolean;
  onConfirm: () => Promise<void> | void;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = "Konfirmasi Penghapusan",
  description = "Tindakan ini tidak dapat dibatalkan. Berkas fisik di Cloudflare R2 dan data terkait akan dihapus secara permanen.",
  itemName,
  loading = false,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-col items-center text-center sm:text-left sm:flex-row sm:items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="font-serif text-lg font-bold text-foreground">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {description}
            </DialogDescription>
            {itemName && (
              <div className="mt-2 p-2 rounded bg-muted font-semibold text-xs text-destructive border border-destructive/20 truncate">
                Item: {itemName}
              </div>
            )}
          </div>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className="gap-1.5 font-semibold"
          >
            {loading ? "Menghapus..." : "Ya, Hapus Permanen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
