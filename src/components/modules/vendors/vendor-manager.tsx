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
} from "@/actions/vendor-actions";
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

export interface VendorDocumentItem {
  id: string;
  document_title: string;
  r2_file_key: string;
  file_size_bytes: number;
  mime_type: string;
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
  vendor_documents?: VendorDocumentItem[];
}

export interface VendorManagerProps {
  weddingId: string;
  eventId?: string;
  events?: { id: string; event_name: string }[];
  initialVendors: VendorItem[];
}

export function VendorManager({ weddingId, eventId, events = [], initialVendors }: VendorManagerProps) {
  const [vendors, setVendors] = React.useState<VendorItem[]>(initialVendors);
  const [openModal, setOpenModal] = React.useState(false);
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [editingVendor, setEditingVendor] = React.useState<VendorItem | null>(null);

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
  const [loading, setLoading] = React.useState(false);

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
  }

  function handleOpenEdit(vendor: VendorItem) {
    setEditingVendor(vendor);
    setVendorName(vendor.vendor_name || "");
    setCategory(vendor.category || "Catering");
    setPicName(vendor.pic_name || "");
    setContactNumber(vendor.sanitized_phone || "");
    setContractValue(vendor.contract_value ? String(vendor.contract_value) : "");
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
      });

      toast({
        title: "Vendor Berhasil Ditambahkan",
        description: `Vendor '${vendorName}' kategori ${category} tersimpan.`,
        variant: "success",
      });

      setOpenModal(false);
      resetForm();
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
      });

      toast({
        title: "Vendor Berhasil Diperbarui",
        description: `Perubahan rincian vendor '${vendorName}' tersimpan.`,
        variant: "success",
      });

      setOpenEditModal(false);
      setEditingVendor(null);
      resetForm();
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        {categoriesList.length > 0 && (
          <Tabs
            value={categoryFilter}
            onValueChange={(val) => {
              setCategoryFilter(val);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto"
          >
            <TabsList className="h-9 p-1 bg-muted/60">
              <TabsTrigger value="all" className="text-xs">
                Semua Kategori ({vendors.length})
              </TabsTrigger>
              {categoriesList.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="text-xs">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={resetForm} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Tambah Vendor Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form onSubmit={handleCreateVendor}>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Tambah Mitra Vendor</DialogTitle>
                <DialogDescription>
                  Catat rincian vendor, nilai kontrak, & kontak PIC.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3">
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
                    <label className="text-xs font-medium">Nilai Kontrak (IDR)</label>
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
          <DialogContent className="max-w-md">
            <form onSubmit={handleUpdateVendor}>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Edit Data Vendor</DialogTitle>
                <DialogDescription>
                  Perbarui nama, kategori layanan, nilai kontrak, atau nomor WhatsApp PIC.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3">
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
                    <label className="text-xs font-medium">Nilai Kontrak (IDR)</label>
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
          <Table>
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead className="w-12 text-center text-xs font-semibold">No.</TableHead>
                <TableHead className="text-xs font-semibold">Nama Vendor</TableHead>
                <TableHead className="text-xs font-semibold">Kategori</TableHead>
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

                return (
                  <React.Fragment key={v.id}>
                    <TableRow className="hover:bg-muted/30">
                      {/* Numbering Cell */}
                      <TableCell className="text-center font-mono font-semibold text-xs text-muted-foreground">
                        {globalIndex}
                      </TableCell>

                      {/* Vendor Name */}
                      <TableCell className="font-serif font-bold text-sm text-foreground">
                        {v.vendor_name}
                      </TableCell>

                      {/* Service Category */}
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                          {v.category}
                        </Badge>
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

                      {/* Action Buttons (Edit & Delete) */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(v)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Edit Data Vendor"
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
                        <TableCell colSpan={7} className="p-3">
                          <div className="space-y-3 bg-card p-3 rounded-lg border border-border/80 shadow-xs">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <FileText className="h-4 w-4 text-primary" />
                                Berkas Dokumen Kontrak ({docs.length} Berkas):
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
                                Unggah Kontrak Baru
                              </Button>
                            </div>

                            {activeUploadVendorId === v.id && (
                              <div className="p-2 border border-border rounded-lg bg-card shadow-xs">
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
                                Belum ada berkas dokumen kontrak terlampir untuk vendor ini.
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
    </div>
  );
}
