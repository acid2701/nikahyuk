"use client";

import * as React from "react";
import { DueDateBadge } from "@/components/shared/badges/due-date-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaUploaderDropzone, UploadedFileMeta } from "@/components/shared/media-uploader/dropzone";
import { payMilestoneAction } from "@/actions/budget-actions";
import { useToast } from "@/components/ui/use-toast";
import { Check, Upload, Calendar } from "lucide-react";

export interface MilestoneItem {
  id: string;
  milestone_name: string;
  amount: number;
  due_date?: string | null;
  paid_date?: string | null;
  payment_status: "unpaid" | "paid";
  paid_by: "groom" | "bride" | "joint";
}

export interface MilestoneTimelineProps {
  weddingId: string;
  milestones: MilestoneItem[];
}

export function MilestoneTimeline({ weddingId, milestones }: MilestoneTimelineProps) {
  const [activeUploadId, setActiveUploadId] = React.useState<string | null>(null);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const { toast } = useToast();

  async function handleToggleStatus(m: MilestoneItem) {
    const nextStatus = m.payment_status === "paid" ? "unpaid" : "paid";
    setLoadingId(m.id);
    try {
      await payMilestoneAction(m.id, weddingId, nextStatus);
      toast({
        title: "Status Pembayaran Diperbarui",
        description: `Termin '${m.milestone_name}' diubah menjadi ${nextStatus === "paid" ? "LUNAS" : "BELUM LUNAS"}.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Mengubah Status",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  }

  async function handleUploadReceiptSuccess(mId: string, meta: UploadedFileMeta) {
    try {
      await payMilestoneAction(mId, weddingId, "paid", {
        r2FileKey: meta.r2_file_key,
        fileName: meta.file_name,
        fileSizeBytes: meta.file_size_bytes,
        mimeType: meta.mime_type,
      });
      toast({
        title: "Bukti Transfer Diunggah",
        description: "File bukti transfer disimpan & termin ditandai LUNAS.",
        variant: "success",
      });
      setActiveUploadId(null);
    } catch (err) {
      toast({
        title: "Gagal Menyimpan Bukti Transfer",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-3 py-2">
      {milestones.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Belum ada termin pembayaran yang ditambahkan.</p>
      ) : (
        milestones.map((m) => (
          <div
            key={m.id}
            className="p-3 rounded-lg border border-border/70 bg-card/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-foreground">
                  {m.milestone_name}
                </span>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {m.paid_by === "groom" ? "Pria" : m.paid_by === "bride" ? "Wanita" : "Bersama"}
                </Badge>
                <DueDateBadge
                  paymentStatus={m.payment_status}
                  dueDateString={m.due_date}
                />
              </div>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <span className="font-mono font-semibold text-foreground">
                  Rp {Number(m.amount).toLocaleString("id-ID")}
                </span>
                {m.due_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Jatuh Tempo: {m.due_date}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={m.payment_status === "paid" ? "secondary" : "default"}
                onClick={() => handleToggleStatus(m)}
                disabled={loadingId === m.id}
                className="h-8 text-xs gap-1"
              >
                <Check className="h-3.5 w-3.5" />
                {m.payment_status === "paid" ? "Tandai Belum Lunas" : "Tandai Lunas"}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setActiveUploadId(activeUploadId === m.id ? null : m.id)
                }
                className="h-8 text-xs gap-1"
              >
                <Upload className="h-3.5 w-3.5" />
                Bukti Transfer
              </Button>
            </div>

            {activeUploadId === m.id && (
              <div className="w-full mt-2 pt-2 border-t border-border">
                <p className="text-xs font-semibold mb-2">Unggah Bukti Transfer / Resi:</p>
                <MediaUploaderDropzone
                  weddingId={weddingId}
                  folder="invoices"
                  onUploadSuccess={(meta) => handleUploadReceiptSuccess(m.id, meta)}
                />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
