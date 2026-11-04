"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { meldSpring, meldGentle } from "@/lib/motion-tokens";
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
  Printer,
  Calendar,
  User,
  MessageSquareQuote,
  CheckCircle2,
  X,
  Settings2,
  Eye,
  EyeOff,
  Pencil,
  Clock,
} from "lucide-react";
import { EditChecklistModal } from "./edit-checklist-modal";
import { ConfirmDeleteDialog } from "@/components/shared/modal/confirm-delete-dialog";


export interface ChecklistItem {
  id: string;
  wedding_id?: string;
  event_id?: string;
  category: "kua" | "seserahan" | "lamaran" | "emergency";
  box_name?: string | null;
  item_name: string;
  price?: number | null;
  actual_price?: number | null;
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
  const router = useRouter();
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
  const [editingItem, setEditingItem] = React.useState<ChecklistItem | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [addModalOpen, setAddModalOpen] = React.useState(false);

  // Confirm Delete Modal State
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

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


  const loadDefaultPresets = React.useCallback((silent: boolean = false) => {
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
      localStorage.setItem(`${storageKey}_seeded`, "true");
    }
    if (!silent) {
      toast({
        title: "Template Seeder Dimuat",
        description: `Checklist persiapan khusus untuk '${eventName}' (${defaultItems.length} item) telah diisi.`,
        variant: "success",
      });
    }
  }, [weddingId, eventId, storageKey, eventName, toast]);

  // Initial Load from PostgreSQL Database with LocalStorage Fallback
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
        // Fallback to local storage or load default seeder HANYA SEKALI
        if (typeof window !== "undefined") {
          const alreadySeeded = localStorage.getItem(`${storageKey}_seeded`);
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setItems(parsed);
              } else if (!alreadySeeded) {
                loadDefaultPresets(true);
              } else {
                setItems([]);
              }
            } catch {
              if (!alreadySeeded) loadDefaultPresets(true);
            }
          } else if (!alreadySeeded) {
            loadDefaultPresets(true);
          } else {
            setItems([]);
          }
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, [weddingId, eventId, storageKey, loadDefaultPresets]);

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
  function handleEditClick(item: ChecklistItem) {
    setEditingItem(item);
    setEditModalOpen(true);
  }

  function handleItemUpdated(updated: ChecklistItem) {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === updated.id);
      let nextItems;
      if (exists) {
        nextItems = prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i));
      } else {
        nextItems = [updated, ...prev];
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, JSON.stringify(nextItems));
      }
      return nextItems;
    });
  }

  // Handle Checkbox Toggle
  async function handleCheckboxClick(it: ChecklistItem) {
    const nextStatus = !it.is_completed;
    const nowISO = new Date().toISOString();

    setItems((prev) =>
      prev.map((i) =>
        i.id === it.id
          ? {
              ...i,
              is_completed: nextStatus,
              completed_by: nextStatus ? (i.completed_by || "Pengguna") : null,
              completed_at: nextStatus ? nowISO : null,
            }
          : i
      )
    );

    toast({
      title: nextStatus ? "Item Selesai" : "Item Ditandai Belum Selesai",
      description: `'${it.item_name}' ${nextStatus ? "berhasil diselesaikan." : "dikembalikan ke antrean."}`,
      variant: nextStatus ? "success" : "default",
    });

    const res = await toggleChecklistItemAction({
      id: it.id,
      weddingId,
      isCompleted: nextStatus,
      completedNotes: it.completed_notes || undefined,
      defaultPayload: {
        taskTitle: it.item_name,
        category: it.category,
        notes: it.notes || undefined,
        dueDate: it.due_date || undefined,
        assignedTo: it.assignee_name || undefined,
      },
    });

    if (res && res.success && res.data) {
      setItems((prev) => {
        const nextItems = prev.map((i) =>
          i.id === it.id
            ? {
                ...i,
                id: res.data!.id,
                completed_by: res.data!.completed_by,
                completed_at: res.data!.completed_at,
              }
            : i
        );
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify(nextItems));
        }
        return nextItems;
      });
    }
    router.refresh();
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
      defaultPayload: {
        taskTitle: targetItemForCompletion.item_name,
        category: targetItemForCompletion.category,
        notes: targetItemForCompletion.notes || undefined,
        dueDate: targetItemForCompletion.due_date || undefined,
        assignedTo: targetItemForCompletion.assignee_name || undefined,
      },
    });
    router.refresh();
  }

  function promptDeleteItem(id: string, name: string) {
    setDeleteTarget({ id, name });
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const updated = items.filter((it) => it.id !== deleteTarget.id);
      saveLocalItems(updated);
      await deleteChecklistItemAction(deleteTarget.id, weddingId);
      toast({
        title: "Item Dihapus",
        description: `'${deleteTarget.name}' berhasil dihapus dari checklist.`,
        variant: "warning",
      });
      setDeleteTarget(null);
      router.refresh();
    } catch {
      toast({
        title: "Gagal Menghapus",
        description: "Terjadi kesalahan saat menghapus item.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleDeleteItem(id: string) {
    const target = items.find((it) => it.id === id);
    promptDeleteItem(id, target?.item_name || "Item Checklist");
  }

  async function handleAddCustomItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemName.trim()) return;

    // Cek duplikasi item dengan nama yang sama di kategori aktif
    const trimmedTitle = newItemName.trim();
    const isDuplicate = items.some(
      (it) =>
        it.category === activeCategory &&
        it.item_name.trim().toLowerCase() === trimmedTitle.toLowerCase()
    );

    if (isDuplicate) {
      toast({
        title: "Item Sudah Ada",
        description: `'${trimmedTitle}' sudah ada dalam daftar kategori ini.`,
        variant: "destructive",
      });
      return;
    }

    const tempId = `custom_${Date.now()}`;
    const newItem: ChecklistItem = {
      id: tempId,
      wedding_id: weddingId,
      event_id: eventId,
      category: activeCategory,
      box_name: activeCategory === "seserahan" ? selectedBoxName : null,
      item_name: trimmedTitle,
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
      description: `'${newItem.item_name}' telah dicatat.`,
      variant: "success",
    });

    setAddModalOpen(false);

    const res = await addChecklistItemAction({
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

    if (res && res.success && res.data) {
      setItems((prev) => {
        const nextItems = prev.map((i) => (i.id === tempId ? { ...i, id: res.data!.id } : i));
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify(nextItems));
        }
        return nextItems;
      });
    }
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

    // Filter out item yang sudah ada di daftar checklist agar tidak terduplikasi
    const existingTitles = new Set(
      items.map((i) => i.item_name.trim().toLowerCase())
    );
    const nonDuplicatePresets = presetsToImport.filter(
      (p) => !existingTitles.has(p.item_name.trim().toLowerCase())
    );

    if (nonDuplicatePresets.length === 0) {
      toast({
        title: "Item Sudah Ada",
        description: "Semua item dari template ini sudah ada di dalam checklist Anda.",
        variant: "default",
      });
      setImportModalOpen(false);
      return;
    }

    const updated = [...items, ...nonDuplicatePresets];
    saveLocalItems(updated);
    setImportModalOpen(false);
    toast({
      title: "Template Berhasil Diimpor",
      description: `${nonDuplicatePresets.length} item baru dari template telah ditambahkan ke checklist '${eventName}'.`,
      variant: "success",
    });
  }

  // Filter items per active category & sort uncompleted first
  const categoryItems = items.filter((it) => it.category === activeCategory);
  const sortedCategoryItems = sortChecklistItems(categoryItems);
  const completedCount = categoryItems.filter((it) => it.is_completed).length;
  const totalCount = categoryItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Seserahan financial calculations: Estimasi vs Realisasi
  const seserahanItems = items.filter((it) => it.category === "seserahan");
  const totalSeserahanBudget = seserahanItems.reduce((acc, it) => acc + (it.price || 0), 0);
  const totalPaidSeserahan = seserahanItems
    .filter((it) => it.is_completed)
    .reduce((acc, it) => acc + (it.price || 0), 0);
  const totalActualSeserahan = seserahanItems
    .filter((it) => it.is_completed)
    .reduce((acc, it) => acc + (it.actual_price !== null && it.actual_price !== undefined && it.actual_price > 0 ? it.actual_price : (it.price || 0)), 0);
  const totalRemainingSeserahan = Math.max(0, totalSeserahanBudget - totalPaidSeserahan);
  const totalSeserahanVariance = seserahanItems
    .filter((it) => it.is_completed && it.actual_price !== null && it.actual_price !== undefined && it.actual_price > 0 && it.price)
    .reduce((acc, it) => acc + ((it.actual_price || 0) - (it.price || 0)), 0);

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
            <DialogTitle className="font-sans text-lg flex items-center gap-2">
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
                placeholder="Catatan berkas, nomor dokumen, atau PIC penanggung jawab..."
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

      {/* HEADER SECTION - CLEAN MOBILE-FIRST */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-sans text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Checklist Persiapan
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {eventName}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const pendingItems = items.filter((i) => !i.is_completed);
              const text = `💍 *Checklist Persiapan - ${eventName}*\n\n` +
                (pendingItems.length === 0
                  ? "Alhamdulillah, semua checklist persiapan telah selesai! 🎉"
                  : `Berikut daftar ${pendingItems.length} item persiapan yang masih perlu diselesaikan:\n\n` +
                    pendingItems
                      .slice(0, 15)
                      .map((i, idx) => `${idx + 1}. [ ] ${i.item_name}${i.assignee_name ? ` (PIC: ${i.assignee_name})` : ""}${i.due_date ? ` - Target: ${i.due_date}` : ""}`)
                      .join("\n") +
                    (pendingItems.length > 15 ? `\n\n...dan ${pendingItems.length - 15} item lainnya.` : "") +
                    `\n\nBuka workspace: https://nikahyu.my.id/dashboard/${weddingId}/checklists`);
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
            }}
            className="h-8 rounded-full gap-1 text-[11px] font-semibold cursor-pointer border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 meld-bouncy"
          >
            <MessageSquareQuote className="h-3.5 w-3.5" /> Share WA
          </Button>

          <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 rounded-full gap-1 text-[11px] font-semibold border-border/80 hover:bg-muted cursor-pointer meld-bouncy">
                <Download className="h-3.5 w-3.5" /> Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-sans text-lg flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" /> Template Preset '{eventName}'
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Pilih template di bawah untuk menambahkan item persiapan secara otomatis:
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2.5 py-2">
                <div
                  onClick={() => importPresetTemplate("lamaran")}
                  className="p-3.5 rounded-2xl border border-border bg-card hover:border-primary cursor-pointer transition-all space-y-1 meld-bouncy"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">
                      Template Acara Lamaran & Tunangan
                    </span>
                    <Badge variant="outline" className="text-[10px]">8 Item</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Cincin tunangan, kain batik sarimbit, hantaran kue adat, parsel buah, & sound system.
                  </p>
                </div>

                <div
                  onClick={() => importPresetTemplate("akad")}
                  className="p-3.5 rounded-2xl border border-border bg-card hover:border-primary cursor-pointer transition-all space-y-1 meld-bouncy"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">
                      Template Akad Nikah Sakral & KUA
                    </span>
                    <Badge variant="outline" className="text-[10px]">8 Item</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Dokumen KUA (N1, N2, N4, Suket Sehat), mahar/maskawin, saksi akad, & Al-Qur'an sajadah.
                  </p>
                </div>

                <div
                  onClick={() => importPresetTemplate("resepsi")}
                  className="p-3.5 rounded-2xl border border-border bg-card hover:border-primary cursor-pointer transition-all space-y-1 meld-bouncy"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">
                      Template Resepsi Utama & Pesta
                    </span>
                    <Badge variant="outline" className="text-[10px]">7 Item</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Food tasting katering, souvenir & kupon, buku tamu, photo booth, gaun/beskap, & sandal pelaminan.
                  </p>
                </div>

                <div
                  onClick={() => importPresetTemplate("master")}
                  className="p-3.5 rounded-2xl border border-primary/30 bg-primary/5 hover:border-primary cursor-pointer transition-all space-y-1 meld-bouncy"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-primary">
                      Template Master Pre-Wedding & 9 Kotak Seserahan
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

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.print()}
            className="h-8 rounded-full text-muted-foreground hover:text-foreground text-[11px] p-2"
            title="Cetak Dokumen"
          >
            <Printer className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadDefaultPresets(false)}
            className="h-8 rounded-full text-muted-foreground hover:text-foreground text-[11px] p-2"
            title="Reset ke Template Awal"
          >
            <RotateCcw className="h-3.5 w-3.5" />
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
        {/* SWIPEABLE PILL CAPSULE TABS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none print:hidden -mx-1 px-1">
          {!hiddenCategories.includes("kua") && (
            <button
              type="button"
              onClick={() => setActiveCategory("kua")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer meld-bouncy",
                activeCategory === "kua"
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span>Dokumen ({kuaCompleted}/{kuaItems.length})</span>
            </button>
          )}

          {!hiddenCategories.includes("seserahan") && (
            <button
              type="button"
              onClick={() => setActiveCategory("seserahan")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer meld-bouncy",
                activeCategory === "seserahan"
                  ? "bg-pink-600 text-white shadow-xs font-bold"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Gift className="h-3.5 w-3.5 shrink-0" />
              <span>Seserahan ({seserahanCompletedCount}/{seserahanAllItems.length})</span>
            </button>
          )}

          {!hiddenCategories.includes("lamaran") && (
            <button
              type="button"
              onClick={() => setActiveCategory("lamaran")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer meld-bouncy",
                activeCategory === "lamaran"
                  ? "bg-amber-600 text-white shadow-xs font-bold"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Heart className="h-3.5 w-3.5 shrink-0" />
              <span>Acara & Prosesi ({lamaranCompleted}/{lamaranItems.length})</span>
            </button>
          )}

          {!hiddenCategories.includes("emergency") && (
            <button
              type="button"
              onClick={() => setActiveCategory("emergency")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer meld-bouncy",
                activeCategory === "emergency"
                  ? "bg-rose-600 text-white shadow-xs font-bold"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>Emergency ({emergencyCompleted}/{emergencyItems.length})</span>
            </button>
          )}
        </div>


        {/* SESERAHAN VIEW */}
        {activeCategory === "seserahan" ? (
          <div className="space-y-4">
            {/* CLEAN COMPACT METRICS STRIP (AIRBNB LUXE) */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3.5 bg-card/80 backdrop-blur-xs rounded-2xl border border-border/70 shadow-xs">
                <span className="text-[10px] sm:text-xs text-muted-foreground block font-medium">Estimasi</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-foreground mt-0.5 block truncate">
                  Rp {totalSeserahanBudget.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="p-3.5 bg-card/80 backdrop-blur-xs rounded-2xl border border-border/70 shadow-xs">
                <span className="text-[10px] sm:text-xs text-muted-foreground block font-medium">Realisasi</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block truncate">
                  Rp {totalActualSeserahan.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="p-3.5 bg-card/80 backdrop-blur-xs rounded-2xl border border-border/70 shadow-xs">
                <span className="text-[10px] sm:text-xs text-muted-foreground block font-medium">Selisih</span>
                <span className={`text-xs sm:text-sm font-mono font-bold mt-0.5 block truncate ${
                  totalSeserahanVariance > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : totalSeserahanVariance < 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                }`}>
                  {totalSeserahanVariance > 0 ? "+" : ""}{totalSeserahanVariance === 0 ? "Rp 0" : `Rp ${totalSeserahanVariance.toLocaleString("id-ID")}`}
                </span>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="bg-card/60 p-3 rounded-2xl border border-border/60 flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-[11px] mb-1 font-medium">
                  <span className="text-muted-foreground">Progres Kotak Seserahan</span>
                  <span className="text-foreground font-semibold">{completedCount} dari {totalCount} ({progressPercent}%)</span>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setAddModalOpen(true)}
                className="h-8 rounded-full px-3 text-[11px] font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs meld-bouncy gap-1 cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Tambah
              </Button>
            </div>

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
                    <div key={boxTitle} className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                      {/* Accordion / Section Header */}
                      <div className="px-4 py-3 bg-muted/40 border-b border-border/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-bold text-xs sm:text-sm text-foreground tracking-tight">
                            {boxTitle}
                          </span>
                          <span className="font-mono text-[10px] font-semibold text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border/60">
                            {boxCompleted}/{boxSubItems.length}
                          </span>
                        </div>

                        <span className="font-mono font-bold text-xs text-foreground">
                          Rp {boxTotal.toLocaleString("id-ID")}
                        </span>
                      </div>

                      {/* Clean Inset Separator Rows */}
                      <div className="divide-y divide-border/50">
                        {sortedBoxSubItems.map((subItem) => (
                          <motion.div
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={meldGentle}
                            key={subItem.id}
                            className={`px-4 py-3.5 flex items-center justify-between gap-3 transition-colors ${
                              subItem.is_completed
                                ? "bg-muted/15 text-muted-foreground"
                                : "hover:bg-muted/30 text-foreground"
                            }`}
                          >
                            {/* LEFT: Checkbox + Typography */}
                            <div
                              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                              onClick={() => handleCheckboxClick(subItem)}
                            >
                              <div className="shrink-0">
                                {subItem.is_completed ? (
                                  <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                    <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="h-5 w-5 rounded-full border border-muted-foreground/40 hover:border-foreground transition-colors" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className={`text-xs sm:text-sm font-medium tracking-tight truncate ${subItem.is_completed ? "line-through text-muted-foreground/70" : "text-foreground"}`}>
                                    {subItem.item_name}
                                  </p>
                                  {subItem.is_completed && subItem.completed_by && (
                                    <span className="text-[10px] text-muted-foreground font-normal">
                                      • {subItem.completed_by}
                                    </span>
                                  )}
                                </div>
                                {subItem.notes && (
                                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                    {subItem.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* RIGHT: Numeric Price + Subtle Actions */}
                            <div className="flex items-center gap-3 shrink-0">
                              {subItem.price && (
                                <div className="text-right">
                                  {subItem.actual_price ? (
                                    <div>
                                      <span className="font-mono text-[10px] text-muted-foreground line-through block">
                                        Rp {subItem.price.toLocaleString("id-ID")}
                                      </span>
                                      <span className="font-mono font-bold text-xs text-foreground block">
                                        Rp {subItem.actual_price.toLocaleString("id-ID")}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="font-mono font-semibold text-xs text-foreground block">
                                      Rp {subItem.price.toLocaleString("id-ID")}
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center gap-0.5">
                                {subItem.purchase_url && (
                                  <a
                                    href={subItem.purchase_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                    title="Link Belanja Online"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(subItem);
                                  }}
                                  className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteItem(subItem.id);
                                  }}
                                  className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* STANDARD VIEW FOR KUA, LAMARAN, & EMERGENCY */
          <div className="space-y-4">
            {/* CLEAN COMPACT METRICS STRIP */}
            <div className="bg-card/70 backdrop-blur-xs p-4 rounded-3xl border border-border/70 shadow-xs flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-sm font-bold font-sans text-foreground">
                    {activeCategory === "kua" && "Berkas Syarat KUA"}
                    {activeCategory === "lamaran" && dynamicEventCategoryLabel}
                    {activeCategory === "emergency" && "Emergency Kit & Logistik"}
                  </h3>
                  <span className="text-xs font-semibold text-foreground font-mono">
                    {completedCount}/{totalCount} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => setAddModalOpen(true)}
                className="h-8 rounded-full px-3 text-[11px] font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs meld-bouncy gap-1 cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Tambah
              </Button>
            </div>

            {/* Clean Inset Separator Rows */}
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden divide-y divide-border/50 shadow-xs">
              {sortedCategoryItems.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  Belum ada item di kategori ini. Klik &apos;Ambil dari Template&apos; di atas.
                </div>
              ) : (
                sortedCategoryItems.map((it) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={meldGentle}
                    key={it.id}
                    className={`px-4 py-3.5 flex items-center justify-between gap-3 transition-colors ${
                      it.is_completed
                        ? "bg-muted/15 text-muted-foreground"
                        : "hover:bg-muted/30 text-foreground"
                    }`}
                  >
                    {/* LEFT: Checkbox + Typography */}
                    <div
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleCheckboxClick(it)}
                    >
                      <div className="shrink-0">
                        {it.is_completed ? (
                          <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-muted-foreground/40 hover:border-foreground transition-colors" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-xs sm:text-sm font-medium tracking-tight truncate ${it.is_completed ? "line-through text-muted-foreground/70" : "text-foreground"}`}>
                            {it.item_name}
                          </p>
                          {it.is_completed && it.completed_by && (
                            <span className="text-[10px] text-muted-foreground font-normal">
                              • {it.completed_by}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                          {it.due_date && (
                            <span>Target: {new Date(it.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                          )}
                          {it.assignee_name && (
                            <span>• PIC: {it.assignee_name}</span>
                          )}
                          {it.notes && (
                            <span className="truncate">• {it.notes}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Action Icons */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(it);
                        }}
                        className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(it.id);
                        }}
                        className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </Tabs>

      {/* EDIT CHECKLIST MODAL */}
      <EditChecklistModal
        item={editingItem}
        weddingId={weddingId}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onUpdated={handleItemUpdated}
      />

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Item Checklist?"
        description="Tindakan ini akan menghapus tugas ini dari daftar persiapan pernikahan."
        itemName={deleteTarget?.name}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
      />

      {/* FLOATING ACTION BUTTON (FAB) & ADD ITEM BOTTOM-SHEET MODAL */}
      <div className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-30 print:hidden">
        <Button
          onClick={() => setAddModalOpen(true)}
          className="h-13 w-13 rounded-full bg-[#ff385c] hover:bg-[#e00b41] text-white shadow-lg shadow-rose-500/30 flex items-center justify-center meld-bouncy cursor-pointer"
          title="Tambah Tugas Checklist"
          aria-label="Tambah Tugas Checklist"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </Button>
      </div>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md p-5 sm:p-6 rounded-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="text-left pb-2 border-b border-border/60">
            <DialogTitle className="font-sans text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Tambah Tugas Checklist Baru
            </DialogTitle>
            <DialogDescription className="text-xs">
              Kategori aktif: <strong className="text-foreground capitalize">{activeCategory}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddCustomItem} className="space-y-3.5 pt-2">
            {activeCategory === "seserahan" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Pilih Kotak Seserahan
                </label>
                <select
                  value={selectedBoxName}
                  onChange={(e) => setSelectedBoxName(e.target.value)}
                  className="w-full h-10 text-xs rounded-xl border border-input bg-background px-3 py-1 text-foreground"
                >
                  {availableBoxNames.map((bName) => (
                    <option key={bName} value={bName}>
                      {bName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Nama Tugas / Barang
              </label>
              <Input
                type="text"
                placeholder="e.g. Booking MUA / Cetak Undangan"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="h-10 text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Catatan Instruksi (Opsional)
              </label>
              <Input
                type="text"
                placeholder="Catatan panduan atau detail teknis..."
                value={newItemNotes}
                onChange={(e) => setNewItemNotes(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" /> PIC / Penanggung Jawab
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Mas Raden"
                  value={newItemAssignee}
                  onChange={(e) => setNewItemAssignee(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" /> Target Selesai
                </label>
                <Input
                  type="date"
                  value={newItemDueDate}
                  onChange={(e) => setNewItemDueDate(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            {activeCategory === "seserahan" && (
              <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-border/50">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Estimasi Harga (Rp)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 500000"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Link Belanja Online
                  </label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={newItemUrl}
                    onChange={(e) => setNewItemUrl(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddModalOpen(false)}
                className="h-9 rounded-full text-xs font-semibold"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-9 px-5 rounded-full bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-semibold shadow-xs meld-bouncy gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah ke Checklist
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
