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
import { updateRundownItemAction } from "@/actions/rundown-actions";
import { useToast } from "@/components/ui/use-toast";
import { CueTypeEnum } from "@/types/database.types";
import { RundownItem } from "@/components/modules/rundown/rundown-manager";
import { Clock, Volume2, Save, Plus, Trash2 } from "lucide-react";

export interface CueEditInput {
  cueType: CueTypeEnum;
  instruction: string;
}

export interface EditRundownItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingId: string;
  item: RundownItem;
  onSuccess?: () => void;
}

export function EditRundownItemModal({
  open,
  onOpenChange,
  weddingId,
  item,
  onSuccess,
}: EditRundownItemModalProps) {
  const [activityTitle, setActivityTitle] = React.useState(item.activity_title || "");
  const [timeStart, setTimeStart] = React.useState(item.time_start || "08:00");
  const [timeEnd, setTimeEnd] = React.useState(item.time_end || "08:30");
  const [picName, setPicName] = React.useState(item.pic_name || "");
  const [location, setLocation] = React.useState(item.location || "");
  const [contingencyPlan, setContingencyPlan] = React.useState(item.contingency_plan || "");
  const [cues, setCues] = React.useState<CueEditInput[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setActivityTitle(item.activity_title || "");
    setTimeStart(item.time_start || "08:00");
    setTimeEnd(item.time_end || "08:30");
    setPicName(item.pic_name || "");
    setLocation(item.location || "");
    setContingencyPlan(item.contingency_plan || "");

    if (item.rundown_cues && item.rundown_cues.length > 0) {
      setCues(
        item.rundown_cues.map((c) => ({
          cueType: c.cue_type as CueTypeEnum,
          instruction: c.instruction || "",
        }))
      );
    } else {
      setCues([]);
    }
  }, [item]);

  function handleAddCueRow() {
    setCues([...cues, { cueType: "sound", instruction: "" }]);
  }

  function handleRemoveCueRow(index: number) {
    setCues(cues.filter((_, i) => i !== index));
  }

  function handleCueChange(index: number, field: keyof CueEditInput, value: any) {
    const updated = [...cues];
    updated[index] = { ...updated[index], [field]: value };
    setCues(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activityTitle.trim()) {
      toast({
        title: "Perhatian",
        description: "Judul agenda rundown wajib diisi.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);

    try {
      const validCues = cues.filter((c) => c.instruction.trim() !== "");
      await updateRundownItemAction(item.id, weddingId, {
        timeStart,
        timeEnd,
        activityTitle: activityTitle.trim(),
        picName: picName.trim() || null,
        location: location.trim() || null,
        contingencyPlan: contingencyPlan.trim() || null,
        cues: validCues,
      });

      toast({
        title: "Agenda Diperbarui",
        description: `Perubahan agenda '${activityTitle}' telah disimpan.`,
        variant: "success",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast({
        title: "Gagal Memperbarui Agenda",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-sans text-xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Edit Agenda Rundown
            </DialogTitle>
            <DialogDescription className="text-xs">
              Perbarui judul susunan acara, jam pelaksanaan, PIC, lokasi, & instruksi cue panggung.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Judul Agenda / Acara</label>
              <Input
                type="text"
                placeholder="e.g. Pembukaan & Pembacaan Ayat Suci Al-Qur'an"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Jam Mulai</label>
                <Input
                  type="time"
                  value={timeStart}
                  onChange={(e) => setTimeStart(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Jam Selesai</label>
                <Input
                  type="time"
                  value={timeEnd}
                  onChange={(e) => setTimeEnd(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">PIC Lapangan</label>
                <Input
                  type="text"
                  placeholder="e.g. Mas Dimas (WO)"
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Lokasi / Panggung</label>
                <Input
                  type="text"
                  placeholder="e.g. Pelaminan Utama"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Contingency Plan (Plan B)</label>
              <Input
                type="text"
                placeholder="e.g. Pindahkan ke Foyer indoor jika hujan deras"
                value={contingencyPlan}
                onChange={(e) => setContingencyPlan(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Dynamic Multi-Cue Section */}
            <div className="border border-border rounded-lg p-3 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Volume2 className="h-3.5 w-3.5 text-primary" />
                  Instruksi Cue Teknis Panggung ({cues.length}):
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddCueRow}
                  className="h-7 text-xs gap-1"
                  disabled={loading}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Cue
                </Button>
              </div>

              {cues.length === 0 ? (
                <p className="text-[11px] text-muted-foreground italic">
                  Belum ada cue teknis. Klik &apos;Tambah Cue&apos; jika memerlukan instruksi Sound/Lighting/Music.
                </p>
              ) : (
                <div className="space-y-2">
                  {cues.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-card p-2 rounded border border-border/60">
                      <Select
                        value={c.cueType}
                        onValueChange={(v: any) => handleCueChange(idx, "cueType", v)}
                        disabled={loading}
                      >
                        <SelectTrigger className="h-8 text-xs w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sound">Sound</SelectItem>
                          <SelectItem value="lighting">Lighting</SelectItem>
                          <SelectItem value="music">Music</SelectItem>
                          <SelectItem value="multimedia">Multimedia</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        type="text"
                        placeholder="Instruksi cue..."
                        value={c.instruction}
                        onChange={(e) => handleCueChange(idx, "instruction", e.target.value)}
                        className="h-8 text-xs flex-1"
                        disabled={loading}
                        required
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCueRow(idx)}
                        disabled={loading}
                        className="h-8 w-8 text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
