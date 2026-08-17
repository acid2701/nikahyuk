"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/components/shared/whatsapp/phone-input";
import { WABlastModal } from "@/components/shared/whatsapp/wa-blast-modal";
import { GuestCSVParser } from "@/components/modules/guests/guest-csv-parser";
import { createGuestAction, updateGuestRSVPAction, deleteGuestAction } from "@/actions/guest-actions";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Trash2 } from "lucide-react";
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
  }[];
}

export interface GuestTableViewProps {
  weddingId: string;
  eventId?: string | null;
  initialGuests: GuestItemRow[];
}

export function GuestTableView({ weddingId, eventId, initialGuests }: GuestTableViewProps) {
  const [guests, setGuests] = React.useState<GuestItemRow[]>(initialGuests);
  const [search, setSearch] = React.useState("");
  const [openModal, setOpenModal] = React.useState(false);

  const [fullName, setFullName] = React.useState("");
  const [contactNumber, setContactNumber] = React.useState("");
  const [defaultPax, setDefaultPax] = React.useState("1");
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    setGuests(initialGuests);
  }, [initialGuests]);

  const filteredGuests = guests.filter((g) =>
    g.full_name.toLowerCase().includes(search.toLowerCase())
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
      setFullName("");
      setContactNumber("");
      setDefaultPax("1");
      setNotes("");
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

  async function handleUpdateRSVP(assignmentId: string, status: any, pax: number) {
    try {
      await updateGuestRSVPAction(assignmentId, weddingId, status, pax);
      toast({
        title: "Status RSVP Diperbarui",
        description: `Status diubah menjadi '${status}'.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Mengubah RSVP",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteGuest(guestId: string, name: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus data tamu '${name}'?`)) {
      return;
    }

    try {
      await deleteGuestAction(guestId, weddingId);
      toast({
        title: "Tamu Dihapus",
        description: `Data tamu '${name}' berhasil dihapus.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Menghapus Tamu",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Cari nama tamu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <GuestCSVParser weddingId={weddingId} eventId={eventId} />

          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 h-9 text-xs">
                <Plus className="h-4 w-4" />
                Tambah Tamu Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <form onSubmit={handleCreateGuest}>
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">Tambah Data Tamu</DialogTitle>
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
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b border-border font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Nama Tamu</th>
                <th className="p-3">Nomor WA</th>
                <th className="p-3">Pax</th>
                <th className="p-3">Status RSVP</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    Tidak ada data tamu ditemukan.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((g) => {
                  const assignment = g.assignments && g.assignments.length > 0 ? g.assignments[0] : null;
                  const rsvpStatus = assignment ? assignment.attendance_status : "pending";

                  return (
                    <tr key={g.id} className="hover:bg-muted/20">
                      <td className="p-3 font-semibold text-foreground">
                        {g.full_name}
                        {g.notes && <p className="text-[10px] text-muted-foreground font-normal">{g.notes}</p>}
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">
                        {g.sanitized_phone ? `+${g.sanitized_phone}` : "-"}
                      </td>
                      <td className="p-3 font-mono font-semibold">
                        {g.default_pax} Pax
                      </td>
                      <td className="p-3">
                        {assignment ? (
                          <Select
                            value={rsvpStatus}
                            onValueChange={(val: any) =>
                              handleUpdateRSVP(assignment.id, val, assignment.actual_pax)
                            }
                          >
                            <SelectTrigger className="h-7 text-[11px] w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
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
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {g.sanitized_phone && (
                          <WABlastModal guestName={g.full_name} phone={g.sanitized_phone} />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGuest(g.id, g.full_name)}
                          className="h-7 w-7 text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
