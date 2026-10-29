"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { PhoneInput } from "@/components/shared/whatsapp/phone-input";
import { WAButton } from "@/components/shared/whatsapp/wa-button";
import { MediaUploaderDropzone, UploadedFileMeta } from "@/components/shared/media-uploader/dropzone";
import { ConfirmDeleteDialog } from "@/components/shared/modal/confirm-delete-dialog";
import { DataTablePagination } from "@/components/shared/pagination/data-table-pagination";
import {
  createVendorAction,
  updateVendorAction,
  addVendorDocumentAction,
  deleteVendorDocumentAction,
  deleteVendorAction,
  syncVendorToBudgetAction,
} from "@/actions/vendor-actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import {
  Briefcase,
  Plus,
  Trash2,
  Edit,
  FileText,
  Upload,
  UserCheck,
  ExternalLink,
  DollarSign,
  FileCheck,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Eye,
  ThumbsUp,
  CheckCircle2,
  Award,
  Clock,
  Ban,
  Printer,
  Star,
  Zap,
  Building2,
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

import { VendorComparisonMatrix } from "./vendor-comparison-matrix";
import { VendorRatingModal } from "./vendor-rating-modal";
import { VendorBriefingModal } from "./vendor-briefing-pdf";
import { PartnerCatalogImportModal } from "./partner-catalog-import-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface VendorDocumentItem {
  id: string;
  document_title: string;
  r2_file_key: string;
  file_size_bytes: number;
  mime_type: string;
  doc_type?: "pricelist" | "menu" | "contract" | "receipt" | "other";
  uploaded_at: string;
}

export interface VendorItem {
  id: string;
  wedding_id?: string;
  event_id?: string | null;
  vendor_name: string;
  category: string;
  pic_name?: string | null;
  sanitized_phone?: string | null;
  contract_value: number;
  status?: "candidate" | "shortlisted" | "selected" | "rejected";
  pros_cons_notes?: string | null;
  package_details?: string | null;
  vendor_documents?: VendorDocumentItem[];
}

export interface VendorManagerProps {
  weddingId: string;
  eventId?: string;
  events?: { id: string; event_name: string }[];
  initialVendors: VendorItem[];
}

