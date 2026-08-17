"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PREWEDDING_CHECKLIST_PRESETS, PREWEDDING_SESERAHAN_PRESETS } from "@/types/presets.types";
import { useToast } from "@/components/ui/use-toast";
import { CheckSquare, Square, Plus, Trash2, RotateCcw, FileText, Gift, Heart, AlertTriangle, ExternalLink, ShoppingCart, DollarSign, PackageCheck } from "lucide-react";

export interface ChecklistItem {
  id: string;
  category: "kua" | "seserahan" | "lamaran" | "emergency";
  box_name?: string; // e.g. "Kotak 1: Set Perlengkapan Ibadah"
  item_name: string;
  price?: number;
  purchase_url?: string;
  notes?: string;
  is_completed: boolean;
}

// Helper to sort uncompleted items first to the top, completed to the bottom
function sortChecklistItems<T extends { is_completed: boolean }>(itemsList: T[]): T[] {
  return [...itemsList].sort((a, b) => {
    if (a.is_completed === b.is_completed) return 0;
    return a.is_completed ? 1 : -1;
  });
}

export function PreweddingChecklistManager({ weddingId }: { weddingId: string }) {
  const storageKey = `nikahyuk_checklist_${weddingId}`;
  const { toast } = useToast();

  const [items, setItems] = React.useState<ChecklistItem[]>([]);
  const [newItemName, setNewItemName] = React.useState("");
  const [newItemNotes, setNewItemNotes] = React.useState("");
  const [newItemPrice, setNewItemPrice] = React.useState<string>("");
  const [newItemUrl, setNewItemUrl] = React.useState("");
  const [selectedBoxName, setSelectedBoxName] = React.useState("Kotak 1: Set Perlengkapan Ibadah");

  const [activeCategory, setActiveCategory] = React.useState<"kua" | "seserahan" | "lamaran" | "emergency">("kua");

  const loadDefaultPresets = React.useCallback(() => {
    const generalPresets = PREWEDDING_CHECKLIST_PRESETS || [];
    const seserahanPresets = PREWEDDING_SESERAHAN_PRESETS || [];

    const defaultItems: ChecklistItem[] = [
      ...generalPresets.map((p, idx) => ({
        id: `gen_${idx}_${Date.now()}`,
        category: p.category,
        item_name: p.item_name,
        notes: p.notes,
        is_completed: false,
      })),
      ...seserahanPresets.map((s, idx) => ({
        id: `ses_${idx}_${Date.now()}`,
        category: "seserahan" as const,
        box_name: s.box_name,
        item_name: s.item_name,
        price: s.estimated_price,
        purchase_url: s.purchase_url,
        notes: s.notes,
        is_completed: false,
      })),
    ];

    setItems(defaultItems);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(defaultItems));
    }
    toast({
      title: "Template Seeder Dimuat",
      description: "27 item checklist dokumen KUA, lamaran, & sub-item kotak seserahan telah diisi.",
      variant: "success",
    });
  }, [storageKey, toast]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        } else {
          loadDefaultPresets();
        }
      } catch {
        loadDefaultPresets();
      }
    } else {
      loadDefaultPresets();
    }
  }, [storageKey, loadDefaultPresets]);

  function saveItems(newItems: ChecklistItem[]) {
    setItems(newItems);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(newItems));
    }
  }

  function toggleItem(id: string) {
    const updated = items.map((it) =>
      it.id === id ? { ...it, is_completed: !it.is_completed } : it
    );
    saveItems(updated);
  }

  function deleteItem(id: string) {
    const updated = items.filter((it) => it.id !== id);
    saveItems(updated);
    toast({
      title: "Item Dihapus",
      description: "Item checklist berhasil dihapus.",
      variant: "warning",
    });
  }

  function addCustomItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ChecklistItem = {
      id: `custom_${Date.now()}`,
      category: activeCategory,
      box_name: activeCategory === "seserahan" ? selectedBoxName : undefined,
      item_name: newItemName.trim(),
      price: newItemPrice ? Number(newItemPrice) : undefined,
      purchase_url: newItemUrl.trim() || undefined,
      notes: newItemNotes.trim() || undefined,
      is_completed: false,
    };

    saveItems([...items, newItem]);
    setNewItemName("");
    setNewItemNotes("");
    setNewItemPrice("");
    setNewItemUrl("");

    toast({
      title: "Item Ditambahkan",
      description: `Item '${newItemName}' berhasil ditambahkan ke checklist.`,
      variant: "success",
    });
  }

  // Filter items per active category & sort uncompleted first
  const categoryItems = items.filter((it) => it.category === activeCategory);
  const sortedCategoryItems = sortChecklistItems(categoryItems);
  const completedCount = categoryItems.filter((it) => it.is_completed).length;
  const totalCount = categoryItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Seserahan financial calculations
  const seserahanItems = items.filter((it) => it.category === "seserahan");
  const totalSeserahanBudget = seserahanItems.reduce((acc, it) => acc + (it.price || 0), 0);
  const totalPaidSeserahan = seserahanItems
    .filter((it) => it.is_completed)
    .reduce((acc, it) => acc + (it.price || 0), 0);
  const totalRemainingSeserahan = Math.max(0, totalSeserahanBudget - totalPaidSeserahan);

  // Group seserahan items by box_name
  const seserahanBoxesMap: Record<string, ChecklistItem[]> = {};
  seserahanItems.forEach((it) => {
    const boxKey = it.box_name || "Kotak Lainnya";
    if (!seserahanBoxesMap[boxKey]) {
      seserahanBoxesMap[boxKey] = [];
    }
    seserahanBoxesMap[boxKey].push(it);
  });

  const availableBoxNames = Array.from(
    new Set([
      "Kotak 1: Set Perlengkapan Ibadah",
      "Kotak 2: Set Skincare & Kosmetik",
      "Kotak 3: Set Perhiasan Emas",
      "Kotak 4: Set Busana & Kain Kebaya",
      "Kotak 5: Set Sepatu & Tas",
      "Kotak 6: Set Body Care & Parfum",
      "Kotak 7: Set Pakaian Dalam & Lingerie",
      "Kotak 8: Makanan Tradisional & Kue",
      "Kotak 9: Parsel Buah Segar",
      ...Object.keys(seserahanBoxesMap),
    ])
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            Checklist Persiapan Pre-Wedding, KUA & Seserahan
          </h1>
          <p className="text-sm text-muted-foreground">
            Template seeder berkas KUA, rincian produk kotak seserahan, estimasi harga & link pembelian.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadDefaultPresets} className="gap-2">
          <RotateCcw className="h-4 w-4" /> Reset Template Seeder
        </Button>
      </div>

      <Tabs value={activeCategory} onValueChange={(v: any) => setActiveCategory(v)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted/60">
          <TabsTrigger value="kua" className="py-2 text-xs gap-1.5 font-medium">
            <FileText className="h-4 w-4 text-blue-600" />
            Dokumen KUA
          </TabsTrigger>
          <TabsTrigger value="seserahan" className="py-2 text-xs gap-1.5 font-medium">
            <Gift className="h-4 w-4 text-pink-600" />
            Kotak Seserahan
          </TabsTrigger>
          <TabsTrigger value="lamaran" className="py-2 text-xs gap-1.5 font-medium">
            <Heart className="h-4 w-4 text-amber-600" />
            Acara Lamaran
          </TabsTrigger>
          <TabsTrigger value="emergency" className="py-2 text-xs gap-1.5 font-medium">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            Emergency H-Day
          </TabsTrigger>
        </TabsList>

        {/* SESERAHAN TAB SPECIAL HIERARCHICAL VIEW */}
        {activeCategory === "seserahan" ? (
          <div className="space-y-6">
            {/* Finanical Overview Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-border/70">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Total Estimasi Biaya Seserahan
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-mono">
                    Rp {totalSeserahanBudget.toLocaleString("id-ID")}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {seserahanItems.length} item dari {Object.keys(seserahanBoxesMap).length} Kotak Hantaran
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/70">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Terbeli / Terpenuhi
                  </CardTitle>
                  <PackageCheck className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-mono text-emerald-600">
                    Rp {totalPaidSeserahan.toLocaleString("id-ID")}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {seserahanItems.filter((i) => i.is_completed).length} item sudah dibeli
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/70">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Sisa Belum Dibeli
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-mono text-amber-600">
                    Rp {totalRemainingSeserahan.toLocaleString("id-ID")}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Item dalam antrean pembelian
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Form Tambah Item Seserahan Baru */}
            <Card className="border-border/80 p-4">
              <h3 className="text-sm font-semibold mb-2">➕ Tambah Sub-Item Ke Kotak Seserahan</h3>
              <form onSubmit={addCustomItem} className="grid gap-3 sm:grid-cols-4">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Pilih Kotak Seserahan
                  </label>
                  <select
                    value={selectedBoxName}
                    onChange={(e) => setSelectedBoxName(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                  >
                    {availableBoxNames.map((bName) => (
                      <option key={bName} value={bName}>
                        {bName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Nama Produk / Barang
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Mukena Silk Premium"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Estimasi Harga (Rp)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 450000"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Link Online (Shopee/Tokopedia)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://shopee.co.id/..."
                      value={newItemUrl}
                      onChange={(e) => setNewItemUrl(e.target.value)}
                      className="h-9 text-xs flex-1"
                    />
                    <Button type="submit" size="sm" className="h-9 px-3 shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </Card>

            {/* List Kotak Seserahan Groups */}
            <div className="space-y-4">
              {Object.keys(seserahanBoxesMap).length === 0 ? (
                <Card className="p-8 text-center border border-dashed text-xs text-muted-foreground">
                  Belum ada kotak seserahan. Klik &apos;Reset Template Seeder&apos; di atas.
                </Card>
              ) : (
                Object.entries(seserahanBoxesMap).map(([boxTitle, boxSubItems]) => {
                  const boxTotal = boxSubItems.reduce((acc, i) => acc + (i.price || 0), 0);
                  const boxCompleted = boxSubItems.filter((i) => i.is_completed).length;
                  const sortedBoxSubItems = sortChecklistItems(boxSubItems);

                  return (
                    <Card key={boxTitle} className="border-border/80">
                      <CardHeader className="pb-3 bg-muted/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <Gift className="h-5 w-5 text-pink-600 shrink-0" />
                            <CardTitle className="text-base font-semibold">
                              {boxTitle}
                            </CardTitle>
                            <Badge variant="outline" className="text-[10px]">
                              {boxCompleted}/{boxSubItems.length} Produk Dibeli
                            </Badge>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-muted-foreground">Total Biaya Kotak Ini: </span>
                            <span className="font-mono font-bold text-sm text-foreground">
                              Rp {boxTotal.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-3 space-y-2">
                        {sortedBoxSubItems.map((subItem) => (
                          <div
                            key={subItem.id}
                            className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                              subItem.is_completed
                                ? "bg-accent/20 border-border/50 text-muted-foreground line-through opacity-75"
                                : "bg-card border-border text-foreground hover:border-primary/50"
                            }`}
                          >
                            <div
                              className="flex items-start space-x-3 cursor-pointer flex-1"
                              onClick={() => toggleItem(subItem.id)}
                            >
                              {subItem.is_completed ? (
                                <CheckSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                              ) : (
                                <Square className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                              )}
                              <div>
                                <p className="font-semibold text-xs leading-snug">{subItem.item_name}</p>
                                {subItem.notes && (
                                  <p className="text-[11px] text-muted-foreground no-underline font-normal mt-0.5">
                                    Catatan: {subItem.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 no-underline self-end sm:self-center">
                              {subItem.price && (
                                <span className="font-mono font-semibold text-xs text-foreground bg-muted px-2 py-1 rounded">
                                  Rp {subItem.price.toLocaleString("id-ID")}
                                </span>
                              )}

                              {subItem.purchase_url && (
                                <a
                                  href={subItem.purchase_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  Link Beli
                                </a>
                              )}

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteItem(subItem.id)}
                                className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* STANDARD VIEW FOR KUA, LAMARAN, & EMERGENCY */
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-serif">
                    {activeCategory === "kua" && "📄 Berkas & Syarat Dokumen Administrasi KUA"}
                    {activeCategory === "lamaran" && "💍 Checklist Acara Lamaran & Tunangan"}
                    {activeCategory === "emergency" && "🛍️ Emergency Kit & Perlengkapan HARI-H"}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Progres: {completedCount} dari {totalCount} item selesai ({progressPercent}%)
                  </CardDescription>
                </div>
                <Badge variant={progressPercent === 100 ? "default" : "secondary"} className="font-mono text-xs">
                  {progressPercent}% Selesai
                </Badge>
              </div>

              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <form onSubmit={addCustomItem} className="grid gap-2 sm:grid-cols-3 pt-2">
                <Input
                  type="text"
                  placeholder="Tambah item checklist baru..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="sm:col-span-2 text-xs h-9"
                  required
                />
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Catatan opsional..."
                    value={newItemNotes}
                    onChange={(e) => setNewItemNotes(e.target.value)}
                    className="text-xs h-9 flex-1"
                  />
                  <Button type="submit" size="sm" className="h-9 px-3 gap-1 shrink-0">
                    <Plus className="h-4 w-4" /> Tambah
                  </Button>
                </div>
              </form>

              <div className="space-y-2 pt-2">
                {sortedCategoryItems.length === 0 ? (
                  <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground text-xs">
                    Belum ada item di kategori ini. Klik &apos;Reset Template Seeder&apos; di atas.
                  </div>
                ) : (
                  sortedCategoryItems.map((it) => (
                    <div
                      key={it.id}
                      className={`p-3 rounded-lg border flex items-start justify-between gap-3 transition-all ${
                        it.is_completed
                          ? "bg-accent/20 border-border/50 text-muted-foreground line-through opacity-75"
                          : "bg-card border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      <div
                        className="flex items-start space-x-3 cursor-pointer flex-1"
                        onClick={() => toggleItem(it.id)}
                      >
                        {it.is_completed ? (
                          <CheckSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <Square className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-semibold text-xs leading-snug">{it.item_name}</p>
                          {it.notes && (
                            <p className="text-[11px] text-muted-foreground no-underline font-normal mt-0.5">
                              {it.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteItem(it.id)}
                        className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </Tabs>
    </div>
  );
}
