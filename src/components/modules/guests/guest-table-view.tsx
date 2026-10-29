"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { PhoneInput } from "@/components/shared/whatsapp/phone-input";
import { WAButton } from "@/components/shared/whatsapp/wa-button";
import { WABlastModal } from "@/components/shared/whatsapp/wa-blast-modal";
import { GuestCSVParser } from "@/components/modules/guests/guest-csv-parser";
import { ConfirmDeleteDialog } from "@/components/shared/modal/confirm-delete-dialog";
import { DataTablePagination } from "@/components/shared/pagination/data-table-pagination";
import {
  createGuestAction,
  updateGuestAction,
  updateGuestRSVPAction,
  deleteGuestAction,
} from "@/actions/guest-actions";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Trash2, Edit, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface GuestItemRow {
  id: string;
  full_name: string;
  sanitized_phone?: string | null;
  default_pax: number;
  notes?: string | null;
  assignments?: {
    id: string;
    event_id: string;
    actual_pax: number;
    attendance_status: "pending" | "attending" | "declined" | "checked_in";
    table_id?: string | null;
    event_tables?: {
      table_number_or_name: string;
    } | null;
  }[];
}

export interface GuestTableViewProps {
  weddingId: string;
  eventId?: string | null;
  initialGuests: GuestItemRow[];
  activeEventLocation?: string | null;
}

