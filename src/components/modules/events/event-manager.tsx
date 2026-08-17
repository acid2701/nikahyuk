"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createEventAction, deleteEventAction } from "@/actions/event-actions";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Plus, Trash2, MapPin, Clock } from "lucide-react";
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

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await createEventAction({
        weddingId,
        eventName,
        eventDate,
        timeStart,
        timeEnd,
        locationName,
        locationMapsUrl,
        eventSide,
      });

      toast({
        title: "Sub-Event Berhasil Ditambahkan",
        description: `Acara '${eventName}' telah dibuat.`,
        variant: "success",
      });

      setOpenModal(false);
      setEventName("");
      setLocationName("");
      setLocationMapsUrl("");
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

  async function handleDeleteEvent(eventId: string, name: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus sub-event '${name}'?`)) {
      return;
    }

    try {
      await deleteEventAction(eventId, weddingId);
      toast({
        title: "Sub-Event Dihapus",
        description: `Acara '${name}' telah dihapus.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Menghapus Sub-Event",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Sub-Event Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form onSubmit={handleCreateEvent}>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Tambah Sub-Event Acara</DialogTitle>
                <DialogDescription>
                  e.g. Lamaran, Pengajian, Siraman, Akad Nikah, Resepsi.
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
                    <label className="text-xs font-medium">Tanggal Acara</label>
                    <Input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
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

      {events.length === 0 ? (
        <Card className="border-dashed p-8 text-center space-y-3">
          <Calendar className="h-10 w-10 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm font-medium text-foreground">Belum Ada Sub-Event</p>
            <p className="text-xs text-muted-foreground mt-1">
              Klik &apos;Tambah Sub-Event Baru&apos; di atas untuk mencatat rangkian acara pernikahan.
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
                    {ev.event_date && (
                      <CardDescription className="text-xs flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {ev.event_date}
                      </CardDescription>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEvent(ev.id, ev.event_name)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
    </div>
  );
}
