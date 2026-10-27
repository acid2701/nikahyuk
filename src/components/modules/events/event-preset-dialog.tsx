"use client";

import * as React from "react";
import { CalendarCheck, Check } from "lucide-react";
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
import { EVENT_STARTER_PRESETS } from "@/types/presets.types";
import { createEventAction } from "@/actions/event-actions";
import { useToast } from "@/components/ui/use-toast";

export interface EventPresetDialogProps {
  weddingId: string;
}

export function EventPresetDialog({ weddingId }: EventPresetDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedPresets, setSelectedPresets] = React.useState<string[]>([]);
  const [presetDate, setPresetDate] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  function togglePreset(name: string) {
    setSelectedPresets((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  }

  async function handleApplyPresets() {
    if (selectedPresets.length === 0) return;
    setLoading(true);

    try {
      for (const presetName of selectedPresets) {
        const preset = EVENT_STARTER_PRESETS.find((p) => p.name === presetName);
        if (preset) {
          await createEventAction({
            weddingId,
            eventName: preset.name,
            eventDate: presetDate || null,
            eventSide: preset.side,
          });
        }
      }

      toast({
        title: "Sub-Event Berhasil Ditambahkan!",
        description: `Sebanyak ${selectedPresets.length} rangkaian acara telah ditambahkan.`,
        variant: "success",
      });

      setSelectedPresets([]);
      setPresetDate("");
      setOpen(false);
    } catch (err) {
      toast({
        title: "Gagal Menambahkan Preset",
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
          <CalendarCheck className="h-4 w-4 text-primary" />
          Template Sub-Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Template Sub-Event Acara
          </DialogTitle>
          <DialogDescription>
            Pilih rangkaian acara adat & pernikahan (Lamaran, Pengajian, Siraman, Midodareni, dll). Tanggal acara opsional.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Tanggal Acara Serentak (Opsional, Bisa Diatur Nanti)
            </label>
            <Input
              type="date"
              value={presetDate}
              onChange={(e) => setPresetDate(e.target.value)}
              className="h-9 text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Biarkan kosong jika belum menentukan tanggal pasti.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 max-h-72 overflow-y-auto pr-1">
            {EVENT_STARTER_PRESETS.map((preset) => {
              const isSelected = selectedPresets.includes(preset.name);
              return (
                <div
                  key={preset.name}
                  onClick={() => togglePreset(preset.name)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:bg-accent/40"
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-xs">
                    <span>{preset.name}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{preset.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            onClick={handleApplyPresets}
            disabled={loading || selectedPresets.length === 0}
          >
            {loading ? "Menambahkan..." : `Tambah ${selectedPresets.length} Acara Terpilih`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
