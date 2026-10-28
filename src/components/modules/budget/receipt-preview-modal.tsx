"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Download, Image as ImageIcon } from "lucide-react";

export interface PaymentAttachmentItem {
  id: string;
  r2_file_key: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
}

export interface ReceiptPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestoneName: string;
  attachments: PaymentAttachmentItem[];
}

export function ReceiptPreviewModal({
  open,
  onOpenChange,
  milestoneName,
  attachments,
}: ReceiptPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-sans text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Bukti Transfer — {milestoneName}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Daftar berkas resi & bukti pembayaran terlampir di Cloudflare R2 storage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {attachments.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-4">
              Belum ada berkas bukti transfer yang diunggah untuk termin ini.
            </p>
          ) : (
            attachments.map((att) => {
              const isImage = att.mime_type?.startsWith("image/");
              const presignedUrl = `/api/storage/presign?key=${encodeURIComponent(att.r2_file_key)}`;

              return (
                <div
                  key={att.id}
                  className="p-3 rounded-lg border border-border bg-card/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 truncate max-w-[280px]">
                      {isImage ? (
                        <ImageIcon className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                      )}
                      <div className="truncate">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {att.file_name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {(att.file_size_bytes / 1024).toFixed(1)} KB • {att.mime_type}
                        </p>
                      </div>
                    </div>

                    <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1">
                      <a href={presignedUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Buka Berkas</span>
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
