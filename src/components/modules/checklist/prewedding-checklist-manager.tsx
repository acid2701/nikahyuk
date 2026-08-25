"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  PREWEDDING_CHECKLIST_PRESETS,
  PREWEDDING_SESERAHAN_PRESETS,
  LAMARAN_CHECKLIST_PRESETS,
  AKAD_CHECKLIST_PRESETS,
  RESEPSI_CHECKLIST_PRESETS,
} from "@/types/presets.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  fetchChecklistItemsAction,
  addChecklistItemAction,
  toggleChecklistItemAction,
  deleteChecklistItemAction,
} from "@/actions/checklist-actions";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  RotateCcw,
  FileText,
  Gift,
  Heart,
  AlertTriangle,
  ExternalLink,
  Layers,
  Download,
  Sparkles,
  Printer,
  Calendar,
  User,
  MessageSquareQuote,
  CheckCircle2,
  X,
  Settings2,
  Eye,
  EyeOff,
} from "lucide-react";


export interface ChecklistItem {
  id: string;
  wedding_id?: string;
  event_id?: string;
  category: "kua" | "seserahan" | "lamaran" | "emergency";
  box_name?: string | null;
  item_name: string;
  price?: number | null;
  purchase_url?: string | null;
  notes?: string | null;
  completed_notes?: string | null;
  completed_by?: string | null;
  completed_at?: string | null;
  due_date?: string | null;
  assignee_name?: string | null;
  is_completed: boolean;
}

export interface PreweddingChecklistManagerProps {
  weddingId: string;
  eventId?: string;
  eventName?: string;
}

// Helper to sort uncompleted items first to the top, completed to the bottom
function sortChecklistItems<T extends { is_completed: boolean }>(itemsList: T[]): T[] {
  return [...itemsList].sort((a, b) => {
    if (a.is_completed === b.is_completed) return 0;
    return a.is_completed ? 1 : -1;
  });
}

