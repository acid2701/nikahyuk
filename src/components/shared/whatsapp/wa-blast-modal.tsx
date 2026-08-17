"use client";

import * as React from "react";
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
import { WAButton } from "@/components/shared/whatsapp/wa-button";
import { Send, MessageSquare } from "lucide-react";

export interface WABlastModalProps {
  guestName: string;
  phone: string;
  tableName?: string | null;
  locationMapsUrl?: string | null;
}

export function WABlastModal({
  guestName,
  phone,
  tableName,
  locationMapsUrl,
}: WABlastModalProps) {
  const displayTable = tableName || "Belum Diatur";
  const displayLocation = locationMapsUrl || "Lokasi Belum Ditentukan";

  const [open, setOpen] = React.useState(false);
  const [template, setTemplate] = React.useState(
    "Kepada Yth. Bpk/Ibu/Saudara/i {nama_tamu},\n\nTanpa mengurangi rasa hormat, kami mengundang Anda untuk hadir di acara pernikahan kami.\n\nNomor Meja: {nomor_meja}\nLokasi: {lokasi_maps}\n\nTerima kasih."
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-emerald-600 border-emerald-500/30">
          <Send className="h-3 w-3" />
          Kirim Undangan WA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-500" />
            Kirim Undangan WhatsApp Direct
          </DialogTitle>
          <DialogDescription>
            Pesan terisi otomatis dengan variabel nama, nomor meja, & peta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <label className="text-xs font-medium">Draft Pesan WhatsApp</label>
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={6}
              className="w-full text-xs p-2 rounded border border-border bg-card font-mono"
            />
          </div>

          <div className="p-2 rounded bg-muted/40 text-[11px] text-muted-foreground space-y-0.5">
            <p><strong>Penerima:</strong> {guestName} (+{phone})</p>
            <p><strong>Nomor Meja:</strong> {displayTable}</p>
            <p><strong>Lokasi Acara:</strong> {displayLocation}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <WAButton
            phone={phone}
            templateString={template}
            variables={{
              nama_tamu: guestName,
              nomor_meja: displayTable,
              lokasi_maps: displayLocation,
            }}
            label="Buka WhatsApp Chat"
            variant="default"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
