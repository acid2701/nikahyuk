"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { updateWeddingProfileAction } from "@/actions/wedding-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Save, Pencil, X, Users } from "lucide-react";

export interface WeddingProfileFormProps {
  weddingId: string;
  groomName: string;
  brideName: string;
  weddingSlug: string;
  groomFatherName?: string | null;
  groomMotherName?: string | null;
  brideFatherName?: string | null;
  brideMotherName?: string | null;
}

export function WeddingProfileForm({
  weddingId,
  groomName: initialGroomName,
  brideName: initialBrideName,
  weddingSlug: initialSlug,
  groomFatherName: initialGroomFather = "",
  groomMotherName: initialGroomMother = "",
  brideFatherName: initialBrideFather = "",
  brideMotherName: initialBrideMother = "",
}: WeddingProfileFormProps) {
  const [editing, setEditing] = React.useState(false);
  const [groomName, setGroomName] = React.useState(initialGroomName);
  const [brideName, setBrideName] = React.useState(initialBrideName);
  const [weddingSlug, setWeddingSlug] = React.useState(initialSlug);

  const [groomFatherName, setGroomFatherName] = React.useState(initialGroomFather || "");
  const [groomMotherName, setGroomMotherName] = React.useState(initialGroomMother || "");
  const [brideFatherName, setBrideFatherName] = React.useState(initialBrideFather || "");
  const [brideMotherName, setBrideMotherName] = React.useState(initialBrideMother || "");

  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  function handleCancel() {
    setGroomName(initialGroomName);
    setBrideName(initialBrideName);
    setWeddingSlug(initialSlug);
    setGroomFatherName(initialGroomFather || "");
    setGroomMotherName(initialGroomMother || "");
    setBrideFatherName(initialBrideFather || "");
    setBrideMotherName(initialBrideMother || "");
    setEditing(false);
  }

  const hasChanges =
    groomName !== initialGroomName ||
    brideName !== initialBrideName ||
    weddingSlug !== initialSlug ||
    groomFatherName !== (initialGroomFather || "") ||
    groomMotherName !== (initialGroomMother || "") ||
    brideFatherName !== (initialBrideFather || "") ||
    brideMotherName !== (initialBrideMother || "");

  async function handleSave() {
    if (!groomName.trim() || !brideName.trim() || !weddingSlug.trim()) {
      toast({
        title: "Perhatian",
        description: "Nama pengantin dan slug acara tidak boleh kosong.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      await updateWeddingProfileAction(weddingId, {
        groomName: groomName.trim(),
        brideName: brideName.trim(),
        weddingSlug: weddingSlug.trim(),
        groomFatherName: groomFatherName.trim() || null,
        groomMotherName: groomMotherName.trim() || null,
        brideFatherName: brideFatherName.trim() || null,
        brideMotherName: brideMotherName.trim() || null,
      });

      toast({
        title: "Profil Berhasil Diperbarui",
        description: "Data pengantin, nama orang tua, dan slug acara telah disimpan.",
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
            <CardTitle className="text-lg font-sans flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Detail Mempelai & Orang Tua Pengantin
            </CardTitle>
            <CardDescription className="text-xs">
              Informasi identitas pengantin, nama orang tua kandung, dan URL slug workspace.
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
      <CardContent className="space-y-6">
        {/* GROOM SECTION */}
        <div className="space-y-3 p-3 rounded-lg border border-border/70 bg-card/40">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
            1. Pihak Pengantin Pria (Groom)
          </h4>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Nama Pengantin Pria</label>
              {editing ? (
                <Input
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  disabled={loading}
                  placeholder="Nama Pengantin Pria"
                  className="h-9 text-xs"
                />
              ) : (
                <p className="font-bold text-sm text-foreground">{groomName || "Belum diisi"}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nama Ayah Pria</label>
              {editing ? (
                <Input
                  value={groomFatherName}
                  onChange={(e) => setGroomFatherName(e.target.value)}
                  disabled={loading}
                  placeholder="e.g. Bpk. H. Ahmad Subagyo"
                  className="h-9 text-xs"
                />
              ) : (
                <p className="text-xs text-foreground font-medium">{groomFatherName || "-"}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nama Ibu Pria</label>
              {editing ? (
                <Input
                  value={groomMotherName}
                  onChange={(e) => setGroomMotherName(e.target.value)}
                  disabled={loading}
                  placeholder="e.g. Ibu Hj. Endang Rahayu"
                  className="h-9 text-xs"
                />
              ) : (
                <p className="text-xs text-foreground font-medium">{groomMotherName || "-"}</p>
              )}
            </div>
          </div>
        </div>

        {/* BRIDE SECTION */}
        <div className="space-y-3 p-3 rounded-lg border border-border/70 bg-card/40">
          <h4 className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
            2. Pihak Pengantin Wanita (Bride)
          </h4>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Nama Pengantin Wanita</label>
              {editing ? (
                <Input
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  disabled={loading}
                  placeholder="Nama Pengantin Wanita"
                  className="h-9 text-xs"
                />
              ) : (
                <p className="font-bold text-sm text-foreground">{brideName || "Belum diisi"}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nama Ayah Wanita</label>
              {editing ? (
                <Input
                  value={brideFatherName}
                  onChange={(e) => setBrideFatherName(e.target.value)}
                  disabled={loading}
                  placeholder="e.g. Bpk. Drs. Bambang Suryono"
                  className="h-9 text-xs"
                />
              ) : (
                <p className="text-xs text-foreground font-medium">{brideFatherName || "-"}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nama Ibu Wanita</label>
              {editing ? (
                <Input
                  value={brideMotherName}
                  onChange={(e) => setBrideMotherName(e.target.value)}
                  disabled={loading}
                  placeholder="e.g. Ibu Hj. Siti Nurjanah"
                  className="h-9 text-xs"
                />
              ) : (
                <p className="text-xs text-foreground font-medium">{brideMotherName || "-"}</p>
              )}
            </div>
          </div>
        </div>

        {/* SLUG SECTION */}
        <div className="space-y-1.5 pt-2 border-t border-border">
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