export function VendorManager({ weddingId, eventId, events = [], initialVendors }: VendorManagerProps) {
  const router = useRouter();
  const [vendors, setVendors] = React.useState<VendorItem[]>(initialVendors);
  const [activeMainTab, setActiveMainTab] = React.useState<"table" | "matrix">("table");
  const [openModal, setOpenModal] = React.useState(false);
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [editingVendor, setEditingVendor] = React.useState<VendorItem | null>(null);

  // Detail Modal State
  const [openDetailModal, setOpenDetailModal] = React.useState(false);
  const [detailVendor, setDetailVendor] = React.useState<VendorItem | null>(null);

  // Rating, Briefing & Catalog Modal State
  const [openRatingModal, setOpenRatingModal] = React.useState(false);
  const [ratingTargetVendor, setRatingTargetVendor] = React.useState<VendorItem | null>(null);
  const [openBriefingModal, setOpenBriefingModal] = React.useState(false);
  const [openCatalogModal, setOpenCatalogModal] = React.useState(false);
  const [syncingBudgetId, setSyncingBudgetId] = React.useState<string | null>(null);

  const [activeUploadVendorId, setActiveUploadVendorId] = React.useState<string | null>(null);
  const [expandedVendorId, setExpandedVendorId] = React.useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Form states for Create/Edit
  const [vendorName, setVendorName] = React.useState("");
  const [category, setCategory] = React.useState("Catering");
  const [picName, setPicName] = React.useState("");
  const [contactNumber, setContactNumber] = React.useState("");
  const [contractValue, setContractValue] = React.useState("");
  const [vendorStatus, setVendorStatus] = React.useState<"candidate" | "shortlisted" | "selected" | "rejected">("candidate");
  const [packageDetails, setPackageDetails] = React.useState("");
  const [prosConsNotes, setProsConsNotes] = React.useState("");
  const [docType, setDocType] = React.useState<"pricelist" | "menu" | "contract" | "receipt" | "other">("pricelist");
  const [loading, setLoading] = React.useState(false);

  function handleOpenDetail(vendor: VendorItem) {
    setDetailVendor(vendor);
    setOpenDetailModal(true);
  }

  async function handleSyncToBudget(vendor: VendorItem) {
    setSyncingBudgetId(vendor.id);
    try {
      const res = await syncVendorToBudgetAction(vendor.id, weddingId);
      toast({
        title: "Vendor Tersinkronisasi ke Anggaran",
        description: `Pos biaya '${vendor.vendor_name}' senilai Rp ${Number(vendor.contract_value || 0).toLocaleString("id-ID")} dibuat di modul Anggaran dengan termin DP 20% & Pelunasan 80%.`,
        variant: "success",
      });
      setVendors((prev) =>
        prev.map((item) =>
          item.id === vendor.id
            ? { ...item, synced_budget_item_id: res.budgetItemId }
            : item
        )
      );
    } catch (err) {
      toast({
        title: "Gagal Sinkronisasi Anggaran",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setSyncingBudgetId(null);
    }
  }

  // Confirm Delete Modal State
  const [deleteTarget, setDeleteTarget] = React.useState<{
    type: "vendor" | "document";
    id: string;
    r2Key?: string;
    title: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    setVendors(initialVendors);
  }, [initialVendors]);

  function resetForm() {
    setVendorName("");
    setCategory("Catering");
    setPicName("");
    setContactNumber("");
    setContractValue("");
    setVendorStatus("candidate");
    setPackageDetails("");
    setProsConsNotes("");
  }

  function handleOpenEdit(vendor: VendorItem) {
    setEditingVendor(vendor);
    setVendorName(vendor.vendor_name || "");
    setCategory(vendor.category || "Catering");
    setPicName(vendor.pic_name || "");
    setContactNumber(vendor.sanitized_phone || "");
    setContractValue(vendor.contract_value ? String(vendor.contract_value) : "");
    setVendorStatus((vendor.status as any) || "candidate");
    setPackageDetails((vendor as any).package_details || "");
    setProsConsNotes((vendor as any).pros_cons_notes || "");
    setOpenEditModal(true);
  }

  async function handleCreateVendor(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await createVendorAction({
        weddingId,
        eventId: eventId || null,
        vendorName,
        category,
        picName,
        contactNumber,
        contractValue: Number(contractValue) || 0,
        status: vendorStatus,
        packageDetails,
        prosConsNotes,
      });

      toast({
        title: "Vendor Berhasil Ditambahkan",
        description: `Vendor '${vendorName}' kategori ${category} tersimpan.`,
        variant: "success",
      });

      setOpenModal(false);
      resetForm();
      router.refresh();
    } catch (err) {
      toast({
        title: "Gagal Menambahkan Vendor",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateVendor(e: React.FormEvent) {
    e.preventDefault();
    if (!editingVendor) return;

    setLoading(true);

    try {
      await updateVendorAction(editingVendor.id, weddingId, {
        vendorName,
        category,
        picName,
        contactNumber,
        contractValue: Number(contractValue) || 0,
        status: vendorStatus,
        packageDetails,
        prosConsNotes,
      });

      toast({
        title: "Vendor Berhasil Diperbarui",
        description: `Perubahan rincian vendor '${vendorName}' tersimpan.`,
        variant: "success",
      });

      setOpenEditModal(false);
      setEditingVendor(null);
      resetForm();
      router.refresh();
    } catch (err) {
      toast({
        title: "Gagal Memperbarui Vendor",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDocumentSuccess(vendorId: string, meta: UploadedFileMeta) {
    try {
      await addVendorDocumentAction(vendorId, weddingId, {
        documentTitle: meta.file_name,
        r2FileKey: meta.r2_file_key,
        fileSizeBytes: meta.file_size_bytes,
        mimeType: meta.mime_type,
        docType: docType,
      });

      toast({
        title: "Dokumen Kontrak Disimpan",
        description: `Dokumen '${meta.file_name}' terikat pada vendor.`,
        variant: "success",
      });
      setActiveUploadVendorId(null);
    } catch (err) {
      toast({
        title: "Gagal Menyimpan Dokumen",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      if (deleteTarget.type === "vendor") {
        await deleteVendorAction(deleteTarget.id, weddingId);
        toast({
          title: "Vendor Dihapus",
          description: `Vendor '${deleteTarget.title}' beserta dokumen fisiknya telah dibersihkan dari Cloudflare R2.`,
          variant: "success",
        });
      } else if (deleteTarget.type === "document" && deleteTarget.r2Key) {
        await deleteVendorDocumentAction(deleteTarget.id, deleteTarget.r2Key, weddingId);
        toast({
          title: "Dokumen Dihapus",
          description: `Berkas '${deleteTarget.title}' telah dibersihkan dari Cloudflare R2.`,
          variant: "success",
        });
      }
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

  // Calculate totals for KPI summary cards
  const totalVendors = vendors.length;
  const totalContractValue = vendors.reduce((acc, v) => acc + Number(v.contract_value || 0), 0);
  const totalDocumentsCount = vendors.reduce((acc, v) => acc + (v.vendor_documents?.length || 0), 0);
  const totalWAPics = vendors.filter((v) => Boolean(v.sanitized_phone)).length;

  // Filter vendors by category
  const categoriesList = Array.from(new Set(vendors.map((v) => v.category)));
  const filteredVendors = categoryFilter === "all"
    ? vendors
    : vendors.filter((v) => v.category.toLowerCase() === categoryFilter.toLowerCase());

  // Pagination calculation
  const totalItems = filteredVendors.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Reusable Confirm Delete Modal */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={
          deleteTarget?.type === "vendor"
            ? "Hapus Mitra Vendor & Berkas?"
            : "Hapus Dokumen Kontrak?"
        }
        description={
          deleteTarget?.type === "vendor"
            ? "Tindakan ini akan menghapus data vendor beserta seluruh dokumen kontrak fisiknya secara permanen."
            : "Berkas fisik dokumen ini akan secara permanen dihapus."
        }
        itemName={deleteTarget?.title}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
      />

      {/* KPI Cards Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Mitra Vendor
            </CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{totalVendors} Vendor</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Terhubung ke workspace
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Nilai Kontrak
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono text-emerald-600">
              Rp {totalContractValue.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Komitmen biaya vendor
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Dokumen Kontrak
            </CardTitle>
            <FileCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-blue-600">
              {totalDocumentsCount} Berkas
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Tersimpan aman
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Kontak Whatsapp
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-600">
              {totalWAPics} PIC
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Siap dihubungi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Main Tabs (Daftar Vendor vs Matriks Perbandingan) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-3">
        <Tabs
          value={activeMainTab}
          onValueChange={(val: any) => setActiveMainTab(val)}
          className="w-full sm:w-auto"
        >
          <TabsList className="h-10 p-1 bg-muted/70 w-full sm:w-auto grid grid-cols-2 sm:flex">
            <TabsTrigger value="table" className="text-xs font-semibold gap-2">
              <Briefcase className="h-4 w-4 text-primary" /> Daftar & Kontrak Vendor ({vendors.length})
            </TabsTrigger>
            <TabsTrigger value="matrix" className="text-xs font-semibold gap-2">
              <SlidersHorizontal className="h-4 w-4 text-amber-500" /> Matriks Perbandingan Vendor
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setOpenCatalogModal(true)}
            className="gap-2 text-xs h-9 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30 font-semibold"
          >
            <Building2 className="h-4 w-4 text-amber-600" />
            Impor dari Katalog Partner Admin
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpenBriefingModal(true)}
            className="gap-2 text-xs h-9"
          >
            <Printer className="h-4 w-4 text-primary" />
            Export Briefing Sheet (PDF)
          </Button>

          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={resetForm} className="gap-2 h-9">
                <Plus className="h-4 w-4" />
                Tambah Vendor Baru
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateVendor}>
              <DialogHeader>
                <DialogTitle className="font-sans text-xl">Tambah Mitra / Calon Vendor</DialogTitle>
                <DialogDescription>
                  Catat calon vendor, status survei, penawaran harga, dan rincian menu/fasilitas.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nama Vendor</label>
                    <Input
                      type="text"
                      placeholder="e.g. Berkah Catering Utama"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Status Vendor</label>
                    <Select
                      value={vendorStatus}
                      onValueChange={(val: any) => setVendorStatus(val)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Pilih status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="candidate">🟡 Calon / Survei</SelectItem>
                        <SelectItem value="shortlisted">🔵 Kandidat Terkuat</SelectItem>
                        <SelectItem value="selected">🟢 Vendor Pilihan Utama ✅</SelectItem>
                        <SelectItem value="rejected">🔴 Batal / Ditolak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Kategori Layanan</label>
                  <Input
                    type="text"
                    placeholder="e.g. Catering, Venue, MUA, Decor, Photo, Music"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nama PIC</label>
                    <Input
                      type="text"
                      placeholder="e.g. Ibu Rita"
                      value={picName}
                      onChange={(e) => setPicName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nilai Kontrak / Penawaran (IDR)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 45000000"
                      value={contractValue}
                      onChange={(e) => setContractValue(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Nomor WhatsApp PIC</label>
                  <PhoneInput
                    value={contactNumber}
                    onChange={setContactNumber}
                    placeholder="081234567890"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Rincian Paket & Menu</label>
                  <textarea
                    placeholder="Contoh: Paket 500 pax, 5 Pilihan Menu Utama, Free Gubukan Es Puter & Siomay..."
                    value={packageDetails}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPackageDetails(e.target.value)}
                    className="flex min-h-[70px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Catatan & Pertimbangan (Kelebihan/Kekurangan)</label>
                  <textarea
                    placeholder="Contoh: Kelebihan makanan sangat enak saat food testing, kekurangan charge tempat lumayan..."
                    value={prosConsNotes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProsConsNotes(e.target.value)}
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Vendor"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* EDIT MODAL */}
        <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleUpdateVendor}>
              <DialogHeader>
                <DialogTitle className="font-sans text-xl">Edit Data Vendor & Penawaran</DialogTitle>
                <DialogDescription>
                  Perbarui nama, status kandidat, penawaran harga, atau rincian menu/fasilitas.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nama Vendor</label>
                    <Input
                      type="text"
                      placeholder="e.g. Berkah Catering Utama"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Status Vendor</label>
                    <Select
                      value={vendorStatus}
                      onValueChange={(val: any) => setVendorStatus(val)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Pilih status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="candidate">🟡 Calon / Survei</SelectItem>
                        <SelectItem value="shortlisted">🔵 Kandidat Terkuat</SelectItem>
                        <SelectItem value="selected">🟢 Vendor Pilihan Utama ✅</SelectItem>
                        <SelectItem value="rejected">🔴 Batal / Ditolak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Kategori Layanan</label>
                  <Input
                    type="text"
                    placeholder="e.g. Catering, Venue, MUA, Decor, Photo, Music"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nama PIC</label>
                    <Input
                      type="text"
                      placeholder="e.g. Ibu Rita"
                      value={picName}
                      onChange={(e) => setPicName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nilai Kontrak / Penawaran (IDR)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 45000000"
                      value={contractValue}
                      onChange={(e) => setContractValue(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Nomor WhatsApp PIC</label>
                  <PhoneInput
                    value={contactNumber}
                    onChange={setContactNumber}
                    placeholder="081234567890"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Rincian Paket & Menu</label>
                  <textarea
                    placeholder="Contoh: Paket 500 pax, 5 Pilihan Menu Utama..."
                    value={packageDetails}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPackageDetails(e.target.value)}
                    className="flex min-h-[70px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Catatan & Pertimbangan</label>
                  <textarea
                    placeholder="Catatan kelebihan & kekurangan..."
                    value={prosConsNotes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProsConsNotes(e.target.value)}
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
        </div>
      </div>

      {/* Main Active Tab Rendering */}
      {activeMainTab === "matrix" ? (
        <VendorComparisonMatrix
          weddingId={weddingId}
          vendors={vendors}
          categories={
            categoriesList.length > 0
              ? categoriesList
              : ["Catering", "Dekorasi", "Dokumentasi", "MUA & Busana", "Venue", "Entertainment"]
          }
          onStatusUpdated={() => setVendors([...vendors])}
        />
      ) : (
        <>
          {/* HTML TABLE LAYOUT WITH HEADER, NUMBERING & PAGINATION */}
          {filteredVendors.length === 0 ? (
            <Card className="border-dashed p-8 text-center space-y-3">
              <Briefcase className="h-10 w-10 text-muted-foreground mx-auto" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Belum Ada Vendor Terdaftar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Klik tombol &apos;Tambah Vendor Baru&apos; untuk mencatat vendor pertama Anda.
                </p>
              </div>
            </Card>
          ) : (
            <Card className="border-border/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto min-w-0">
                <Table>
                  <TableHeader className="bg-muted/60">
                    <TableRow>
                      <TableHead className="w-12 text-center text-xs font-semibold">No.</TableHead>
                      <TableHead className="text-xs font-semibold">Nama Vendor</TableHead>
                      <TableHead className="text-xs font-semibold">Kategori</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                      <TableHead className="text-xs font-semibold">PIC & Kontak WA</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Nilai Kontrak</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Dokumen</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedVendors.map((v, index) => {
                      const globalIndex = (currentPage - 1) * pageSize + index + 1;
                    const docs = v.vendor_documents || [];
                    const isExpanded = expandedVendorId === v.id;
                    const isWinner = v.status === "selected";

                    return (
                      <React.Fragment key={v.id}>
                        <TableRow className={`hover:bg-muted/30 ${isWinner ? "bg-emerald-500/[0.03]" : ""}`}>
                          {/* Numbering Cell */}
                          <TableCell className="text-center font-mono font-semibold text-xs text-muted-foreground">
                            {globalIndex}
                          </TableCell>

                          {/* Vendor Name */}
                          <TableCell className="font-sans font-bold text-sm text-foreground">
                            <div className="flex items-center gap-1.5">
                              {v.vendor_name}
                              {isWinner && (
                                <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0 font-sans">
                                  Pilihan ✅
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          {/* Service Category */}
                          <TableCell>
                            <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                              {v.category}
                            </Badge>
                          </TableCell>

                          {/* Status Badge */}
                          <TableCell>
                            {v.status === "selected" ? (
                              <Badge className="bg-emerald-600 text-white text-[10px]">Pilihan Utama</Badge>
                            ) : v.status === "shortlisted" ? (
                              <Badge className="bg-sky-600 text-white text-[10px]">Kandidat</Badge>
                            ) : v.status === "rejected" ? (
                              <Badge variant="outline" className="text-muted-foreground text-[10px]">Batal</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">Calon</Badge>
                            )}
                          </TableCell>

                          {/* PIC & WA Direct Button */}
                          <TableCell className="text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-foreground">
                                {v.pic_name || "-"}
                              </span>
                              {v.sanitized_phone && (
                                <WAButton
                                  phone={v.sanitized_phone}
                                  templateString="Halo {nama_vendor}, untuk koordinasi acara pernikahan."
                                  variables={{ nama_vendor: v.vendor_name }}
                                  label={`+${v.sanitized_phone}`}
                                  size="sm"
                                />
                              )}
                            </div>
                          </TableCell>

                          {/* Contract Value */}
                          <TableCell className="text-right font-mono font-bold text-sm text-foreground">
                            Rp {Number(v.contract_value || 0).toLocaleString("id-ID")}
                          </TableCell>

                          {/* Documents Expander Trigger Button */}
                          <TableCell className="text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setExpandedVendorId(isExpanded ? null : v.id)
                              }
                              className="h-7 text-xs gap-1 px-2"
                            >
                              <FileText className="h-3.5 w-3.5 text-primary" />
                              <span>({docs.length})</span>
                              {isExpanded ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </Button>
                          </TableCell>

                          {/* Action Buttons (Sync Budget, Rating, Detail, Edit & Delete) */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={syncingBudgetId === v.id || Boolean((v as any).synced_budget_item_id)}
                                onClick={() => handleSyncToBudget(v)}
                                className={`h-7 text-[11px] gap-1 px-2 ${
                                  (v as any).synced_budget_item_id
                                    ? "text-emerald-600 font-semibold cursor-default"
                                    : "text-amber-600 hover:bg-amber-500/10 font-bold border border-amber-500/30"
                                }`}
                                title={
                                  (v as any).synced_budget_item_id
                                    ? "Vendor Sudah Tersinkronisasi ke Modul Anggaran"
                                    : "Sync ke Modul Anggaran & Payment Milestones"
                                }
                              >
                                <Zap className="h-3 w-3 text-amber-500" />
                                {(v as any).synced_budget_item_id ? "Synced ✅" : "Sync Budget"}
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setRatingTargetVendor(v);
                                  setOpenRatingModal(true);
                                }}
                                className="h-8 w-8 text-amber-500 hover:bg-amber-500/10"
                                title="Evaluasi & Rating Scorecard Vendor"
                              >
                                <Star className="h-4 w-4 fill-amber-500/20" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDetail(v)}
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                title="Lihat Rincian Detail Vendor"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(v)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                title="Edit Data Vendor & Penawaran"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setDeleteTarget({
                                    type: "vendor",
                                    id: v.id,
                                    title: v.vendor_name,
                                  })
                                }
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                title="Hapus Vendor & Berkas R2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expandable Documents Sub-Row */}
                        {isExpanded && (
                          <TableRow className="bg-muted/20 hover:bg-muted/20">
                            <TableCell colSpan={8} className="p-3">
                              <div className="space-y-3 bg-card p-3 rounded-lg border border-border/80 shadow-xs">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <FileText className="h-4 w-4 text-primary" />
                                    Berkas Dokumen & Pamflet Kontrak ({docs.length} Berkas):
                                  </h4>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setActiveUploadVendorId(
                                        activeUploadVendorId === v.id ? null : v.id
                                      )
                                    }
                                    className="h-7 text-xs gap-1"
                                  >
                                    <Upload className="h-3.5 w-3.5" />
                                    Unggah Berkas Baru
                                  </Button>
                                </div>

                                {activeUploadVendorId === v.id && (
                                  <div className="p-3 border border-border rounded-lg bg-card shadow-xs space-y-3">
                                    <div className="space-y-1">
                                      <label className="text-xs font-semibold">Jenis Berkas Dokumen</label>
                                      <Select
                                        value={docType}
                                        onValueChange={(val: any) => setDocType(val)}
                                      >
                                        <SelectTrigger className="h-8 text-xs w-full sm:w-64">
                                          <SelectValue placeholder="Pilih jenis dokumen..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pricelist">📄 Brosur & Pamflet Pricelist</SelectItem>
                                          <SelectItem value="menu">🍱 Daftar Menu & Paket</SelectItem>
                                          <SelectItem value="contract">📝 Kontrak Resmi / SPK</SelectItem>
                                          <SelectItem value="receipt">🧾 Kuitansi / Bukti Pembayaran</SelectItem>
                                          <SelectItem value="other">📎 Dokumen Lainnya</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <MediaUploaderDropzone
                                      weddingId={weddingId}
                                      folder="contracts"
                                      onUploadSuccess={(meta) => handleAddDocumentSuccess(v.id, meta)}
                                    />
                                  </div>
                                )}

                                {docs.length > 0 ? (
                                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                                    {docs.map((d) => (
                                      <div
                                        key={d.id}
                                        className="flex items-center justify-between text-xs p-2.5 rounded-md bg-muted/40 border border-border/60"
                                      >
                                        <div className="flex items-center space-x-2 truncate max-w-[180px]">
                                          <FileText className="h-4 w-4 text-primary shrink-0" />
                                          <div className="truncate">
                                            <p className="font-medium text-foreground truncate">{d.document_title}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono">
                                              {(d.file_size_bytes / 1024).toFixed(0)} KB
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-1 shrink-0">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                            className="h-7 w-7 text-primary hover:bg-primary/10"
                                            title="Buka / Lihat Berkas di R2"
                                          >
                                            <a
                                              href={`/api/storage/presign?key=${encodeURIComponent(d.r2_file_key)}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                              setDeleteTarget({
                                                type: "document",
                                                id: d.id,
                                                r2Key: d.r2_file_key,
                                                title: d.document_title,
                                              })
                                            }
                                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                            title="Hapus Berkas & Bersihkan dari Cloudflare R2"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-muted-foreground italic">
                                    Belum ada berkas dokumen terlampir untuk vendor ini.
                                  </p>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
              </div>

              {/* SCALABLE PAGINATION FOOTER */}
              <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
              />
            </Card>
          )}
        </>
      )}

      {/* DETAIL VENDOR MODAL */}
      <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {detailVendor && (
            <div className="space-y-4">
              <DialogHeader className="pb-2 border-b border-border/60">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-xs uppercase font-semibold">
                    {detailVendor.category}
                  </Badge>
                  {detailVendor.status === "selected" ? (
                    <Badge className="bg-emerald-600 text-white text-xs gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Pilihan Utama ✅
                    </Badge>
                  ) : detailVendor.status === "shortlisted" ? (
                    <Badge className="bg-sky-600 text-white text-xs gap-1">
                      <Award className="h-3 w-3" /> Kandidat Terkuat
                    </Badge>
                  ) : detailVendor.status === "rejected" ? (
                    <Badge variant="outline" className="text-muted-foreground text-xs gap-1">
                      <Ban className="h-3 w-3 text-rose-500" /> Batal / Ditolak
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Clock className="h-3 w-3 text-amber-500" /> Calon / Survei
                    </Badge>
                  )}
                </div>
                <DialogTitle className="font-sans text-2xl pt-2 text-foreground">
                  {detailVendor.vendor_name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Rincian lengkap penawaran vendor, kontak PIC, dan dokumen R2 terlampir.
                </DialogDescription>
              </DialogHeader>

              {/* Key Info Grid */}
              <div className="grid gap-3 sm:grid-cols-2 bg-secondary/30 p-3 rounded-lg border border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Nilai Kontrak / Penawaran:</span>
                  <span className="font-mono font-bold text-base text-primary">
                    Rp {Number(detailVendor.contract_value || 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Kontak PIC & WhatsApp:</span>
                  <div className="flex items-center space-x-1.5 pt-0.5">
                    <span className="font-medium text-foreground">{detailVendor.pic_name || "PIC Vendor"}</span>
                    {detailVendor.sanitized_phone && (
                      <WAButton
                        phone={detailVendor.sanitized_phone}
                        templateString="Halo {nama_vendor}, untuk koordinasi acara pernikahan."
                        variables={{ nama_vendor: detailVendor.vendor_name }}
                        label="WA"
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Rincian Paket & Menu */}
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Rincian Paket & Menu
                </h4>
                <div className="p-3 rounded-md bg-background border border-border/70 text-xs leading-relaxed whitespace-pre-line text-muted-foreground">
                  {(detailVendor as any).package_details || detailVendor.category + " Standard Package"}
                </div>
              </div>

              {/* Catatan & Pertimbangan */}
              {(detailVendor as any).pros_cons_notes && (
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1">
                    <ThumbsUp className="h-3.5 w-3.5 text-amber-500" /> Catatan Pertimbangan
                  </h4>
                  <div className="p-3 rounded-md bg-amber-500/5 border border-amber-500/20 text-xs leading-relaxed whitespace-pre-line text-muted-foreground">
                    {(detailVendor as any).pros_cons_notes}
                  </div>
                </div>
              )}

              {/* Berkas Dokumen & Pamflet */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>Dokumen & Pamflet ({detailVendor.vendor_documents?.length || 0})</span>
                </h4>
                {detailVendor.vendor_documents && detailVendor.vendor_documents.length > 0 ? (
                  <div className="space-y-1.5">
                    {detailVendor.vendor_documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 rounded-md bg-card border border-border/70 text-xs"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <div className="truncate">
                            <p className="font-medium text-foreground truncate">{doc.document_title}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {(doc.file_size_bytes / 1024).toFixed(0)} KB
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="h-7 text-xs gap-1">
                          <a
                            href={`/api/storage/presign?key=${encodeURIComponent(doc.r2_file_key)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" /> Buka File
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Belum ada berkas dokumen diunggah.</p>
                )}
              </div>

              <DialogFooter className="pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpenDetailModal(false);
                    handleOpenEdit(detailVendor);
                  }}
                  className="gap-1.5 text-xs"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit Vendor
                </Button>
                <Button
                  type="button"
                  variant="default"
                  onClick={() => setOpenDetailModal(false)}
                  className="text-xs"
                >
                  Tutup
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* RATING & SCORECARD MODAL */}
      {ratingTargetVendor && (
        <VendorRatingModal
          open={openRatingModal}
          onOpenChange={setOpenRatingModal}
          vendorId={ratingTargetVendor.id}
          vendorName={ratingTargetVendor.vendor_name}
          weddingId={weddingId}
          initialRating={(ratingTargetVendor as any).rating || 5}
          initialReviewNotes={(ratingTargetVendor as any).review_notes || ""}
          onSuccess={() => setVendors([...vendors])}
        />
      )}

      {/* PRINTABLE VENDOR BRIEFING SHEET MODAL */}
      <VendorBriefingModal
        open={openBriefingModal}
        onOpenChange={setOpenBriefingModal}
        vendors={vendors}
      />

      {/* PARTNER CATALOG 1-CLICK IMPORT MODAL */}
      <PartnerCatalogImportModal
        open={openCatalogModal}
        onOpenChange={setOpenCatalogModal}
        weddingId={weddingId}
        eventId={eventId}
        onImportSuccess={() => router.refresh()}
      />
    </div>
  );
}
