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
import { Input } from "@/components/ui/input";
import { bulkImportGuestsAction } from "@/actions/guest-actions";
import { useToast } from "@/components/ui/use-toast";
import { Upload, FileSpreadsheet, Check } from "lucide-react";

export interface GuestCSVParserProps {
  weddingId: string;
  eventId?: string | null;
  onSuccess?: () => void;
}

export function GuestCSVParser({ weddingId, eventId, onSuccess }: GuestCSVParserProps) {
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedRows, setParsedRows] = React.useState<
    { fullName: string; contactNumber?: string; defaultPax?: number; notes?: string }[]
  >([]);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
      if (lines.length <= 1) {
        toast({
          title: "File Kosong atau Format Salah",
          description: "File CSV harus memiliki header dan minimal 1 baris data.",
          variant: "destructive",
        });
        return;
      }

      const rows = lines.slice(1).map((line) => {
        const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
        return {
          fullName: parts[0] || "Tamu Undangan",
          contactNumber: parts[1] || "",
          defaultPax: Number(parts[2]) || 1,
          notes: parts[3] || "",
        };
      });

      setParsedRows(rows.filter((r) => r.fullName !== ""));
    };

    reader.readAsText(selectedFile);
  }

  async function handleImport() {
    if (parsedRows.length === 0) return;
    setLoading(true);

    try {
      await bulkImportGuestsAction(weddingId, eventId || null, parsedRows);
      toast({
        title: "Impor Massal Berhasil",
        description: `Sebanyak ${parsedRows.length} data tamu berhasil ditambahkan.`,
        variant: "success",
      });
      setOpen(false);
      setParsedRows([]);
      setFile(null);
      onSuccess?.();
    } catch (err) {
      toast({
        title: "Gagal Mengimpor CSV",
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
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          Impor CSV Massal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Impor Daftar Tamu via CSV
          </DialogTitle>
          <DialogDescription>
            Unggah file .csv dengan format kolom: <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Nama Lengkap, Nomor WA, Pax, Catatan</code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center space-y-2 bg-muted/20">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="cursor-pointer text-xs"
            />
            {file && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
                <Check className="h-3.5 w-3.5" /> File terpilih: {file.name} ({parsedRows.length} Baris Tamu)
              </p>
            )}
          </div>

          {parsedRows.length > 0 && (
            <div className="max-h-48 overflow-y-auto border border-border rounded p-2 text-xs space-y-1 bg-card">
              <p className="font-semibold text-muted-foreground mb-1">Pratinjau {Math.min(5, parsedRows.length)} Data Pertama:</p>
              {parsedRows.slice(0, 5).map((r, idx) => (
                <div key={idx} className="flex justify-between border-b border-border/40 pb-1">
                  <span className="font-medium text-foreground">{r.fullName}</span>
                  <span className="font-mono text-muted-foreground">{r.contactNumber || "Tanpa WA"} ({r.defaultPax} Pax)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleImport} disabled={loading || parsedRows.length === 0}>
            {loading ? "Mengimpor..." : `Impor ${parsedRows.length} Tamu`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