export function GuestTableView({
  weddingId,
  eventId,
  initialGuests,
  activeEventLocation,
}: GuestTableViewProps) {
  const router = useRouter();
  const [guests, setGuests] = React.useState<GuestItemRow[]>(initialGuests);
  const [search, setSearch] = React.useState("");
  const [openModal, setOpenModal] = React.useState(false);
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [editingGuest, setEditingGuest] = React.useState<GuestItemRow | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Form states
  const [fullName, setFullName] = React.useState("");
  const [contactNumber, setContactNumber] = React.useState("");
  const [defaultPax, setDefaultPax] = React.useState("1");
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Confirm Delete Modal State
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    setGuests(initialGuests);
  }, [initialGuests]);

  function resetForm() {
    setFullName("");
    setContactNumber("");
    setDefaultPax("1");
    setNotes("");
  }

  function handleOpenEdit(guest: GuestItemRow) {
    setEditingGuest(guest);
    setFullName(guest.full_name || "");
    setContactNumber(guest.sanitized_phone || "");
    setDefaultPax(String(guest.default_pax || 1));
    setNotes(guest.notes || "");
    setOpenEditModal(true);
  }

  const filteredGuests = guests.filter((g) =>
    g.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (g.notes && g.notes.toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination calculation
  const totalItems = filteredGuests.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  async function handleCreateGuest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await createGuestAction({
        weddingId,
        fullName,
        contactNumber,
        defaultPax: Number(defaultPax) || 1,
        notes,
        eventId,
      });

      toast({
        title: "Tamu Berhasil Ditambahkan",
        description: `Tamu '${fullName}' tersimpan.`,
        variant: "success",
      });

      setOpenModal(false);
      resetForm();
      router.refresh();
    } catch (err) {
      toast({
        title: "Gagal Menambahkan Tamu",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!editingGuest) return;

    setLoading(true);

    try {
      await updateGuestAction(editingGuest.id, weddingId, {
        fullName,
        contactNumber,
        defaultPax: Number(defaultPax) || 1,
        notes,
      });

      toast({
        title: "Data Tamu Diperbarui",
        description: `Perubahan data tamu '${fullName}' tersimpan.`,
        variant: "success",
      });

      setOpenEditModal(false);
      setEditingGuest(null);
      resetForm();
      router.refresh();
    } catch (err) {
      toast({
        title: "Gagal Memperbarui Tamu",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateRSVP(assignmentId: string, status: any, pax: number) {
    try {
      await updateGuestRSVPAction(assignmentId, weddingId, status, pax);
      toast({
        title: "Status RSVP Diperbarui",
        description: `Status kehadiran berhasil diubah menjadi ${status} (${pax} Pax).`,
        variant: "success",
      });
      router.refresh();
    } catch (err) {
      toast({
        title: "Gagal Mengubah RSVP",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      await deleteGuestAction(deleteTarget.id, weddingId);
      toast({
        title: "Tamu Dihapus",
        description: `Data tamu '${deleteTarget.name}' berhasil dihapus.`,
        variant: "success",
      });
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      toast({
        title: "Gagal Menghapus Tamu",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Reusable Confirm Delete Modal */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Data Tamu?"
        description="Tindakan ini akan menghapus data tamu dan status RSVP terkait secara permanen."
        itemName={deleteTarget?.name}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Cari nama atau catatan tamu..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <GuestCSVParser weddingId={weddingId} eventId={eventId} />

          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={resetForm} className="gap-2 h-9 text-xs">
                <Plus className="h-4 w-4" />
                Tambah Tamu Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <form onSubmit={handleCreateGuest}>
                <DialogHeader>
                  <DialogTitle className="font-sans text-xl">Tambah Data Tamu</DialogTitle>
                  <DialogDescription>
                    Catat nama tamu, nomor WhatsApp, dan jumlah alokasi pax.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nama Lengkap Tamu</label>
                    <Input
                      type="text"
                      placeholder="e.g. Bapak Ahmad Subagyo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nomor WhatsApp</label>
                    <PhoneInput
                      value={contactNumber}
                      onChange={setContactNumber}
                      placeholder="081234567890"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Jumlah Alokasi (Pax)</label>
                    <Input
                      type="number"
                      value={defaultPax}
                      onChange={(e) => setDefaultPax(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Catatan Khusus</label>
                    <Input
                      type="text"
                      placeholder="e.g. Dosen Pembimbing / Keluarga Inti"
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
                    {loading ? "Menyimpan..." : "Simpan Tamu"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* EDIT GUEST MODAL */}
          <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
            <DialogContent className="max-w-md">
              <form onSubmit={handleUpdateGuest}>
                <DialogHeader>
                  <DialogTitle className="font-sans text-xl">Edit Data Tamu</DialogTitle>
                  <DialogDescription>
                    Perbarui nama lengkap, nomor WhatsApp, alokasi pax, atau catatan khusus.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nama Lengkap Tamu</label>
                    <Input
                      type="text"
                      placeholder="e.g. Bapak Ahmad Subagyo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nomor WhatsApp</label>
                    <PhoneInput
                      value={contactNumber}
                      onChange={setContactNumber}
                      placeholder="081234567890"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Jumlah Alokasi (Pax)</label>
                    <Input
                      type="number"
                      value={defaultPax}
                      onChange={(e) => setDefaultPax(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Catatan Khusus</label>
                    <Input
                      type="text"
                      placeholder="e.g. Dosen Pembimbing / Keluarga Inti"
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
      </div>

      {/* HTML TABLE VIEW WITH NO., NUMBERING & PAGINATION */}
      {filteredGuests.length === 0 ? (
        <Card className="border-dashed p-8 text-center space-y-3">
          <Users className="h-10 w-10 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm font-medium text-foreground">Tidak Ada Data Tamu Ditemukan</p>
            <p className="text-xs text-muted-foreground mt-1">
              Klik &apos;Tambah Tamu Baru&apos; atau &apos;Impor CSV Massal&apos; untuk mencatat daftar tamu Anda.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="border-border/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto min-w-0">
            <Table>
              <TableHeader className="bg-muted/60">
                <TableRow>
                  <TableHead className="w-12 text-center text-xs font-semibold">No.</TableHead>
                  <TableHead className="text-xs font-semibold">Nama Tamu & Catatan</TableHead>
                  <TableHead className="text-xs font-semibold">Kontak WA</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Pax</TableHead>
                  <TableHead className="text-xs font-semibold">Status RSVP</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedGuests.map((g, index) => {
                  const globalIndex = (currentPage - 1) * pageSize + index + 1;
                  const assignment = g.assignments && g.assignments.length > 0 ? g.assignments[0] : null;
                  const rsvpStatus = assignment ? assignment.attendance_status : "pending";

                  return (
                    <TableRow key={g.id} className="hover:bg-muted/30">
                      {/* Numbering Cell */}
                      <TableCell className="text-center font-mono font-semibold text-xs text-muted-foreground">
                        {globalIndex}
                      </TableCell>

                      {/* Guest Name & Notes */}
                      <TableCell className="text-xs">
                        <p className="font-sans font-bold text-sm text-foreground">{g.full_name}</p>
                        {g.notes && <p className="text-[11px] text-muted-foreground">{g.notes}</p>}
                      </TableCell>

                      {/* WhatsApp Contact Phone Number */}
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {g.sanitized_phone ? `+${g.sanitized_phone}` : "-"}
                      </TableCell>

                      {/* Pax */}
                      <TableCell className="text-center text-xs font-mono font-bold text-foreground">
                        {g.default_pax || 1}
                      </TableCell>

                      {/* Status RSVP Quick Update */}
                      <TableCell className="text-xs">
                        {assignment ? (
                          <Select
                            value={rsvpStatus}
                            onValueChange={(val: any) =>
                              handleUpdateRSVP(assignment.id, val, assignment.actual_pax)
                            }
                          >
                            <SelectTrigger className="h-7 w-32 text-[11px] bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Belum Konfirmasi</SelectItem>
                              <SelectItem value="attending">Hadir (Attending)</SelectItem>
                              <SelectItem value="declined">Halangan (Declined)</SelectItem>
                              <SelectItem value="checked_in">Sudah Check-In</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            Pending
                          </Badge>
                        )}
                      </TableCell>

                      {/* Action Buttons */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {g.sanitized_phone && (
                            <WABlastModal
                              guestName={g.full_name}
                              phone={g.sanitized_phone}
                              tableName={
                                (assignment as any)?.event_tables?.table_number_or_name || "Belum Diatur"
                              }
                              locationMapsUrl={activeEventLocation}
                            />
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(g)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Edit Data Tamu"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget({ id: g.id, name: g.full_name })}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            title="Hapus Data Tamu"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* SCALABLE PAGINATION FOOTER */}
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </Card>
      )}
    </div>
  );
}
