"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useRealtimeCheckin } from "@/hooks/use-realtime-checkin";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { createClient } from "@/lib/db/client";
import { Search, UserCheck, Gift, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface MobileCheckinItem {
  assignmentId: string;
  guestId: string;
  fullName: string;
  pax: number;
  attendanceStatus: string;
  souvenirReceived: boolean;
  tableName?: string | null;
}

export interface MobileCheckinDeskProps {
  token: string;
  eventId: string;
  weddingId: string;
  initialAssignments: MobileCheckinItem[];
}

export function MobileCheckinDesk({
  token,
  eventId,
  weddingId,
  initialAssignments,
}: MobileCheckinDeskProps) {
  const [assignments, setAssignments] = React.useState<MobileCheckinItem[]>(initialAssignments);
  const [search, setSearch] = React.useState("");
  const [openWalkin, setOpenWalkin] = React.useState(false);
  const [walkinName, setWalkinName] = React.useState("");
  const [walkinPax, setWalkinPax] = React.useState("1");
  const [loading, setLoading] = React.useState(false);

  const { toast } = useToast();
  const { isOnline, pendingSyncCount } = useOfflineSync(eventId);
  const realtimeUpdate = useRealtimeCheckin(eventId);

  React.useEffect(() => {
    if (realtimeUpdate) {
      fetchLatestData();
    }
  }, [realtimeUpdate]);

  async function fetchLatestData() {
    const db = createClient();
    const { data } = await db
      .from("event_guest_assignments")
      .select("id, guest_id, actual_pax, attendance_status, souvenir_received, guests(full_name), event_tables(table_number_or_name)")
      .eq("event_id", eventId);

    if (data) {
      const mapped = data.map((d: any) => ({
        assignmentId: d.id,
        guestId: d.guest_id,
        fullName: d.guests?.full_name || "Tamu",
        pax: d.actual_pax || 1,
        attendanceStatus: d.attendance_status,
        souvenirReceived: d.souvenir_received || false,
        tableName: d.event_tables?.table_number_or_name || null,
      }));
      setAssignments(mapped);
    }
  }

  const filtered = assignments.filter((a) =>
    a.fullName.toLowerCase().includes(search.toLowerCase())
  );

  async function handleToggleCheckin(item: MobileCheckinItem) {
    const isCheckedIn = item.attendanceStatus === "checked_in";
    const newStatus = isCheckedIn ? "attending" : "checked_in";
    const timestamp = newStatus === "checked_in" ? new Date().toISOString() : null;

    // Optimistic UI Update
    setAssignments((prev) =>
      prev.map((a) =>
        a.assignmentId === item.assignmentId
          ? { ...a, attendanceStatus: newStatus }
          : a
      )
    );

    if (!navigator.onLine) {
      try {
        const { offlineDB } = await import("@/lib/db/dexie-offline");
        await offlineDB.mutationQueue.add({
          actionType: "CHECKIN",
          payload: {
            assignmentId: item.assignmentId,
            attendanceStatus: newStatus,
            checkinTimestamp: timestamp,
          },
          timestamp: Date.now(),
        });
        toast({
          title: "Check-in Disimpan Offline",
          description: "Perubahan akan disinkronkan saat koneksi pulih.",
          variant: "warning",
        });
      } catch (err) {
        console.error("Dexie save error", err);
      }
      return;
    }

    try {
      const db = createClient();
      await db
        .from("event_guest_assignments")
        .update({
          attendance_status: newStatus,
          checkin_timestamp: timestamp,
        })
        .eq("id", item.assignmentId);

      toast({
        title: isCheckedIn ? "Batal Check-in" : "Check-in Berhasil!",
        description: `Tamu '${item.fullName}' (${item.pax} Pax) berhasil dicatat.`,
        variant: "success",
      });

      fetchLatestData();
    } catch (err) {
      toast({
        title: "Gagal Check-in",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
  }

  async function handleToggleSouvenir(item: MobileCheckinItem) {
    const nextState = !item.souvenirReceived;

    setAssignments((prev) =>
      prev.map((a) =>
        a.assignmentId === item.assignmentId
          ? { ...a, souvenirReceived: nextState }
          : a
      )
    );

    if (!navigator.onLine) {
      try {
        const { offlineDB } = await import("@/lib/db/dexie-offline");
        await offlineDB.mutationQueue.add({
          actionType: "SOUVENIR",
          payload: {
            assignmentId: item.assignmentId,
            souvenirReceived: nextState,
          },
          timestamp: Date.now(),
        });
        toast({
          title: "Suvenir Disimpan Offline",
          description: "Perubahan akan disinkronkan saat koneksi pulih.",
          variant: "warning",
        });
      } catch (err) {
        console.error("Dexie save error", err);
      }
      return;
    }

    try {
      const db = createClient();
      await db
        .from("event_guest_assignments")
        .update({ souvenir_received: nextState })
        .eq("id", item.assignmentId);

      toast({
        title: "Status Suvenir Diperbarui",
        description: `Suvenir untuk '${item.fullName}' ${nextState ? "DISERAHKAN" : "DITAMPUNG"}.`,
        variant: "success",
      });

      fetchLatestData();
    } catch (err) {
      toast({
        title: "Gagal Mengubah Suvenir",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
  }

  async function handleCreateWalkin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const db = createClient();
      const { data: newGuest, error: guestErr } = await db
        .from("guests")
        .insert({
          wedding_id: weddingId,
          full_name: `${walkinName} (Walk-in)`,
          default_pax: Number(walkinPax) || 1,
        })
        .select()
        .single();

      if (guestErr || !newGuest) throw new Error(guestErr?.message || "Gagal membuat tamu walk-in");

      await db.from("event_guest_assignments").insert({
        event_id: eventId,
        guest_id: newGuest.id,
        actual_pax: Number(walkinPax) || 1,
        attendance_status: "checked_in",
        is_walk_in: true,
        checkin_timestamp: new Date().toISOString(),
      });

      toast({
        title: "Tamu Walk-in Ditambahkan!",
        description: `'${walkinName}' langsung terdaftar & checked-in.`,
        variant: "success",
      });

      setOpenWalkin(false);
      setWalkinName("");
      setWalkinPax("1");
      fetchLatestData();
    } catch (err) {
      toast({
        title: "Gagal Menambahkan Walk-in",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const checkedInCount = assignments.filter((a) => a.attendanceStatus === "checked_in").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href={`/view/${token}`}>
          <Button variant="ghost" size="sm" className="gap-1 h-8 text-xs px-2">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
        </Link>
        <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          {checkedInCount} Tamu Check-in
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Cari nama tamu registrasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-xs"
          />
        </div>

        <Dialog open={openWalkin} onOpenChange={setOpenWalkin}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-10 text-xs gap-1 shrink-0">
              <Plus className="h-4 w-4" /> Walk-in
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs">
            <form onSubmit={handleCreateWalkin}>
              <DialogHeader>
                <DialogTitle className="font-sans text-lg">Tambah Tamu Walk-in</DialogTitle>
                <DialogDescription className="text-xs">
                  Tamu susulan yang hadir tanpa konfirmasi awal.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Nama Tamu</label>
                  <Input
                    type="text"
                    placeholder="e.g. Bapak Hendra"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Jumlah Rombongan (Pax)</label>
                  <Input
                    type="number"
                    value={walkinPax}
                    onChange={(e) => setWalkinPax(e.target.value)}
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenWalkin(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan & Check-in"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-8">
            Tidak ada tamu ditemukan.
          </p>
        ) : (
          filtered.map((item) => {
            const isCheckedIn = item.attendanceStatus === "checked_in";
            return (
              <Card
                key={item.assignmentId}
                className={`border-border/70 transition-all ${
                  isCheckedIn ? "bg-emerald-500/5 border-emerald-500/30" : "bg-card"
                }`}
              >
                <CardContent className="p-3 flex items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-xs text-foreground">{item.fullName}</h3>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {item.pax} Pax
                      </Badge>
                    </div>

                    {item.tableName && (
                      <p className="text-[11px] text-muted-foreground font-medium">
                        Meja: {item.tableName}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <Button
                      variant={item.souvenirReceived ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleSouvenir(item)}
                      className={`h-8 px-2 text-[10px] gap-1 ${
                        item.souvenirReceived
                          ? "bg-amber-600 hover:bg-amber-700 text-white"
                          : "text-amber-600 border-amber-300 dark:border-amber-800"
                      }`}
                    >
                      <Gift className="h-3 w-3" />
                      {item.souvenirReceived ? "Suvenir OK" : "Suvenir"}
                    </Button>

                    <Button
                      variant={isCheckedIn ? "success" : "outline"}
                      size="sm"
                      onClick={() => handleToggleCheckin(item)}
                      className="h-8 px-2 text-xs gap-1"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      {isCheckedIn ? "Hadir" : "Check-in"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
