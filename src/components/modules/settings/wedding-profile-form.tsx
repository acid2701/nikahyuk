"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { updateWeddingProfileAction } from "@/actions/wedding-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Save, Pencil, X } from "lucide-react";

export interface WeddingProfileFormProps {
  weddingId: string;
  groomName: string;
  brideName: string;
  weddingSlug: string;
}

export function WeddingProfileForm({
  weddingId,
  groomName: initialGroomName,
  brideName: initialBrideName,
  weddingSlug: initialSlug,
}: WeddingProfileFormProps) {
  const [editing, setEditing] = React.useState(false);
  const [groomName, setGroomName] = React.useState(initialGroomName);
  const [brideName, setBrideName] = React.useState(initialBrideName);
  const [weddingSlug, setWeddingSlug] = React.useState(initialSlug);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  function handleCancel() {
    setGroomName(initialGroomName);
    setBrideName(initialBrideName);
    setWeddingSlug(initialSlug);
    setEditing(false);
  }

  const hasChanges =
    groomName !== initialGroomName ||
    brideName !== initialBrideName ||
    weddingSlug !== initialSlug;

  async function handleSave() {
    if (!groomName.trim() || !brideName.trim() || !weddingSlug.trim()) {
      toast({
        title: "Perhatian",
        description: "Semua kolom wajib diisi dan tidak boleh kosong.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const updates: Record<string, string> = {};
      if (groomName !== initialGroomName) updates.groomName = groomName.trim();
      if (brideName !== initialBrideName) updates.brideName = brideName.trim();
      if (weddingSlug !== initialSlug) updates.weddingSlug = weddingSlug.trim();

      await updateWeddingProfileAction(weddingId, updates);

      toast({
        title: "Profil Berhasil Diperbarui",
        description: "Data pasangan dan slug acara telah disimpan.",
        variant: "success",
      });

      setEditing(false);
      router.refresh();
    } catch (err) {
      toast({
        title: "Gagal Menyimpan",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-serif">
              Detail Pasangan Pengantin
            </CardTitle>
            <CardDescription className="text-xs">
              Informasi identitas utama dan URL slug workspace pernikahan.
            </CardDescription>
          </div>
          {!editing ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Profil
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={handleCancel}
                disabled={loading}
              >
                <X className="h-3.5 w-3.5" />
                Batal
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleSave}
                disabled={loading || !hasChanges}
              >
                <Save className="h-3.5 w-3.5" />
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="profile-groom-name"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Pengantin Pria (Groom)
            </label>
            {editing ? (
              <Input
                id="profile-groom-name"
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                disabled={loading}
                placeholder="Nama Pengantin Pria"
              />
            ) : (
              <p className="font-bold text-base text-foreground p-2 rounded-md border border-transparent bg-card/40">
                {groomName || "Belum diisi"}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-bride-name"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Pengantin Wanita (Bride)
            </label>
            {editing ? (
              <Input
                id="profile-bride-name"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                disabled={loading}
                placeholder="Nama Pengantin Wanita"
              />
            ) : (
              <p className="font-bold text-base text-foreground p-2 rounded-md border border-transparent bg-card/40">
                {brideName || "Belum diisi"}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="profile-slug"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Slug Acara Unik (URL Identifier)
          </label>
          {editing ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-mono shrink-0">/</span>
              <Input
                id="profile-slug"
                value={weddingSlug}
                onChange={(e) =>
                  setWeddingSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "")
                  )
                }
                disabled={loading}
                placeholder="contoh: dimas-sarah-2026"
                className="font-mono text-sm"
              />
            </div>
          ) : (
            <p className="font-mono text-sm font-semibold text-primary p-2 rounded-md border border-transparent bg-card/40">
              /{weddingSlug}
            </p>
          )}
          {editing && (
            <p className="text-[10px] text-muted-foreground">
              Hanya huruf kecil, angka, dan tanda hubung. Minimal 3 karakter. Harus unik.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
