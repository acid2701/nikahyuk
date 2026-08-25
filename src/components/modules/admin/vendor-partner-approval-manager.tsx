"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTablePagination } from "@/components/shared/pagination/data-table-pagination";
import {
  approveVendorPartnerAction,
  suspendVendorPartnerAction,
} from "@/actions/vendor-partner-actions";
import { VendorPartnerItem } from "@/types/vendor-partner.types";
import { useToast } from "@/components/ui/use-toast";
import { WAButton } from "@/components/shared/whatsapp/wa-button";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Eye,
  ExternalLink,
  FileText,
  Clock,
  ShieldCheck,
  Search,
  Download,
  AlertTriangle,
  Ban,
  RefreshCw,
} from "lucide-react";

interface VendorPartnerApprovalManagerProps {
  initialPartners: VendorPartnerItem[];
}

export function VendorPartnerApprovalManager({ initialPartners }: VendorPartnerApprovalManagerProps) {
  const [partners, setPartners] = React.useState<VendorPartnerItem[]>(initialPartners);
  const [activeTab, setActiveTab] = React.useState<string>("approved");
  const [selectedPartner, setSelectedPartner] = React.useState<VendorPartnerItem | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  // Pagination States
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Modal States
  const [openDetailModal, setOpenDetailModal] = React.useState(false);
  const [openSuspendModal, setOpenSuspendModal] = React.useState(false);
  const [suspendReason, setSuspendReason] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    setPartners(initialPartners);
  }, [initialPartners]);

  // KPI Calculations
  const approvedCount = partners.filter((p) => p.status === "approved" || p.status === "pending").length;
  const suspendedCount = partners.filter((p) => p.status === "suspended" || p.status === "rejected").length;
  const totalCount = partners.length;

  // Filtered Partners
  const filteredPartners = React.useMemo(() => {
    return partners.filter((p) => {
      // 1. Tab Filter
      if (activeTab === "approved" && p.status === "suspended") return false;
      if (activeTab === "suspended" && p.status !== "suspended" && p.status !== "rejected") return false;

      // 2. Category Filter
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.company_name?.toLowerCase().includes(q);
        const matchCity = p.city?.toLowerCase().includes(q);
        const matchPic = p.pic_name?.toLowerCase().includes(q);
        const matchEmail = p.email?.toLowerCase().includes(q);
        if (!matchName && !matchCity && !matchPic && !matchEmail) return false;
      }

      return true;
    });
  }, [partners, activeTab, categoryFilter, searchQuery]);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, categoryFilter, searchQuery]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredPartners.length / pageSize) || 1;
  const paginatedPartners = filteredPartners.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  async function handleActivate(partner: VendorPartnerItem) {
    setLoading(true);
    try {
      await approveVendorPartnerAction(partner.id);
      toast({
        title: "Mitra Vendor Diaktifkan Kembali!",
        description: `'${partner.company_name}' tayang kembali di Katalog Publik NikahYuk.`,
        variant: "success",
      });
      setPartners((prev) =>
        prev.map((item) => (item.id === partner.id ? { ...item, status: "approved" } : item))
      );
      setOpenDetailModal(false);
    } catch (err) {
      toast({
        title: "Gagal Mengaktifkan Vendor",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSuspendSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPartner) return;
    setLoading(true);

    try {
      await suspendVendorPartnerAction(selectedPartner.id, suspendReason);
      toast({
        title: "Mitra Vendor Ditangguhkan (Suspended)",
        description: `Profil '${selectedPartner.company_name}' ditangguhkan dan ditarik dari katalog publik.`,
        variant: "default",
      });
      setPartners((prev) =>
        prev.map((item) =>
          item.id === selectedPartner.id
            ? { ...item, status: "suspended", rejection_reason: suspendReason }
            : item
        )
      );
      setOpenSuspendModal(false);
      setOpenDetailModal(false);
      setSuspendReason("");
    } catch (err) {
      toast({
        title: "Gagal Menangguhkan Vendor",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function exportToCSV() {
    const headers = ["No", "Nama Vendor", "Kategori", "Kota", "Provinsi", "PIC", "No WA", "Email", "Status"];
    const rows = filteredPartners.map((p, idx) => [
      idx + 1,
      `"${p.company_name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.city}"`,
      `"${p.province}"`,
      `"${p.pic_name}"`,
      `"${p.phone}"`,
      `"${p.email}"`,
      `"${p.status}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Mitra_Vendor_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* Header Bar & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> Manajemen Kemitraan & Suspend Vendor
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Vendor mendaftar instan 30-detik (Auto-Active). Admin dapat meninjau, mengendalikan, atau menangguhkan (suspend) vendor bermasalah.
          </p>
        </div>

        <Button
          onClick={exportToCSV}
          variant="outline"
          size="sm"
          className="gap-2 text-xs h-9 border-border hover:bg-muted font-semibold shrink-0"
        >
          <Download className="h-4 w-4 text-emerald-600" /> Export Laporan CSV
        </Button>
      </div>

      {/* 3 INFORMATIVE KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Active Approved Partners */}
        <Card className="border-border bg-emerald-500/5 border-emerald-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-emerald-700 flex items-center justify-between">
              <span>Mitra Vendor Aktif (Auto-Active)</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-600">
              {approvedCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Tayang di Katalog Publik</p>
          </CardContent>
        </Card>

        {/* KPI 2: Suspended Partners */}
        <Card className={`border-2 ${suspendedCount > 0 ? "border-rose-500/80 bg-rose-500/5 shadow-xs" : "border-border"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-rose-700 flex items-center justify-between">
              <span>Ditangguhkan (Suspended)</span>
              <Ban className="h-4 w-4 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-rose-600">
              {suspendedCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Ditarik dari Katalog Publik</p>
          </CardContent>
        </Card>

        {/* KPI 3: Total Partners */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Total Direktori Vendor</span>
              <Building2 className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {totalCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Terdaftar di Database</p>
          </CardContent>
        </Card>
      </div>

      {/* FILTER & TABS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40 p-3 rounded-lg border border-border/60">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="h-9 p-1 bg-background border border-border">
            <TabsTrigger value="approved" className="text-xs font-semibold gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Aktif ({approvedCount})
            </TabsTrigger>
            <TabsTrigger value="suspended" className="text-xs font-semibold gap-1.5">
              <Ban className="h-3.5 w-3.5 text-rose-500" /> Ditangguhkan ({suspendedCount})
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs font-semibold">
              Semua ({totalCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* Keyword Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari vendor, kota, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs bg-background"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 text-xs w-40 bg-background">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="Catering">🍱 Catering</SelectItem>
              <SelectItem value="Venue">🏛️ Venue & Gedung</SelectItem>
              <SelectItem value="Dekorasi">🌸 Dekorasi</SelectItem>
              <SelectItem value="MUA & Busana">💄 MUA & Busana</SelectItem>
              <SelectItem value="Dokumentasi">📷 Dokumentasi</SelectItem>
              <SelectItem value="Entertainment">🎵 Entertainment</SelectItem>
              <SelectItem value="Wedding Organizer">📋 WO</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* VENDORS TABLE WITH NUMBERING & PAGINATION */}
      {filteredPartners.length === 0 ? (
        <Card className="border-dashed p-8 text-center space-y-2">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-sm font-medium text-foreground">Tidak Ada Vendor Sesuai Filter</p>
          <p className="text-xs text-muted-foreground">
            Tidak ditemukan data vendor untuk status tab &apos;{activeTab}&apos; atau kata kunci pencarian tersebut.
          </p>
        </Card>
      ) : (
        <Card className="border-border/80 shadow-xs overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead className="w-14 text-center text-xs font-bold"># No.</TableHead>
                <TableHead className="text-xs font-semibold">Nama Vendor & Alamat Kota</TableHead>
                <TableHead className="text-xs font-semibold">Kategori</TableHead>
                <TableHead className="text-xs font-semibold">PIC & No. WhatsApp</TableHead>
                <TableHead className="text-xs font-semibold">Email Registrasi</TableHead>
                <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                <TableHead className="text-xs font-semibold text-right">Aksi Moderasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPartners.map((p, idx) => {
                const absoluteNumber = (currentPage - 1) * pageSize + idx + 1;
                const isSuspended = p.status === "suspended" || p.status === "rejected";

                return (
                  <TableRow key={p.id} className="hover:bg-muted/30">
                    <TableCell className="text-center font-mono font-bold text-xs text-muted-foreground">
                      {absoluteNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div>
                          <p className="font-serif font-bold text-sm text-foreground">{p.company_name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.city}, {p.province}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-foreground">{p.pic_name}</span>
                        {p.sanitized_phone && (
                          <WAButton
                            phone={p.sanitized_phone}
                            templateString="Halo {nama_vendor}, dari Tim Admin NikahYuk."
                            variables={{ nama_vendor: p.company_name }}
                            label="WA"
                            size="sm"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {p.email}
                    </TableCell>
                    <TableCell className="text-center">
                      {isSuspended ? (
                        <Badge variant="outline" className="text-rose-600 border-rose-300 text-[10px]">
                          🔴 Ditangguhkan
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-600 text-white text-[10px]">
                          🟢 Aktif (Auto-Approved)
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPartner(p);
                            setOpenDetailModal(true);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Tinjau Detail & Berkas R2"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {isSuspended ? (
                          <Button
                            size="sm"
                            onClick={() => handleActivate(p)}
                            disabled={loading}
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-2 font-semibold"
                            title="Aktifkan Kembali Vendor"
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Aktifkan
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPartner(p);
                              setOpenSuspendModal(true);
                            }}
                            disabled={loading}
                            className="h-7 text-xs text-rose-600 hover:bg-rose-50 border-rose-200 px-2 font-semibold"
                            title="Tangguhkan / Suspend Vendor"
                          >
                            <Ban className="h-3.5 w-3.5" /> Suspend
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* DATATABLE PAGINATION COMPONENT */}
          <div className="p-3 border-t border-border/60 bg-muted/20">
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredPartners.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </div>
        </Card>
      )}

      {/* DETAIL MODAL */}
      <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedPartner && (
            <div className="space-y-4">
              <DialogHeader className="pb-2 border-b border-border">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs uppercase">
                    {selectedPartner.category}
                  </Badge>
                  <Badge className="bg-primary/10 text-primary text-xs">
                    {selectedPartner.city}, {selectedPartner.province}
                  </Badge>
                </div>
                <DialogTitle className="font-serif text-2xl pt-2">
                  {selectedPartner.company_name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Email Registrasi: {selectedPartner.email}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 sm:grid-cols-2 bg-secondary/20 p-3 rounded-lg border border-border text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Status Kemitraan:</span>
                  <span className="font-semibold text-foreground">
                    {selectedPartner.status === "suspended" ? "Ditangguhkan Admin" : "Aktif Publik"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">PIC & WhatsApp:</span>
                  <div className="flex items-center space-x-1.5 pt-0.5">
                    <span className="font-medium">{selectedPartner.pic_name}</span>
                    {selectedPartner.sanitized_phone && (
                      <WAButton
                        phone={selectedPartner.sanitized_phone}
                        templateString="Halo {nama_vendor}, dari Admin NikahYuk."
                        variables={{ nama_vendor: selectedPartner.company_name }}
                        label="WA"
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              </div>

              {selectedPartner.rejection_reason && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-md text-xs space-y-1">
                  <span className="font-semibold text-rose-700 block flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Alasan Penangguhan / Suspend:
                  </span>
                  <p className="text-rose-900">{selectedPartner.rejection_reason}</p>
                </div>
              )}

              <div className="space-y-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider">Deskripsi Layanan</h4>
                <div className="p-3 rounded-md bg-background border border-border text-xs leading-relaxed whitespace-pre-line text-muted-foreground">
                  {selectedPartner.description || "Belum ada deskripsi terlampir."}
                </div>
              </div>

              {selectedPartner.pricelist_r2_key && (
                <div className="p-3 rounded-md bg-card border border-border flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">Brosur Pricelist Resmi (Cloudflare R2)</p>
                      <p className="text-[10px] text-muted-foreground">PDF Document</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="h-7 text-xs gap-1">
                    <a
                      href={`/api/storage/presign?key=${encodeURIComponent(selectedPartner.pricelist_r2_key)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" /> Lihat File
                    </a>
                  </Button>
                </div>
              )}

              <DialogFooter className="pt-2 border-t border-border">
                {selectedPartner.status === "suspended" ? (
                  <Button
                    onClick={() => handleActivate(selectedPartner)}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                  >
                    <RefreshCw className="h-4 w-4" /> Aktifkan Kembali Vendor
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setOpenSuspendModal(true);
                    }}
                    disabled={loading}
                    className="text-xs gap-1.5"
                  >
                    <Ban className="h-4 w-4" /> Suspend Vendor Ini
                  </Button>
                )}
                <Button variant="outline" onClick={() => setOpenDetailModal(false)} className="text-xs">
                  Tutup
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* SUSPEND REASON MODAL */}
      <Dialog open={openSuspendModal} onOpenChange={setOpenSuspendModal}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSuspendSubmit}>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-rose-600 flex items-center gap-2">
                <Ban className="h-5 w-5" /> Tangguhkan / Suspend Vendor
              </DialogTitle>
              <DialogDescription className="text-xs">
                Tangguhkan profil vendor <span className="font-semibold">{selectedPartner?.company_name}</span> dari katalog publik jika terjadi kesalahan atau laporan bermasalah.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3">
              <label className="text-xs font-medium text-foreground block mb-1">Alasan Penangguhan / Suspend</label>
              <textarea
                placeholder="Contoh: Laporan penipuan harga, spamming, atau kontak PIC tidak aktif..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                required
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenSuspendModal(false)}>
                Batal
              </Button>
              <Button type="submit" variant="destructive" disabled={loading}>
                {loading ? "Menangguhkan..." : "Tangguhkan Vendor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
