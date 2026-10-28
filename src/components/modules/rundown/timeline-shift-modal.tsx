"use client";

import * as React from "react";
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
import { shiftRundownTimelineAction } from "@/actions/rundown-actions";
import { useToast } from "@/components/ui/use-toast";
import { FastForward, Clock } from "lucide-react";

export interface TimelineShiftModalProps {
  eventId: string;
  weddingId: string;
  targetRundownId: string;
  targetActivityTitle: string;
}

export function TimelineShiftModal({
  eventId,
  weddingId,
  targetRundownId,
  targetActivityTitle,
}: TimelineShiftModalProps) {
  const [open, setOpen] = React.useState(false);
  const [customDelta, setCustomDelta] = React.useState("15");
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  async function handleShift(deltaMinutes: number) {
    setLoading(true);

    try {
      const res = await shiftRundownTimelineAction(
        eventId,
        weddingId,
        targetRundownId,
        deltaMinutes
      );

      toast({
        title: "Timeline Berhasil Digeser",
        description: `Sebanyak ${res.shiftedCount} agenda telah digeser sebesar ${deltaMinutes > 0 ? `+${deltaMinutes}` : deltaMinutes} menit.`,
        variant: "success",
      });

      setOpen(false);
    } catch (err) {
      toast({
        title: "Gagal Menggeser Timeline",
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
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
          <FastForward className="h-3.5 w-3.5 text-primary" />
          Shift Timeline
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans text-xl flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            1-Click Shift Timeline Engine
          </DialogTitle>
          <DialogDescription>
            Geser agenda &apos;{targetActivityTitle}&apos; dan seluruh agenda setelahnya secara otomatis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Preset Geser Waktu Cepat:</label>
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShift(10)}
                disabled={loading}
                className="text-xs"
              >
                +10 Menit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShift(15)}
                disabled={loading}
                className="text-xs border-primary/40 text-primary font-bold"
              >
                +15 Menit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShift(30)}
                disabled={loading}
                className="text-xs"
              >
                +30 Menit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShift(-10)}
                disabled={loading}
                className="text-xs"
              >
                -10 Menit
              </Button>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-border">
            <label className="text-xs font-medium">Atau Masukkan Menit Kustom (bisa negatif):</label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={customDelta}
                onChange={(e) => setCustomDelta(e.target.value)}
                className="h-9 text-xs font-mono"
              />
              <Button
                size="sm"
                onClick={() => handleShift(Number(customDelta) || 0)}
                disabled={loading}
                className="h-9 text-xs"
              >
                Terapkan
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
