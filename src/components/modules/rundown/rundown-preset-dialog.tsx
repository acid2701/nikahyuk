"use client";

import * as React from "react";
import { Sparkles, Check, Clock } from "lucide-react";
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
import { RUNDOWN_PRESETS, RundownPreset } from "@/types/presets.types";
import { useToast } from "@/components/ui/use-toast";
import { createRundownItemAction } from "@/actions/rundown-actions";

export interface RundownPresetDialogProps {
  weddingId: string;
  eventId: string;
  onApplyPreset?: (preset: RundownPreset) => Promise<void>;
}

export function RundownPresetDialog({
  weddingId,
  eventId,
  onApplyPreset,
}: RundownPresetDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string>(
    RUNDOWN_PRESETS[0].id
  );
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const activePreset =
    RUNDOWN_PRESETS.find((p) => p.id === selectedId) || RUNDOWN_PRESETS[0];

  async function handleConfirmApply() {
    setLoading(true);
    try {
      if (onApplyPreset) {
        await onApplyPreset(activePreset);
      } else {
        for (const item of activePreset.items) {
          await createRundownItemAction({
            weddingId,
            eventId,
            timeStart: item.time_start,
            timeEnd: item.time_end,
            activityTitle: item.activity_title,
            picName: item.pic_name,
          });
        }
      }

      toast({
        title: "Preset Berhasil Diterapkan",
        description: `Template '${activePreset.name}' berhasil dimasukkan ke rundown.`,
        variant: "success",
      });
      setOpen(false);
    } catch (err) {
      toast({
        title: "Gagal Menerapkan Preset",
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
          Gunakan Preset Rundown
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Template Preset Live Rundown
          </DialogTitle>
          <DialogDescription>
            Pilih template susunan acara siap pakai untuk mempercepat pembuatan rundown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-2 sm:grid-cols-2">
            {RUNDOWN_PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => setSelectedId(preset.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedId === preset.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:bg-accent/40"
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-sm">
                  <span>{preset.name}</span>
                  {selectedId === preset.id && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {preset.description}
                </p>
              </div>
            ))}
          </div>

          <div className="border border-border rounded-lg p-3 bg-muted/30 space-y-2">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Pratinjau {activePreset.items.length} Sesi Skenario:
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground max-h-40 overflow-y-auto pr-1">
              {activePreset.items.map((item) => (
                <li
                  key={item.sort_order}
                  className="flex items-center justify-between py-1 border-b border-border/40 last:border-0"
                >
                  <span className="font-medium text-foreground">
                    {item.sort_order}. {item.activity_title}
                  </span>
                  <span className="text-[11px] text-primary font-mono">
                    {item.time_start} - {item.time_end}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleConfirmApply} disabled={loading}>
            {loading ? "Menerapkan..." : "Terapkan Template Ini"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