export function PreweddingChecklistManager({
  weddingId,
  eventId = "all",
  eventName = "Semua Acara (Akumulasi Total)",
}: PreweddingChecklistManagerProps) {
  const storageKey = `nikahyuk_checklist_${weddingId}_${eventId}`;
  const { toast } = useToast();

  const [items, setItems] = React.useState<ChecklistItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Form states
  const [newItemName, setNewItemName] = React.useState("");
  const [newItemNotes, setNewItemNotes] = React.useState("");
  const [newItemPrice, setNewItemPrice] = React.useState<string>("");
  const [newItemUrl, setNewItemUrl] = React.useState("");
  const [newItemDueDate, setNewItemDueDate] = React.useState("");
  const [newItemAssignee, setNewItemAssignee] = React.useState("");
  const [selectedBoxName, setSelectedBoxName] = React.useState("Kotak 1: Set Perlengkapan Ibadah");

  // Modals
  const [importModalOpen, setImportModalOpen] = React.useState(false);
  const [completionModalOpen, setCompletionModalOpen] = React.useState(false);
  const [targetItemForCompletion, setTargetItemForCompletion] = React.useState<ChecklistItem | null>(null);
  const [completionNoteInput, setCompletionNoteInput] = React.useState("");

  const [activeCategory, setActiveCategory] = React.useState<"kua" | "seserahan" | "lamaran" | "emergency">("kua");

  const hiddenTabsStorageKey = `nikahyuk_checklist_hidden_tabs_${weddingId}_${eventId}`;
  const [hiddenCategories, setHiddenCategories] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const savedHidden = localStorage.getItem(hiddenTabsStorageKey);
    if (savedHidden) {
      try {
        const parsed = JSON.parse(savedHidden);
        if (Array.isArray(parsed)) {
          setHiddenCategories(parsed);
        }
      } catch {
        // fallback
      }
    }
  }, [hiddenTabsStorageKey]);

  function saveHiddenCategories(newHidden: string[]) {
    setHiddenCategories(newHidden);
    if (typeof window !== "undefined") {
      localStorage.setItem(hiddenTabsStorageKey, JSON.stringify(newHidden));
    }
  }

  function hideCategory(categoryKey: string) {
    if (hiddenCategories.includes(categoryKey)) return;
    const updated = [...hiddenCategories, categoryKey];
    saveHiddenCategories(updated);

    const allCategories = ["kua", "seserahan", "lamaran", "emergency"];
    const remaining = allCategories.filter((c) => !updated.includes(c));
    if (activeCategory === categoryKey && remaining.length > 0) {
      setActiveCategory(remaining[0] as any);
    }

    toast({
      title: "Tab Disembunyikan",
      description: "Tab kategori disembunyikan. Tampilkan kembali kapan saja via tombol '⚙️ Kelola Tab'.",
      variant: "warning",
    });
  }

  function toggleCategoryVisibility(categoryKey: string) {
    if (hiddenCategories.includes(categoryKey)) {
      const updated = hiddenCategories.filter((c) => c !== categoryKey);
      saveHiddenCategories(updated);
      toast({
        title: "Tab Ditampilkan Kembali",
        description: "Tab kategori telah dibuka kembali.",
        variant: "success",
      });
    } else {
      hideCategory(categoryKey);
    }
  }

  function showAllCategories() {
    saveHiddenCategories([]);
    toast({
      title: "Seluruh Tab Ditampilkan",
      description: "Semua 4 kategori tab checklist telah dibuka kembali.",
      variant: "success",
    });
  }


  // Initial Load from Supabase DB with LocalStorage Fallback
  const loadChecklistItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const dbItems = await fetchChecklistItemsAction(weddingId, eventId);
      if (dbItems && dbItems.length > 0) {
        setItems(dbItems as ChecklistItem[]);
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify(dbItems));
        }
      } else {
        // Fallback to local storage or load default seeder
        if (typeof window !== "undefined") {
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
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, [weddingId, eventId, storageKey]);

  const loadDefaultPresets = React.useCallback(() => {
    const lowerName = eventName.toLowerCase();
    let defaultItems: ChecklistItem[] = [];

    if (lowerName.includes("lamaran") || lowerName.includes("tunangan")) {
      defaultItems = (LAMARAN_CHECKLIST_PRESETS || []).map((p, idx) => ({
        id: `lam_${idx}_${Date.now()}`,
        wedding_id: weddingId,
        event_id: eventId,
        category: p.category,
        box_name: (p as any).box_name || null,
        item_name: p.item_name,
        price: (p as any).estimated_price || null,
        notes: p.notes || null,
        is_completed: false,
      }));
    } else if (lowerName.includes("akad")) {
      defaultItems = (AKAD_CHECKLIST_PRESETS || []).map((p, idx) => ({
        id: `akd_${idx}_${Date.now()}`,
        wedding_id: weddingId,
        event_id: eventId,
        category: p.category,
        item_name: p.item_name,
        notes: p.notes || null,
        is_completed: false,
      }));
    } else if (lowerName.includes("resepsi")) {
      defaultItems = (RESEPSI_CHECKLIST_PRESETS || []).map((p, idx) => ({
        id: `rsp_${idx}_${Date.now()}`,
        wedding_id: weddingId,
        event_id: eventId,
        category: p.category,
        item_name: p.item_name,
        notes: p.notes || null,
        is_completed: false,
      }));
    } else {
      const generalPresets = PREWEDDING_CHECKLIST_PRESETS || [];
      const seserahanPresets = PREWEDDING_SESERAHAN_PRESETS || [];

      defaultItems = [
        ...generalPresets.map((p, idx) => ({
          id: `gen_${idx}_${Date.now()}`,
          wedding_id: weddingId,
          event_id: eventId,
          category: p.category,
          item_name: p.item_name,
          notes: p.notes || null,
          is_completed: false,
        })),
        ...seserahanPresets.map((s, idx) => ({
          id: `ses_${idx}_${Date.now()}`,
          wedding_id: weddingId,
          event_id: eventId,
          category: "seserahan" as const,
          box_name: s.box_name,
          item_name: s.item_name,
          price: s.estimated_price || null,
          purchase_url: s.purchase_url || null,
          notes: s.notes || null,
          is_completed: false,
        })),
      ];
    }

    setItems(defaultItems);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(defaultItems));
    }
    toast({
      title: "Template Seeder Dimuat",
      description: `Checklist persiapan khusus untuk '${eventName}' (${defaultItems.length} item) telah diisi.`,
      variant: "success",
    });
  }, [weddingId, eventId, storageKey, eventName, toast]);

  React.useEffect(() => {
    loadChecklistItems();
  }, [loadChecklistItems]);

  function saveLocalItems(newItems: ChecklistItem[]) {
    setItems(newItems);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(newItems));
    }
  }

  // Handle Checkbox Toggle
  function handleCheckboxClick(it: ChecklistItem) {
    if (!it.is_completed) {
      // Prompt modal for completion notes
      setTargetItemForCompletion(it);
      setCompletionNoteInput(it.completed_notes || "");
      setCompletionModalOpen(true);
    } else {
      // Uncheck item directly
      setItems((prev) =>
        prev.map((i) =>
          i.id === it.id
            ? {
                ...i,
                is_completed: false,
                completed_notes: null,
                completed_by: null,
                completed_at: null,
              }
            : i
        )
      );
      toggleChecklistItemAction({
        id: it.id,
        weddingId,
        isCompleted: false,
      });
    }
  }

  // Submit Completion Note
  async function handleConfirmCompletion() {
    if (!targetItemForCompletion) return;
    const nowISO = new Date().toISOString();
    const notesText = completionNoteInput.trim() || undefined;

    setItems((prev) =>
      prev.map((i) =>
        i.id === targetItemForCompletion.id
          ? {
              ...i,
              is_completed: true,
              completed_notes: notesText || null,
              completed_by: "Pengguna",
              completed_at: nowISO,
            }
          : i
      )
    );

    setCompletionModalOpen(false);
    toast({
      title: "Item Ditandai Selesai",
      description: `Catatan pelaksanaan untuk '${targetItemForCompletion.item_name}' telah disimpan.`,
      variant: "success",
    });

    await toggleChecklistItemAction({
      id: targetItemForCompletion.id,
      weddingId,
      isCompleted: true,
      completedNotes: notesText,
    });
  }

  async function handleDeleteItem(id: string) {
    const updated = items.filter((it) => it.id !== id);
    saveLocalItems(updated);
    toast({
      title: "Item Dihapus",
      description: "Item checklist berhasil dihapus.",
      variant: "warning",
    });
    await deleteChecklistItemAction(id, weddingId);
  }

  async function handleAddCustomItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ChecklistItem = {
      id: `custom_${Date.now()}`,
      wedding_id: weddingId,
      event_id: eventId,
      category: activeCategory,
      box_name: activeCategory === "seserahan" ? selectedBoxName : null,
      item_name: newItemName.trim(),
      price: newItemPrice ? Number(newItemPrice) : null,
      purchase_url: newItemUrl.trim() || null,
      notes: newItemNotes.trim() || null,
      due_date: newItemDueDate.trim() || null,
      assignee_name: newItemAssignee.trim() || null,
      is_completed: false,
    };

    saveLocalItems([...items, newItem]);
    setNewItemName("");
    setNewItemNotes("");
    setNewItemPrice("");
    setNewItemUrl("");
    setNewItemDueDate("");
    setNewItemAssignee("");

    toast({
      title: "Item Ditambahkan",
      description: `Item '${newItem.item_name}' berhasil ditambahkan.`,
      variant: "success",
    });

    await addChecklistItemAction({
      wedding_id: weddingId,
      event_id: eventId,
      category: activeCategory,
      box_name: activeCategory === "seserahan" ? selectedBoxName : undefined,
      item_name: newItem.item_name,
      price: newItem.price || undefined,
      purchase_url: newItem.purchase_url || undefined,
      notes: newItem.notes || undefined,
      due_date: newItem.due_date || undefined,
      assignee_name: newItem.assignee_name || undefined,
    });
  }

  function importPresetTemplate(presetKey: "lamaran" | "akad" | "resepsi" | "master") {
    let presetsToImport: ChecklistItem[] = [];

    if (presetKey === "lamaran") {
      presetsToImport = (LAMARAN_CHECKLIST_PRESETS || []).map((p, idx) => ({
        id: `imp_lam_${idx}_${Date.now()}`,
        wedding_id: weddingId,
        event_id: eventId,
        category: p.category,
        box_name: (p as any).box_name || null,
        item_name: p.item_name,
        price: (p as any).estimated_price || null,
        notes: p.notes || null,
        is_completed: false,
      }));
    } else if (presetKey === "akad") {
      presetsToImport = (AKAD_CHECKLIST_PRESETS || []).map((p, idx) => ({
        id: `imp_akd_${idx}_${Date.now()}`,
        wedding_id: weddingId,
        event_id: eventId,
        category: p.category,
        item_name: p.item_name,
        notes: p.notes || null,
        is_completed: false,
      }));
    } else if (presetKey === "resepsi") {
      presetsToImport = (RESEPSI_CHECKLIST_PRESETS || []).map((p, idx) => ({
        id: `imp_rsp_${idx}_${Date.now()}`,
        wedding_id: weddingId,
        event_id: eventId,
        category: p.category,
        item_name: p.item_name,
        notes: p.notes || null,
        is_completed: false,
      }));
    } else {
      const generalPresets = PREWEDDING_CHECKLIST_PRESETS || [];
      const seserahanPresets = PREWEDDING_SESERAHAN_PRESETS || [];
      presetsToImport = [
        ...generalPresets.map((p, idx) => ({
          id: `imp_gen_${idx}_${Date.now()}`,
          wedding_id: weddingId,
          event_id: eventId,
          category: p.category,
          item_name: p.item_name,
          notes: p.notes || null,
          is_completed: false,
        })),
        ...seserahanPresets.map((s, idx) => ({
          id: `imp_ses_${idx}_${Date.now()}`,
          wedding_id: weddingId,
          event_id: eventId,
          category: "seserahan" as const,
          box_name: s.box_name,
          item_name: s.item_name,
          price: s.estimated_price || null,
          purchase_url: s.purchase_url || null,
          notes: s.notes || null,
          is_completed: false,
        })),
      ];
    }

    const updated = [...items, ...presetsToImport];
    saveLocalItems(updated);
    setImportModalOpen(false);
    toast({
      title: "Template Berhasil Diimpor",
      description: `${presetsToImport.length} item dari template telah ditambahkan ke checklist '${eventName}'.`,
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

  const dynamicEventCategoryLabel =
    eventName && eventName !== "Semua Acara (Akumulasi Total)"
      ? `Checklist Persiapan ${eventName}`
      : "Checklist Acara & Prosesi Utama";

  const dynamicTabTriggerLabel =
    eventName && eventName !== "Semua Acara (Akumulasi Total)"
      ? eventName
      : "Acara & Prosesi";

  // Per-category counts for tab triggers
  const kuaItems = items.filter((it) => it.category === "kua");
  const kuaCompleted = kuaItems.filter((it) => it.is_completed).length;

  const seserahanAllItems = items.filter((it) => it.category === "seserahan");
  const seserahanCompletedCount = seserahanAllItems.filter((it) => it.is_completed).length;

  const lamaranItems = items.filter((it) => it.category === "lamaran");
  const lamaranCompleted = lamaranItems.filter((it) => it.is_completed).length;

  const emergencyItems = items.filter((it) => it.category === "emergency");
  const emergencyCompleted = emergencyItems.filter((it) => it.is_completed).length;

  return (
    <div className="space-y-6 print:p-0 print:m-0">
      {/* COMPLETION NOTE MODAL */}
      <Dialog open={completionModalOpen} onOpenChange={setCompletionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Selesaikan Item & Tambah Catatan
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tambahkan catatan pelaksanaan untuk &apos;{targetItemForCompletion?.item_name}&apos; (misal: nomor berkas, tanggal diambil, atau nama pembeli):
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Catatan Pelaksanaan / Eksekusi (Opsional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Sudah diambil oleh Budi tgl 22 Aug, Nomor Berkas 451/KUA/2026..."
                value={completionNoteInput}
                onChange={(e) => setCompletionNoteInput(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompletionModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmCompletion}
              className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" /> Tandai Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            Checklist Persiapan {eventName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Template rincian berkas, perlengkapan, estimasi harga & link pembelian khusus acara ini.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-2 text-xs cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Cetak / Export PDF
          </Button>

          <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 text-xs font-semibold shadow-xs cursor-pointer">
                <Download className="h-4 w-4" /> Ambil dari Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Pilih Template Preset untuk '{eventName}'
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Pilih salah satu template preset di bawah untuk menambahkan item persiapan secara otomatis ke acara ini:
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <div
                  onClick={() => importPresetTemplate("lamaran")}
                  className="p-3.5 rounded-lg border border-border bg-card hover:border-primary hover:bg-accent/40 cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground group-hover:text-primary flex items-center gap-1.5">
                      💍 Template Acara Lamaran & Tunangan
                    </span>
                    <Badge variant="outline" className="text-[10px]">8 Item</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Cincin tunangan, kain batik sarimbit, hantaran kue adat, parsel buah, teks sambutan, & sound system.
                  </p>
                </div>

                <div
                  onClick={() => importPresetTemplate("akad")}
                  className="p-3.5 rounded-lg border border-border bg-card hover:border-primary hover:bg-accent/40 cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground group-hover:text-primary flex items-center gap-1.5">
                      🕌 Template Akad Nikah Sakral & KUA
                    </span>
                    <Badge variant="outline" className="text-[10px]">8 Item</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Dokumen KUA (N1, N2, N4, Suket Sehat), mahar/maskawin, saksi akad, & Al-Qur'an sajadah ijab kabul.
                  </p>
                </div>

                <div
                  onClick={() => importPresetTemplate("resepsi")}
                  className="p-3.5 rounded-lg border border-border bg-card hover:border-primary hover:bg-accent/40 cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground group-hover:text-primary flex items-center gap-1.5">
                      💒 Template Resepsi Utama & Pesta
                    </span>
                    <Badge variant="outline" className="text-[10px]">7 Item</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Food tasting katering, souvenir & kupon, buku tamu, photo booth props, gaun/beskap, & sandal pelaminan.
                  </p>
                </div>

                <div
                  onClick={() => importPresetTemplate("master")}
                  className="p-3.5 rounded-lg border border-primary/30 bg-primary/5 hover:border-primary cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-primary flex items-center gap-1.5">
                      🎁 Template Master Pre-Wedding & 9 Kotak Seserahan
                    </span>
                    <Badge variant="default" className="text-[10px]">27 Item Lengkap</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Seluruh berkas KUA + 9 Kotak Seserahan Hias lengkap dengan rincian produk, estimasi harga & link beli.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={loadDefaultPresets} className="gap-2 text-xs cursor-pointer">
            <RotateCcw className="h-4 w-4" /> Reset Template Seeder
          </Button>
        </div>
      </div>

      {/* SCOPE BANNER */}
      <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-between gap-3 text-xs print:hidden">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span>
            Scope Checklist Terisolasi:{" "}
            <strong className="text-primary font-semibold">{eventName}</strong>
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] bg-background">
          {items.length} Item Tersimpan
        </Badge>
      </div>

      {/* ALL-TABS HIDDEN SAFETY BANNER */}
      {hiddenCategories.length === 4 && (
        <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Seluruh 4 tab kategori disembunyikan untuk acara ini.</span>
          </div>
          <Button
            size="sm"
            onClick={showAllCategories}
            className="h-7 text-xs font-semibold gap-1.5 cursor-pointer bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Eye className="h-3.5 w-3.5" /> Tampilkan Semua Tab
          </Button>
        </div>
      )}

      <Tabs value={activeCategory} onValueChange={(v: any) => setActiveCategory(v)} className="space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap print:hidden">
          <TabsList className="flex-1 flex flex-wrap h-auto p-1 bg-muted/60 min-h-[42px]">
            {!hiddenCategories.includes("kua") && (
              <TabsTrigger value="kua" className="group py-2 px-3 text-xs gap-1.5 font-medium relative cursor-pointer">
                <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Dokumen ({kuaCompleted}/{kuaItems.length})</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    hideCategory("kua");
                  }}
                  className="ml-1 p-0.5 text-muted-foreground/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity rounded"
                  title="Sembunyikan Tab Dokumen"
                >
                  <X className="h-3 w-3" />
                </span>
              </TabsTrigger>
            )}

            {!hiddenCategories.includes("seserahan") && (
              <TabsTrigger value="seserahan" className="group py-2 px-3 text-xs gap-1.5 font-medium relative cursor-pointer">
                <Gift className="h-4 w-4 text-pink-600 shrink-0" />
                <span>Kotak Seserahan ({seserahanCompletedCount}/{seserahanAllItems.length})</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    hideCategory("seserahan");
                  }}
                  className="ml-1 p-0.5 text-muted-foreground/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity rounded"
                  title="Sembunyikan Tab Kotak Seserahan"
                >
                  <X className="h-3 w-3" />
                </span>
              </TabsTrigger>
            )}

            {!hiddenCategories.includes("lamaran") && (
              <TabsTrigger value="lamaran" className="group py-2 px-3 text-xs gap-1.5 font-medium min-w-0 relative cursor-pointer">
                <Heart className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="truncate">{dynamicTabTriggerLabel} ({lamaranCompleted}/{lamaranItems.length})</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    hideCategory("lamaran");
                  }}
                  className="ml-1 p-0.5 text-muted-foreground/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity rounded"
                  title="Sembunyikan Tab Event Ini"
                >
                  <X className="h-3 w-3" />
                </span>
              </TabsTrigger>
            )}

            {!hiddenCategories.includes("emergency") && (
              <TabsTrigger value="emergency" className="group py-2 px-3 text-xs gap-1.5 font-medium relative cursor-pointer">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>Emergency H-Day ({emergencyCompleted}/{emergencyItems.length})</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    hideCategory("emergency");
                  }}
                  className="ml-1 p-0.5 text-muted-foreground/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity rounded"
                  title="Sembunyikan Tab Emergency H-Day"
                >
                  <X className="h-3 w-3" />
                </span>
              </TabsTrigger>
            )}
          </TabsList>


          {/* MANAGE TABS DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 text-xs gap-1.5 font-medium cursor-pointer shrink-0">
                <Settings2 className="h-4 w-4" /> Kelola Tab
                {hiddenCategories.length > 0 && (
                  <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4 min-w-4 flex items-center justify-center">
                    {hiddenCategories.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs">Tampilkan Kategori Tab</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuCheckboxItem
                checked={!hiddenCategories.includes("kua")}
                onCheckedChange={() => toggleCategoryVisibility("kua")}
                className="text-xs cursor-pointer"
              >
                📄 Dokumen
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={!hiddenCategories.includes("seserahan")}
                onCheckedChange={() => toggleCategoryVisibility("seserahan")}
                className="text-xs cursor-pointer"
              >
                🎁 Kotak Seserahan
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={!hiddenCategories.includes("lamaran")}
                onCheckedChange={() => toggleCategoryVisibility("lamaran")}
                className="text-xs cursor-pointer"
              >
                ♡ {dynamicTabTriggerLabel}
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={!hiddenCategories.includes("emergency")}
                onCheckedChange={() => toggleCategoryVisibility("emergency")}
                className="text-xs cursor-pointer"
              >
                ⚠️ Emergency H-Day
              </DropdownMenuCheckboxItem>

              {hiddenCategories.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={showAllCategories}
                    className="text-xs text-primary font-semibold cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 mr-2" /> Tampilkan Semua Tab
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>


        {/* SESERAHAN VIEW */}
        {activeCategory === "seserahan" ? (
          <div className="space-y-6">
            <Card className="border-pink-500/20 bg-pink-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-serif text-pink-700 dark:text-pink-400 flex items-center gap-2">
                  <Gift className="h-5 w-5" /> Ringkasan Anggaran & Status Kotak Seserahan
                </CardTitle>
                <CardDescription className="text-xs">
                  Progres Pembelian: {completedCount} dari {totalCount} produk selesai ({progressPercent}%)
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-0">
                <div className="p-3 bg-card rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground block">Total Estimasi Biaya</span>
                  <span className="text-base font-mono font-bold text-foreground">
                    Rp {totalSeserahanBudget.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="p-3 bg-card rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground block">Sudah Dibeli / Lunas</span>
                  <span className="text-base font-mono font-bold text-emerald-600">
                    Rp {totalPaidSeserahan.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="p-3 bg-card rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground block">Sisa Anggaran Belanja</span>
                  <span className="text-base font-mono font-bold text-amber-600">
                    Rp {totalRemainingSeserahan.toLocaleString("id-ID")}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Form Add Seserahan Item */}
            <Card className="p-4 border-border/80 print:hidden">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-muted-foreground">
                + Tambah Item Kotak Seserahan Baru
              </h3>
              <form onSubmit={handleAddCustomItem} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Pilih Kotak Seserahan
                  </label>
                  <select
                    value={selectedBoxName}
                    onChange={(e) => setSelectedBoxName(e.target.value)}
                    className="w-full h-9 text-xs rounded-md border border-input bg-background px-3 py-1 text-foreground shadow-xs"
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
                    <Button type="submit" size="sm" className="h-9 px-3 shrink-0 cursor-pointer">
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
                  Belum ada kotak seserahan. Klik &apos;Ambil dari Template&apos; di atas.
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
                            className={`p-3 rounded-lg border flex flex-col justify-between gap-2 transition-all ${
                              subItem.is_completed
                                ? "bg-accent/20 border-border/50 text-muted-foreground opacity-85"
                                : "bg-card border-border text-foreground hover:border-primary/50"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div
                                className="flex items-start space-x-3 cursor-pointer flex-1"
                                onClick={() => handleCheckboxClick(subItem)}
                              >
                                {subItem.is_completed ? (
                                  <CheckSquare className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <p className={`font-semibold text-xs leading-snug ${subItem.is_completed ? "line-through opacity-75" : ""}`}>
                                    {subItem.item_name}
                                  </p>
                                  {subItem.notes && (
                                    <p className="text-[11px] text-muted-foreground font-normal mt-0.5">
                                      Catatan: {subItem.notes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 self-end sm:self-center">
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
                                  onClick={() => handleDeleteItem(subItem.id)}
                                  className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            {/* EXECUTION NOTES DISPLAY */}
                            {subItem.is_completed && subItem.completed_notes && (
                              <div className="mt-1 p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-start gap-1.5">
                                <MessageSquareQuote className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>
                                  <strong>Catatan Pelaksanaan:</strong> "{subItem.completed_notes}"
                                </span>
                              </div>
                            )}
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
                    {activeCategory === "kua" && "📄 Berkas & Syarat Dokumen Administrasi"}
                    {activeCategory === "lamaran" && `💍 ${dynamicEventCategoryLabel}`}
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
              <form onSubmit={handleAddCustomItem} className="grid gap-2 sm:grid-cols-4 pt-2 print:hidden">
                <Input
                  type="text"
                  placeholder="Tambah item checklist baru..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="sm:col-span-2 text-xs h-9"
                  required
                />
                <Input
                  type="text"
                  placeholder="Catatan panduan opsional..."
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  className="text-xs h-9"
                />
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="PIC / Penanggung Jawab..."
                    value={newItemAssignee}
                    onChange={(e) => setNewItemAssignee(e.target.value)}
                    className="text-xs h-9 flex-1"
                  />
                  <Button type="submit" size="sm" className="h-9 px-3 gap-1 shrink-0 cursor-pointer">
                    <Plus className="h-4 w-4" /> Tambah
                  </Button>
                </div>
              </form>

              <div className="space-y-2 pt-2">
                {sortedCategoryItems.length === 0 ? (
                  <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground text-xs">
                    Belum ada item di kategori ini. Klik &apos;Ambil dari Template&apos; di atas.
                  </div>
                ) : (
                  sortedCategoryItems.map((it) => (
                    <div
                      key={it.id}
                      className={`p-3.5 rounded-lg border flex flex-col justify-between gap-2 transition-all ${
                        it.is_completed
                          ? "bg-accent/20 border-border/50 text-muted-foreground opacity-85"
                          : "bg-card border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className="flex items-start space-x-3 cursor-pointer flex-1"
                          onClick={() => handleCheckboxClick(it)}
                        >
                          {it.is_completed ? (
                            <CheckSquare className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1">
                            <p className={`font-semibold text-xs leading-snug ${it.is_completed ? "line-through opacity-75" : ""}`}>
                              {it.item_name}
                            </p>
                            {it.notes && (
                              <p className="text-[11px] text-muted-foreground font-normal">
                                Catatan: {it.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {it.assignee_name && (
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <User className="h-3 w-3" /> PIC: {it.assignee_name}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteItem(it.id)}
                            className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer print:hidden"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* EXECUTION NOTES DISPLAY */}
                      {it.is_completed && it.completed_notes && (
                        <div className="mt-1 p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-start gap-1.5">
                          <MessageSquareQuote className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>Catatan Pelaksanaan:</strong> "{it.completed_notes}"
                          </span>
                        </div>
                      )}
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
