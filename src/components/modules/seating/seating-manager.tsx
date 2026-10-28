"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDeleteDialog } from "@/components/shared/modal/confirm-delete-dialog";
import {
  createSeatingTableAction,
  updateSeatingTableAction,
  assignGuestToTableAction,
  deleteSeatingTableAction,
} from "@/actions/seating-actions";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Edit, LayoutGrid, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface SeatingTableItem {
  id: string;
  table_number_or_name: string;
  max_seats: number;
  notes?: string | null;
  assignments?: {
    id: string;
    actual_pax: number;
    guest?: {
      full_name: string;
    } | null;
  }[];
}

export interface UnassignedGuestItem {
  assignmentId: string;
  fullName: string;
  pax: number;
}

export interface SeatingManagerProps {
  weddingId: string;
  eventId: string;
  initialTables: SeatingTableItem[];
  unassignedGuests: UnassignedGuestItem[];
}

export function SeatingManager({
  weddingId,
  eventId,
  initialTables,
  unassignedGuests,
}: SeatingManagerProps) {
  const [tables, setTables] = React.useState<SeatingTableItem[]>(initialTables);
  const [openModal, setOpenModal] = React.useState(false);
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [editingTable, setEditingTable] = React.useState<SeatingTableItem | null>(null);

  const [tableName, setTableName] = React.useState("");
  const [maxSeats, setMaxSeats] = React.useState("10");
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [selectedGuestAssignmentId, setSelectedGuestAssignmentId] = React.useState("");
  const [targetTableId, setTargetTableId] = React.useState("");

  // Confirm Delete Modal State
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    setTables(initialTables);
  }, [initialTables]);

  function resetForm() {
    setTableName("");
    setMaxSeats("10");
    setNotes("");
  }

  function handleOpenEditTable(table: SeatingTableItem) {
    setEditingTable(table);
    setTableName(table.table_number_or_name || "");
    setMaxSeats(String(table.max_seats || 10));
    setNotes(table.notes || "");
    setOpenEditModal(true);
  }

  async function handleCreateTable(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await createSeatingTableAction({
        weddingId,
        eventId,
        tableName,
        maxSeats: Number(maxSeats) || 10,
        notes,
      });

      toast({
        title: "Meja Berhasil Dibuat",
        description: `Meja '${tableName}' dengan kapasitas ${maxSeats} kursi telah ditambahkan.`,
        variant: "success",
      });

      setOpenModal(false);
      resetForm();
    } catch (err) {
      toast({
        title: "Gagal Membuat Meja",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateTable(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTable) return;

    setLoading(true);

    try {
      await updateSeatingTableAction(editingTable.id, weddingId, {
        tableName,
        maxSeats: Number(maxSeats) || 10,
        notes,
      });

      toast({
        title: "Data Meja Diperbarui",
        description: `Perubahan rincian meja '${tableName}' tersimpan.`,
        variant: "success",
      });

      setOpenEditModal(false);
      setEditingTable(null);
      resetForm();
    } catch (err) {
      toast({
        title: "Gagal Memperbarui Meja",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignGuest() {
    if (!selectedGuestAssignmentId || !targetTableId) return;

    try {
      await assignGuestToTableAction(selectedGuestAssignmentId, targetTableId, weddingId);
      toast({
        title: "Tamu Berhasil Ditempatkan",
        description: "Posisi kursi tamu telah diperbarui.",
        variant: "success",
      });
      setSelectedGuestAssignmentId("");
    } catch (err) {
      toast({
        title: "Gagal Menempatkan Tamu",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
  }

  async function handleUnassignGuest(assignmentId: string) {
    try {
      await assignGuestToTableAction(assignmentId, null, weddingId);
      toast({
        title: "Tamu Dilepas dari Meja",
        description: "Tamu dikembalikan ke daftar antrean belum duduk.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Melepas Tamu",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      await deleteSeatingTableAction(deleteTarget.id, weddingId);
      toast({
        title: "Meja Dihapus",
        description: `Meja '${deleteTarget.name}' berhasil dihapus & tamu dikembalikan ke antrean.`,
        variant: "success",
      });
      setDeleteTarget(null);
    } catch (err) {
      toast({
        title: "Gagal Menghapus Meja",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Reusable Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Meja Undangan?"
        description="Tindakan ini akan menghapus alokasi meja. Tamu yang terdaftar di meja ini akan otomatis dikembalikan ke antrean."
        itemName={deleteTarget?.name}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select
            value={selectedGuestAssignmentId}
            onValueChange={setSelectedGuestAssignmentId}
          >
            <SelectTrigger className="h-9 text-xs w-full sm:w-60">
              <SelectValue placeholder="Pilih Tamu Belum Duduk..." />
            </SelectTrigger>
            <SelectContent>
              {unassignedGuests.length === 0 ? (
                <SelectItem value="none" disabled>
                  Semua Tamu Sudah Duduk
                </SelectItem>
              ) : (
                unassignedGuests.map((ug) => (
                  <SelectItem key={ug.assignmentId} value={ug.assignmentId}>
                    {ug.fullName} ({ug.pax} Pax)
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Select value={targetTableId} onValueChange={setTargetTableId}>
            <SelectTrigger className="h-9 text-xs w-full sm:w-44">
              <SelectValue placeholder="Pilih Meja Tujuan..." />
            </SelectTrigger>
            <SelectContent>
              {tables.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.table_number_or_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            size="sm"
            onClick={handleAssignGuest}
            disabled={!selectedGuestAssignmentId || !targetTableId}
            className="h-9 text-xs"
          >
            Dudukkan Tamu
          </Button>
        </div>

        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={resetForm} className="gap-2 h-9 text-xs">
              <Plus className="h-4 w-4" />
              Tambah Meja Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form onSubmit={handleCreateTable}>
              <DialogHeader>
                <DialogTitle className="font-sans text-xl">Tambah Meja Undangan</DialogTitle>
                <DialogDescription>
                  e.g. Meja VIP 1, Meja Keluarga Pria A, Meja Dosen.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Nomor / Nama Meja</label>
                  <Input
                    type="text"
                    placeholder="e.g. Meja VIP Utama 1"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Kapasitas Maksimal Kursi</label>
                  <Input
                    type="number"
                    value={maxSeats}
                    onChange={(e) => setMaxSeats(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Catatan Meja</label>
                  <Input
                    type="text"
                    placeholder="e.g. Khusus Rombongan Direksi"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Meja"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* EDIT TABLE MODAL */}
        <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
          <DialogContent className="max-w-md">
            <form onSubmit={handleUpdateTable}>
              <DialogHeader>
                <DialogTitle className="font-sans text-xl">Edit Data Meja</DialogTitle>
                <DialogDescription>
                  Perbarui nomor/nama meja, kapasitas kursi, atau catatan meja.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Nomor / Nama Meja</label>
                  <Input
                    type="text"
                    placeholder="e.g. Meja VIP Utama 1"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Kapasitas Maksimal Kursi</label>
                  <Input
                    type="number"
                    value={maxSeats}
                    onChange={(e) => setMaxSeats(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Catatan Meja</label>
                  <Input
                    type="text"
                    placeholder="e.g. Khusus Rombongan Direksi"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenEditModal(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tables.length === 0 ? (
        <Card className="border-dashed p-8 text-center space-y-3">
          <LayoutGrid className="h-10 w-10 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm font-medium text-foreground">Belum Ada Meja Terdaftar</p>
            <p className="text-xs text-muted-foreground mt-1">
              Klik &apos;Tambah Meja Baru&apos; di atas untuk mengatur denah tempat duduk katering & tamu.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {tables.map((t) => {
            const assignedList = t.assignments || [];
            let currentSeatedPax = 0;
            assignedList.forEach((a) => {
              currentSeatedPax += a.actual_pax || 1;
            });

            const ratio = t.max_seats > 0 ? (currentSeatedPax / t.max_seats) * 100 : 0;

            let badgeVariant: "success" | "warning" | "destructive" = "success";
            let badgeLabel = "Kapasitas Aman";

            if (ratio > 100) {
              badgeVariant = "destructive";
              badgeLabel = "OVERBOOKED!";
            } else if (ratio > 80) {
              badgeVariant = "warning";
              badgeLabel = "Hampir Penuh";
            }

            return (
              <Card
                key={t.id}
                className={`border-border/80 flex flex-col justify-between transition-all ${
                  ratio > 100 ? "border-rose-500/80 shadow-rose-500/10 shadow-md" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">{t.table_number_or_name}</CardTitle>
                      {t.notes && <CardDescription className="text-xs">{t.notes}</CardDescription>}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditTable(t)}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Edit Data Meja"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget({ id: t.id, name: t.table_number_or_name })}
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        title="Hapus Meja"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <Badge
                      variant={badgeVariant}
                      className={ratio > 100 ? "animate-pulse uppercase text-[10px] bg-rose-600 text-white font-bold" : "text-[10px]"}
                    >
                      {badgeLabel}
                    </Badge>
                    <span className="font-mono text-xs font-bold text-foreground">
                      {currentSeatedPax} / {t.max_seats} Kursi ({ratio.toFixed(0)}%)
                    </span>
                  </div>

                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full transition-all ${
                        ratio > 100
                          ? "bg-rose-600 animate-pulse"
                          : ratio > 80
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, ratio)}%` }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="border-t border-border/50 pt-3 space-y-2">
                  <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Tamu Terdaftar di Meja Ini ({assignedList.length}):
                  </h4>

                  {assignedList.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Belum ada tamu di meja ini.</p>
                  ) : (
                    <ul className="space-y-1 text-xs">
                      {assignedList.map((a) => (
                        <li
                          key={a.id}
                          className="flex items-center justify-between p-1.5 rounded bg-muted/30 border border-border/30"
                        >
                          <span className="font-medium">{a.guest?.full_name || "Tamu"}</span>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono text-muted-foreground text-[11px]">{a.actual_pax} Pax</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUnassignGuest(a.id)}
                              className="h-5 w-5 text-muted-foreground hover:text-destructive"
                              title="Lepas Tamu dari Meja Ini"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
