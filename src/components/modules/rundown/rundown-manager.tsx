"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CueBadge } from "@/components/shared/badges/cue-badge";
import { TimelineShiftModal } from "@/components/modules/rundown/timeline-shift-modal";
import { RundownPresetDialog } from "@/components/modules/rundown/rundown-preset-dialog";
import { createRundownItemAction, toggleRundownItemCompleteAction, deleteRundownItemAction } from "@/actions/rundown-actions";
import { useToast } from "@/components/ui/use-toast";
import { CueTypeEnum } from "@/types/database.types";
import { Plus, Trash2, Clock, MapPin, UserCheck, CheckSquare, Square, Volume2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface RundownCueItem {
  id: string;
  cue_type: CueTypeEnum;
  instruction: string;
}

export interface RundownItem {
  id: string;
  time_start: string;
  time_end: string;
  activity_title: string;
  pic_name?: string | null;
  location?: string | null;
  contingency_plan?: string | null;
  is_internal_only: boolean;
  is_completed: boolean;
  sort_order: number;
  rundown_cues?: RundownCueItem[];
}

export interface RundownManagerProps {
  weddingId: string;
  eventId: string;
  initialRundowns: RundownItem[];
}

export function RundownManager({ weddingId, eventId, initialRundowns }: RundownManagerProps) {
  const [rundowns, setRundowns] = React.useState<RundownItem[]>(initialRundowns);
  const [openModal, setOpenModal] = React.useState(false);

  const [activityTitle, setActivityTitle] = React.useState("");
  const [timeStart, setTimeStart] = React.useState("08:00");
  const [timeEnd, setTimeEnd] = React.useState("08:30");
  const [picName, setPicName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [contingencyPlan, setContingencyPlan] = React.useState("");
  const [cueType, setCueType] = React.useState<CueTypeEnum>("sound");
  const [cueInstruction, setCueInstruction] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setRundowns(initialRundowns);
  }, [initialRundowns]);

  async function handleCreateItem(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const cues = cueInstruction ? [{ cueType, instruction: cueInstruction }] : [];
      await createRundownItemAction({
        weddingId,
        eventId,
        timeStart,
        timeEnd,
        activityTitle,
        picName,
        location,
        contingencyPlan,
        cues,
      });

      toast({
        title: "Agenda Berhasil Ditambahkan",
        description: `Agenda '${activityTitle}' tersimpan di rundown.`,
        variant: "success",
      });

      setOpenModal(false);
      setActivityTitle("");
      setPicName("");
      setLocation("");
      setContingencyPlan("");
      setCueInstruction("");
    } catch (err) {
      toast({
        title: "Gagal Menambahkan Agenda",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleComplete(rId: string, currentCompleted: boolean) {
    try {
      await toggleRundownItemCompleteAction(rId, weddingId, !currentCompleted);
      toast({
        title: "Status Agenda Diperbarui",
        description: `Agenda ditandai ${!currentCompleted ? "SELESAI" : "PENDING"}.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Memperbarui Agenda",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteItem(rId: string, title: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus agenda '${title}'?`)) return;

    try {
      await deleteRundownItemAction(rId, weddingId);
      toast({
        title: "Agenda Dihapus",
        description: `Agenda '${title}' telah dihapus.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Menghapus Agenda",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
  }

  const completedCount = rundowns.filter((r) => r.is_completed).length;
  const progressRatio = rundowns.length > 0 ? (completedCount / rundowns.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card">
        <div className="space-y-1 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Progres Acara Live ({completedCount} / {rundowns.length} Selesai)
            </span>
            <span className="font-mono text-xs font-bold text-primary">{progressRatio.toFixed(0)}%</span>
          </div>
          <div className="w-full sm:w-64 bg-muted h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all"
              style={{ width: `${progressRatio}%` }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <RundownPresetDialog weddingId={weddingId} eventId={eventId} />

          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 h-9 text-xs">
                <Plus className="h-4 w-4" />
                Tambah Agenda Rundown
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <form onSubmit={handleCreateItem}>
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">Tambah Agenda Rundown</DialogTitle>
                  <DialogDescription>
                    Catat waktu, judul susunan acara, PIC, & cue teknis.
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
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium">Jam Selesai</label>
                      <Input
                        type="time"
                        value={timeEnd}
                        onChange={(e) => setTimeEnd(e.target.value)}
                        required
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
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium">Lokasi / Panggung</label>
                      <Input
                        type="text"
                        placeholder="e.g. Pelaminan Utama"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="border-t border-border pt-2 space-y-2">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Volume2 className="h-3.5 w-3.5 text-primary" />
                      Cue Teknis Tim (Opsional):
                    </label>

                    <div className="grid gap-2 sm:grid-cols-3">
                      <Select value={cueType} onValueChange={(v: any) => setCueType(v)}>
                        <SelectTrigger className="h-8 text-xs">
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
                        value={cueInstruction}
                        onChange={(e) => setCueInstruction(e.target.value)}
                        className="h-8 text-xs sm:col-span-2"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Menyimpan..." : "Simpan Agenda"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {rundowns.length === 0 ? (
        <Card className="border-dashed p-8 text-center space-y-3">
          <Clock className="h-10 w-10 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm font-medium text-foreground">Belum Ada Susunan Acara</p>
            <p className="text-xs text-muted-foreground mt-1">
              Klik &apos;Tambah Agenda Rundown&apos; atau gunakan tombol &apos;Preset Template&apos; di atas.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {rundowns.map((r) => {
            const cues = r.rundown_cues || [];
            return (
              <Card
                key={r.id}
                className={`border-border/80 transition-colors ${
                  r.is_completed ? "bg-muted/30 border-muted" : "bg-card"
                }`}
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleComplete(r.id, r.is_completed)}
                      className="h-7 w-7 shrink-0 text-primary mt-0.5"
                    >
                      {r.is_completed ? (
                        <CheckSquare className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Square className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-sm text-primary">
                          {r.time_start} - {r.time_end}
                        </span>
                        <h3
                          className={`font-semibold text-sm ${
                            r.is_completed ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {r.activity_title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {r.pic_name && (
                          <span className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3" /> PIC: {r.pic_name}
                          </span>
                        )}
                        {r.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {r.location}
                          </span>
                        )}
                      </div>

                      {cues.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {cues.map((c) => (
                            <CueBadge
                              key={c.id}
                              cueType={c.cue_type}
                              instruction={c.instruction}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 justify-end">
                    <TimelineShiftModal
                      eventId={eventId}
                      weddingId={weddingId}
                      targetRundownId={r.id}
                      targetActivityTitle={r.activity_title}
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(r.id, r.activity_title)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
