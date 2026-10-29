"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaUploaderDropzone, UploadedFileMeta } from "@/components/shared/media-uploader/dropzone";
import { ConfirmDeleteDialog } from "@/components/shared/modal/confirm-delete-dialog";
import {
  saveColorPaletteAction,
  createMoodboardItemAction,
  deleteMoodboardItemAction,
  ColorSwatchItem,
} from "@/actions/moodboard-actions";
import { useToast } from "@/components/ui/use-toast";
import {
  Palette,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Check,
  Copy,
  Image as ImageIcon,
  Sliders,
  FolderHeart,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface MoodboardItemData {
  id: string;
  category: "decor" | "attire" | "makeup" | "photo" | "stationery" | "other";
  title: string;
  notes?: string | null;
  r2_file_key: string;
  public_url: string;
  source_url?: string | null;
  vendor_name?: string | null;
  created_at: string;
}

export interface MoodboardManagerProps {
  weddingId: string;
  initialPalette: {
    paletteName: string;
    colors: ColorSwatchItem[];
  };
  initialItems: MoodboardItemData[];
}

const CATEGORY_TABS = [
  { key: "all", label: "Semua Inspirasi" },
  { key: "decor", label: "🌸 Dekorasi & Bunga" },
  { key: "attire", label: "👗 Busana & Kain" },
  { key: "makeup", label: "💄 MUA & Hairdo" },
  { key: "photo", label: "📸 Mood Foto & Video" },
  { key: "stationery", label: "💌 Undangan & Souvenir" },
  { key: "other", label: "✨ Detail Lainnya" },
] as const;

const CURATED_PRESETS: { name: string; colors: ColorSwatchItem[] }[] = [
  {
    name: "Sage & Champagne (Botanical Elegance)",
    colors: [
      { hex: "#9CAF88", name: "Sage Green" },
      { hex: "#D4AF37", name: "Champagne Gold" },
      { hex: "#FDFBF7", name: "Warm Ivory" },
      { hex: "#E3DAC9", name: "Pearl White" },
      { hex: "#5C6B50", name: "Olive Tint" },
    ],
  },
  {
    name: "Terracotta & Blush (Warm Earthy)",
    colors: [
      { hex: "#C86D51", name: "Terracotta" },
      { hex: "#E8B4A2", name: "Dusty Blush" },
      { hex: "#FAF3EE", name: "Creamy Linen" },
      { hex: "#9E5338", name: "Burnt Sienna" },
      { hex: "#D9A05B", name: "Warm Ocre" },
    ],
  },
  {
    name: "Classic Monochrome & Gold (Royal Luxe)",
    colors: [
      { hex: "#1A1A1A", name: "Midnight Noir" },
      { hex: "#C5A059", name: "Luxe Gold" },
      { hex: "#FFFFFF", name: "Pure White" },
      { hex: "#7A7A7A", name: "Slate Grey" },
      { hex: "#ECE4D8", name: "Warm Alabaster" },
    ],
  },
  {
    name: "Dusty Blue & Silver (Cool Serenity)",
    colors: [
      { hex: "#8DA4B4", name: "Dusty Blue" },
      { hex: "#B8C5CE", name: "Soft Sky" },
      { hex: "#F4F6F8", name: "Frost White" },
      { hex: "#A8B2B8", name: "Silver Leaf" },
      { hex: "#4C6272", name: "Deep Slate" },
    ],
  },
];

export function MoodboardManager({
  weddingId,
  initialPalette,
  initialItems,
}: MoodboardManagerProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Color Palette states
  const [paletteName, setPaletteName] = React.useState(
    initialPalette.paletteName || "Tema Warna Utama"
  );
  const [colors, setColors] = React.useState<ColorSwatchItem[]>(
    initialPalette.colors && initialPalette.colors.length > 0
      ? initialPalette.colors
      : [
          { hex: "#9CAF88", name: "Sage Green" },
          { hex: "#D4AF37", name: "Champagne Gold" },
          { hex: "#FDFBF7", name: "Warm Ivory" },
          { hex: "#E8B4A2", name: "Dusty Blush" },
          { hex: "#3A3A3A", name: "Charcoal" },
        ]
  );
  const [editingPalette, setEditingPalette] = React.useState(false);
  const [savingPalette, setSavingPalette] = React.useState(false);
  const [copiedHex, setCopiedHex] = React.useState<string | null>(null);

  // Gallery Items state
  const [items, setItems] = React.useState<MoodboardItemData[]>(initialItems);
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [isPresentMode, setIsPresentMode] = React.useState(false);

  // Add Item Modal state
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [newItemTitle, setNewItemTitle] = React.useState("");
  const [newItemCategory, setNewItemCategory] = React.useState<
    "decor" | "attire" | "makeup" | "photo" | "stationery" | "other"
  >("decor");
  const [newItemNotes, setNewItemNotes] = React.useState("");
  const [newItemSourceUrl, setNewItemSourceUrl] = React.useState("");
  const [newItemVendorName, setNewItemVendorName] = React.useState("");
  const [uploadedMeta, setUploadedMeta] = React.useState<UploadedFileMeta | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = React.useState<{
    id: string;
    r2Key: string;
    title: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // Copy Color HEX Helper
  function handleCopyHex(hex: string) {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      toast({
        title: `Kode Warna ${hex} Disalin`,
        description: "Gunakan kode warna ini untuk seragam keluarga atau vendor.",
        variant: "success",
      });
      setTimeout(() => setCopiedHex(null), 2000);
    }
  }

  // Save Palette to Database
  async function handleSavePalette() {
    setSavingPalette(true);
    try {
      await saveColorPaletteAction({
        weddingId,
        paletteName,
        colors,
      });

      toast({
        title: "Palet Warna Tersimpan",
        description: "Identitas warna tema pernikahan berhasil diperbarui.",
        variant: "success",
      });

      setEditingPalette(false);
      router.refresh();
    } catch (err) {
      toast({
        title: "Gagal Menyimpan Palet",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setSavingPalette(false);
    }
  }

  function handleApplyPreset(preset: (typeof CURATED_PRESETS)[0]) {
    setPaletteName(preset.name);
    setColors(preset.colors);
    toast({
      title: "Preset Diterapkan",
      description: `Palet '${preset.name}' dipilih. Klik 'Simpan Palet' untuk menyimpan permanen.`,
    });
  }

  // Submit New Moodboard Item
  async function handleCreateItem(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadedMeta) {
      toast({
        title: "Unggah Foto Terlebih Dahulu",
        description: "Pilih foto inspirasi untuk disimpan ke moodboard.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const created = await createMoodboardItemAction({
        weddingId,
        category: newItemCategory,
        title: newItemTitle,
        notes: newItemNotes || null,
        r2FileKey: uploadedMeta.r2_file_key,
        fileSizeBytes: uploadedMeta.file_size_bytes,
        mimeType: uploadedMeta.mime_type,
        sourceUrl: newItemSourceUrl || null,
        vendorName: newItemVendorName || null,
      });

      const newItemData: MoodboardItemData = {
        id: created.id,
        category: created.category as any,
        title: created.title,
        notes: created.notes,
        r2_file_key: created.r2_file_key,
        public_url: uploadedMeta.public_url || "",
        source_url: created.source_url,
        vendor_name: created.vendor_name,
        created_at: created.created_at,
      };

      setItems((prev) => [newItemData, ...prev]);

      toast({
        title: "Inspirasi Ditambahkan",
        description: `'${newItemTitle}' berhasil disimpan ke moodboard.`,
        variant: "success",
      });

      setAddModalOpen(false);
      setNewItemTitle("");
      setNewItemNotes("");
      setNewItemSourceUrl("");
      setNewItemVendorName("");
      setUploadedMeta(null);
      router.refresh();
    } catch (err) {
      toast({
        title: "Gagal Menambahkan Inspirasi",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Confirm Delete
  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      await deleteMoodboardItemAction(
        deleteTarget.id,
        deleteTarget.r2Key,
        weddingId
      );

      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));

      toast({
        title: "Inspirasi Dihapus",
        description: `'${deleteTarget.title}' telah dibersihkan dari moodboard.`,
        variant: "success",
      });

      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      toast({
        title: "Gagal Menghapus Item",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  }

  const filteredItems = items.filter((it) => {
    if (activeCategory === "all") return true;
    return it.category === activeCategory;
  });

  return (
    <div className="space-y-6">
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Inspirasi dari Moodboard?"
        description={`Apakah Anda yakin ingin menghapus '${deleteTarget?.title}'? Berkas gambar terkait di Cloudflare R2 akan dibersihkan.`}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />

      {/* TOP HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Palette className="h-6 w-6 text-[#ff385c]" />
            Konsep Visual & Moodboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Kurasi palet warna tema, mood dekorasi, dan referensi busana pernikahan impian Anda.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPresentMode((prev) => !prev)}
            className="rounded-full h-9 px-4 text-xs font-semibold gap-1.5 shadow-xs"
          >
            {isPresentMode ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" /> Keluar Mode Presentasi
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" /> Mode Presentasi Vendor
              </>
            )}
          </Button>

          <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="rounded-full h-9 px-5 bg-[#ff385c] hover:bg-[#e00b41] text-white font-semibold text-xs gap-1.5 shadow-xs"
              >
                <Plus className="h-4 w-4" /> Tambah Inspirasi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-3xl">
              <form onSubmit={handleCreateItem}>
                <DialogHeader>
                  <DialogTitle className="font-sans text-xl font-bold">
                    Tambah Foto Inspirasi Baru
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Unggah referensi foto asli dekorasi, gaun, makeup, atau souvenir Anda.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3.5 py-4">
                  {/* Dynamic Storage Uploader with R2 & Crop integration */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground block">
                      Foto Inspirasi (Disimpan di Cloudflare R2)
                    </label>
                    <MediaUploaderDropzone
                      weddingId={weddingId}
                      folder="moodboard"
                      allowedMimeTypes={["image/jpeg", "image/png", "image/webp"]}
                      onUploadSuccess={(meta) => setUploadedMeta(meta)}
                      onUploadError={(err) =>
                        toast({
                          title: "Gagal Mengunggah",
                          description: err,
                          variant: "destructive",
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Judul Inspirasi
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Backdrop Pelaminan Minimalis Lengkung"
                      value={newItemTitle}
                      onChange={(e) => setNewItemTitle(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">
                        Kategori Inspirasi
                      </label>
                      <select
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value as any)}
                        className="w-full h-9 text-xs rounded-md border border-input bg-background px-3 py-1 text-foreground shadow-xs"
                      >
                        <option value="decor">🌸 Dekorasi & Bunga</option>
                        <option value="attire">👗 Busana & Kain</option>
                        <option value="makeup">💄 MUA & Hairdo</option>
                        <option value="photo">📸 Mood Foto & Video</option>
                        <option value="stationery">💌 Undangan & Souvenir</option>
                        <option value="other">✨ Detail Lainnya</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">
                        Vendor Terkait (Opsional)
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Ratu Décor / Khadijah MUA"
                        value={newItemVendorName}
                        onChange={(e) => setNewItemVendorName(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Catatan Detail & Preferensi
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Dominan bunga mawar putih dan pampas grass"
                      value={newItemNotes}
                      onChange={(e) => setNewItemNotes(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Tautan Referensi (Pinterest / Instagram)
                    </label>
                    <Input
                      type="url"
                      placeholder="https://pin.it/... atau https://instagram.com/..."
                      value={newItemSourceUrl}
                      onChange={(e) => setNewItemSourceUrl(e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddModalOpen(false)}
                    className="rounded-full text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !uploadedMeta}
                    className="rounded-full bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-semibold"
                  >
                    {submitting ? "Menyimpan..." : "Simpan Inspirasi"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* SECTION 1: WEDDING COLOR PALETTES SWATCHES */}
      <Card className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Palet Warna Tema Acara
              </span>
              <Badge variant="outline" className="rounded-full text-[10px] px-2 py-0 border-primary/30 text-primary">
                5 Warna Harmonis
              </Badge>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-sans text-foreground mt-0.5">
              {paletteName}
            </h2>
          </div>

          {!isPresentMode && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingPalette((prev) => !prev)}
                className="rounded-full h-8 px-3 text-xs gap-1 font-semibold"
              >
                <Sliders className="h-3.5 w-3.5" />
                {editingPalette ? "Tutup Editor" : "Ubah Palet"}
              </Button>
            </div>
          )}
        </div>

        {/* SWATCHES DISPLAY */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-5">
          {colors.map((c, index) => (
            <div
              key={index}
              onClick={() => handleCopyHex(c.hex)}
              className="group cursor-pointer p-3 rounded-2xl border border-border/70 bg-card hover:border-foreground/30 hover:shadow-xs transition-all space-y-2.5"
            >
              <div
                className="w-full h-16 sm:h-20 rounded-xl border border-black/10 relative flex items-center justify-center transition-transform group-hover:scale-[1.02]"
                style={{ backgroundColor: c.hex }}
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-black/40 text-white backdrop-blur-xs">
                  {copiedHex === c.hex ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </span>
              </div>

              <div>
                <span className="font-mono text-xs font-bold text-foreground block uppercase">
                  {c.hex}
                </span>
                <span className="text-[11px] text-muted-foreground block truncate">
                  {c.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* EDIT PALETTE FORM & PRESETS */}
        {editingPalette && !isPresentMode && (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl border border-border/80 bg-muted/20 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Nama Tema Palet</label>
              <Input
                type="text"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                className="h-8 text-xs max-w-sm bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">
                Sesuaikan 5 Warna Hex & Label
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {colors.map((c, idx) => (
                  <div key={idx} className="space-y-1 p-2 rounded-xl bg-background border border-border/60">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={c.hex}
                        onChange={(e) => {
                          const updated = [...colors];
                          updated[idx].hex = e.target.value.toUpperCase();
                          setColors(updated);
                        }}
                        className="h-7 w-7 rounded cursor-pointer border-0 p-0"
                      />
                      <Input
                        type="text"
                        value={c.hex}
                        onChange={(e) => {
                          const updated = [...colors];
                          updated[idx].hex = e.target.value;
                          setColors(updated);
                        }}
                        className="h-7 text-[11px] font-mono uppercase px-2"
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="Nama warna"
                      value={c.name}
                      onChange={(e) => {
                        const updated = [...colors];
                        updated[idx].name = e.target.value;
                        setColors(updated);
                      }}
                      className="h-7 text-[11px] px-2"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-muted-foreground font-medium">
                  Pilih Preset Cepat:
                </span>
                {CURATED_PRESETS.map((p) => (
                  <Button
                    key={p.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyPreset(p)}
                    className="h-7 text-[10px] rounded-full px-2.5"
                  >
                    {p.name.split(" ")[0]}
                  </Button>
                ))}
              </div>

              <Button
                onClick={handleSavePalette}
                disabled={savingPalette}
                className="rounded-full h-8 px-4 text-xs font-semibold bg-[#ff385c] hover:bg-[#e00b41] text-white shadow-xs"
              >
                {savingPalette ? "Menyimpan..." : "Simpan Palet"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* SECTION 2: AIRBNB PILL CATEGORY FILTER */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              activeCategory === tab.key
                ? "bg-foreground text-background border-transparent shadow-xs"
                : "bg-muted/40 text-muted-foreground border-border/70 hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 3: MASONRY / RESPONSIVE GRID GALLERY */}
      {filteredItems.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2 border-border/80 p-10 text-center space-y-3 bg-muted/10">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-sans font-bold text-base text-foreground">
              Belum Ada Foto Inspirasi
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Simpan referensi foto dekorasi, gaun pengantin, atau makeup impian Anda untuk mempermudah briefing ke vendor.
            </p>
          </div>
          {!isPresentMode && (
            <Button
              onClick={() => setAddModalOpen(true)}
              className="rounded-full h-9 px-5 bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Unggah Inspirasi Pertama
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredItems.map((it) => (
            <Card
              key={it.id}
              className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-4/3 w-full bg-muted overflow-hidden">
                  <img
                    src={it.public_url}
                    alt={it.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="rounded-full text-[10px] font-semibold bg-background/90 text-foreground backdrop-blur-xs border border-border/60 shadow-xs">
                      {CATEGORY_TABS.find((c) => c.key === it.category)?.label || "Inspirasi"}
                    </Badge>
                  </div>

                  {!isPresentMode && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() =>
                          setDeleteTarget({
                            id: it.id,
                            r2Key: it.r2_file_key,
                            title: it.title,
                          })
                        }
                        className="h-8 w-8 rounded-full shadow-md cursor-pointer"
                        title="Hapus Inspirasi"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-5 space-y-2">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-foreground leading-snug">
                    {it.title}
                  </h3>

                  {it.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {it.notes}
                    </p>
                  )}

                  {it.vendor_name && (
                    <div className="pt-1">
                      <span className="text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full inline-block">
                        Vendor: {it.vendor_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {it.source_url && (
                <div className="px-4 sm:px-5 pb-4 pt-0 border-t border-border/50 flex items-center justify-between mt-auto">
                  <a
                    href={it.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors mt-2"
                  >
                    Lihat Sumber Asli <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
