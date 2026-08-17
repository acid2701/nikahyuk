"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createEventAction, updateEventAction } from "@/actions/event-actions";
import { EventPresetDialog } from "@/components/modules/events/event-preset-dialog";
import { DeleteEventModal } from "@/components/modules/events/delete-event-modal";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Plus, Trash2, Edit, MapPin, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface EventItem {
  id: string;
  event_name: string;
  event_date?: string | null;
  time_start?: string | null;
  time_end?: string | null;
  location_name?: string | null;
  location_maps_url?: string | null;
  event_side: "groom" | "bride" | "joint";
}

export interface EventManagerProps {
  weddingId: string;
  initialEvents: EventItem[];
}

export function EventManager({ weddingId, initialEvents }: EventManagerProps) {
  const [events, setEvents] = React.useState<EventItem[]>(initialEvents);
  const [openModal, setOpenModal] = React.useState(false);
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<EventItem | null>(null);
  const [deletingEvent, setDeletingEvent] = React.useState<EventItem | null>(null);

  // Form states for Create/Edit
  const [eventName, setEventName] = React.useState("");
  const [eventDate, setEventDate] = React.useState("");
  const [timeStart, setTimeStart] = React.useState("");
  const [timeEnd, setTimeEnd] = React.useState("");
  const [locationName, setLocationName] = React.useState("");
  const [locationMapsUrl, setLocationMapsUrl] = React.useState("");
  const [eventSide, setEventSide] = React.useState<"groom" | "bride" | "joint">("joint");
  const [loading, setLoading] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  function resetForm() {
    setEventName("");
    setEventDate("");
    setTimeStart("");
    setTimeEnd("");
    setLocationName("");
    setLocationMapsUrl("");
    setEventSide("joint");
  }

  function handleOpenEdit(eventItem: EventItem) {
    setEditingEvent(eventItem);
    setEventName(eventItem.event_name || "");
    setEventDate(eventItem.event_date || "");
    setTimeStart(eventItem.time_start || "");
    setTimeEnd(eventItem.time_end || "");
    setLocationName(eventItem.location_name || "");
    setLocationMapsUrl(eventItem.location_maps_url || "");
    setEventSide(eventItem.event_side || "joint");
    setOpenEditModal(true);
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await createEventAction({
        weddingId,
        eventName,
        eventDate: eventDate || null,
        timeStart: timeStart || null,
        timeEnd: timeEnd || null,
        locationName: locationName || null,
        locationMapsUrl: locationMapsUrl || null,
        eventSide,
      });

      toast({
        title: "Sub-Event Berhasil Ditambahkan",
        description: `Acara '${eventName}' telah dibuat.`,
        variant: "success",
      });

      setOpenModal(false);
      resetForm();
    } catch (err) {
      toast({
        title: "Gagal Menambahkan Sub-Event",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!editingEvent) return;

    setLoading(true);

    try {
      await updateEventAction(editingEvent.id, weddingId, {
        eventName,
        eventDate: eventDate || null,
        timeStart: timeStart || null,
        timeEnd: timeEnd || null,
        locationName: locationName || null,
        locationMapsUrl: locationMapsUrl || null,
        eventSide,
      });

      toast({
        title: "Sub-Event Berhasil Diperbarui",
        description: `Perubahan rincian acara '${eventName}' telah disimpan.`,
        variant: "success",
      });

      setOpenEditModal(false);
      setEditingEvent(null);
      resetForm();
    } catch (err) {
      toast({
        title: "Gagal Memperbarui Sub-Event",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleOpenDelete(eventItem: EventItem) {
    setDeletingEvent(eventItem);
    setOpenDeleteModal(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end space-x-2">
        <EventPresetDialog weddingId={weddingId} />

        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Sub-Event Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form onSubmit={handleCreateEvent}>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Tambah Sub-Event Acara</DialogTitle>
                <DialogDescription>
                  e.g. Lamaran, Pengajian, Siraman, Akad Nikah, Resepsi. Tanggal acara opsional.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Nama Acara</label>
                  <Input
                    type="text"
                    placeholder="e.g. Akad Nikah & Walimah"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Tanggal Acara (Opsional)</label>
                    <Input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Penanggung Jawab Side</label>
                    <Select value={eventSide} onValueChange={(v: any) => setEventSide(v)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="joint">Bersama (Joint)</SelectItem>
                        <SelectItem value="groom">Pihak Pria</SelectItem>
                        <SelectItem value="bride">Pihak Wanita</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Jam Mulai</label>
                    <Input
                      type="time"
                      value={timeStart}
                      onChange={(e) => setTimeStart(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Jam Selesai</label>
                    <Input
                      type="time"
                      value={timeEnd}
                      onChange={(e) => setTimeEnd(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Nama Lokasi / Gedung</label>
                  <Input
                    type="text"
                    placeholder="e.g. Grand Ballroom Hotel Mulia"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Link Google Maps</label>
                  <Input
                    type="text"
                    placeholder="e.g. https://maps.google.com/..."
                    value={locationMapsUrl}
                    onChange={(e) => setLocationMapsUrl(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Acara"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* EDIT MODAL */}
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleUpdateEvent}>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Edit Sub-Event Acara</DialogTitle>
              <DialogDescription>
                Perbarui tanggal, waktu, lokasi, atau penanggung jawab acara.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Nama Acara</label>
                <Input
                  type="text"
                  placeholder="e.g. Akad Nikah & Walimah"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Tanggal Acara (Opsional)</label>
                  <Input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Penanggung Jawab Side</label>
                  <Select value={eventSide} onValueChange={(v: any) => setEventSide(v)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="joint">Bersama (Joint)</SelectItem>
                      <SelectItem value="groom">Pihak Pria</SelectItem>
                      <SelectItem value="bride">Pihak Wanita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Jam Mulai</label>
                  <Input
                    type="time"
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Jam Selesai</label>
                  <Input
                    type="time"
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Nama Lokasi / Gedung</label>
                <Input
                  type="text"
                  placeholder="e.g. Grand Ballroom Hotel Mulia"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Link Google Maps</label>
                <Input
                  type="text"
                  placeholder="e.g. https://maps.google.com/..."
                  value={locationMapsUrl}
                  onChange={(e) => setLocationMapsUrl(e.target.value)}
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

      {events.length === 0 ? (
        <Card className="border-dashed p-8 text-center space-y-3">
          <Calendar className="h-10 w-10 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm font-medium text-foreground">Belum Ada Sub-Event</p>
            <p className="text-xs text-muted-foreground mt-1">
              Klik &apos;Gunakan Preset Sub-Event&apos; atau &apos;Tambah Sub-Event Baru&apos; di atas.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((ev) => (
            <Card key={ev.id} className="border-border/80">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg font-serif">{ev.event_name}</CardTitle>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {ev.event_side === "groom"
                          ? "Pihak Pria"
                          : ev.event_side === "bride"
                          ? "Pihak Wanita"
                          : "Bersama"}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-primary" />
                      {ev.event_date ? (
                        <span>{ev.event_date}</span>
                      ) : (
                        <span className="italic text-muted-foreground">Belum Ditentukan</span>
                      )}
                    </CardDescription>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(ev)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDelete(ev)}
                      className="h-8 w-8 text-destructive hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/50"
                      title="Hapus Sub-Event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                {(ev.time_start || ev.time_end) && (
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {ev.time_start || "--:--"} s/d {ev.time_end || "Selesai"}
                    </span>
                  </div>
                )}
                {ev.location_name && (
                  <div className="flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">{ev.location_name}</p>
                      {ev.location_maps_url && (
                        <a
                          href={ev.location_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-primary underline mt-0.5 block"
                        >
                          Buka Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {deletingEvent && (
        <DeleteEventModal
          open={openDeleteModal}
          onOpenChange={setOpenDeleteModal}
          eventId={deletingEvent.id}
          eventName={deletingEvent.event_name}
          weddingId={weddingId}
        />
      )}
    </div>
  );
}
