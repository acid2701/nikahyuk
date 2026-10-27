"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ConfirmDeleteDialog } from "@/components/shared/modal/confirm-delete-dialog";
import { DataTablePagination } from "@/components/shared/pagination/data-table-pagination";
import { createGiftLogAction, updateGiftLogAction, deleteGiftLogAction } from "@/actions/gift-actions";
import { useToast } from "@/components/ui/use-toast";
import { EventSideEnum, GiftTypeEnum } from "@/types/database.types";
import { Plus, Search, Trash2, Edit, Gift, DollarSign, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface GiftLogItem {
  id: string;
  giver_name: string;
  gift_type: GiftTypeEnum;
  amount: number;
  item_description?: string | null;
  giver_side: EventSideEnum;
  notes?: string | null;
  created_at: string;
}

export interface GiftManagerProps {
  weddingId: string;
  eventId: string;
  initialGifts: GiftLogItem[];
}

export function GiftManager({ weddingId, eventId, initialGifts }: GiftManagerProps) {
  const [gifts, setGifts] = React.useState<GiftLogItem[]>(initialGifts);
  const [search, setSearch] = React.useState("");
  const [sideFilter, setSideFilter] = React.useState<string>("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

  const [openModal, setOpenModal] = React.useState(false);
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [editingGift, setEditingGift] = React.useState<GiftLogItem | null>(null);

  // Form state
  const [giverName, setGiverName] = React.useState("");
  const [giftType, setGiftType] = React.useState<GiftTypeEnum>("cash");
  const [amount, setAmount] = React.useState("0");
  const [itemDescription, setItemDescription] = React.useState("");
  const [giverSide, setGiverSide] = React.useState<EventSideEnum>("joint");
  const [notes, setNotes] = React.useState("");

  const [loading, setLoading] = React.useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Delete Modal state
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    setGifts(initialGifts);
  }, [initialGifts]);

  function resetForm() {
    setGiverName("");
    setGiftType("cash");
    setAmount("0");
    setItemDescription("");
    setGiverSide("joint");
    setNotes("");
  }

  function handleOpenEdit(gift: GiftLogItem) {
    setEditingGift(gift);
    setGiverName(gift.giver_name);
    setGiftType(gift.gift_type);
    setAmount(String(gift.amount || 0));
    setItemDescription(gift.item_description || "");
    setGiverSide(gift.giver_side);
    setNotes(gift.notes || "");
    setOpenEditModal(true);
  }

  const filteredGifts = gifts.filter((g) => {
    const matchesSearch =
      g.giver_name.toLowerCase().includes(search.toLowerCase()) ||
      (g.item_description && g.item_description.toLowerCase().includes(search.toLowerCase())) ||
      (g.notes && g.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesSide = sideFilter === "all" || g.giver_side === sideFilter;
    const matchesType = typeFilter === "all" || g.gift_type === typeFilter;

    return matchesSearch && matchesSide && matchesType;
  });

  const totalItems = filteredGifts.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedGifts = filteredGifts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  let totalCashAmount = 0;
  let totalPhysicalItemsCount = 0;

  gifts.forEach((g) => {
    if (g.gift_type === "cash") {
      totalCashAmount += g.amount || 0;
    } else {
      totalPhysicalItemsCount++;
    }
  });

  async function handleCreateGift(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await createGiftLogAction({
        weddingId,
        eventId,
        giverName,
        giftType,
        amount: Number(amount) || 0,
        itemDescription,
        giverSide,
        notes,
      });

      toast({
        title: "Kado/Angpao Berhasil Dicatat",
        description: `Pencatatan atas nama '${giverName}' tersimpan.`,
        variant: "success",
      });

      setOpenModal(false);
      resetForm();
    } catch (err) {
      toast({
        title: "Gagal Mencatat Kado",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateGift(e: React.FormEvent) {
    e.preventDefault();
    if (!editingGift) return;

    setLoading(true);

    try {
      await updateGiftLogAction(editingGift.id, weddingId, {
        giverName,
        giftType,
        amount: Number(amount) || 0,
        itemDescription,
        giverSide,
        notes,
      });

      toast({
        title: "Data Kado Diperbarui",
        description: `Perubahan catatan '${giverName}' tersimpan.`,
        variant: "success",
      });

      setOpenEditModal(false);
      setEditingGift(null);
      resetForm();
    } catch (err) {
      toast({
        title: "Gagal Memperbarui Catatan",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      await deleteGiftLogAction(deleteTarget.id, weddingId);
      toast({
        title: "Catatan Kado Dihapus",
        description: `Catatan kado '${deleteTarget.name}' berhasil dihapus.`,
        variant: "success",
      });
      setDeleteTarget(null);
    } catch (err) {
      toast({
        title: "Gagal Menghapus Catatan",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Catatan Kado?"
        description="Tindakan ini akan menghapus catatan kado / angpao dari rekapitulasi."
        itemName={deleteTarget?.name}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
      />

      {/* KPI STATS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Uang Angpao / Cash
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-600">
              Rp {totalCashAmount.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Rekapitulasi total angpao tunai & transfer
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Kado Fisik / Barang
            </CardTitle>
            <Package className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-sky-600">
              {totalPhysicalItemsCount} Kado
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Jumlah barang / kado fisik yang diterima
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Entri Kado Terdaftar
            </CardTitle>
            <Gift className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {gifts.length} Catatan
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Semua hadiah masuk dari pihak Pria & Wanita
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FILTER BAR & ADD MODAL */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Cari pemberi kado / barang..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select
            value={sideFilter}
            onValueChange={(v) => {
              setSideFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-xs w-36">
              <SelectValue placeholder="Pihak..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Pihak</SelectItem>
              <SelectItem value="groom">Pihak Pria</SelectItem>
              <SelectItem value="bride">Pihak Wanita</SelectItem>
              <SelectItem value="joint">Bersama (Joint)</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-xs w-36">
              <SelectValue placeholder="Jenis..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              <SelectItem value="cash">Cash / Money</SelectItem>
              <SelectItem value="item">Kado Barang</SelectItem>
              <SelectItem value="voucher">Voucher</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={resetForm} className="gap-2 h-9 text-xs">
              <Plus className="h-4 w-4" />
              Catat Kado Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form onSubmit={handleCreateGift}>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Catat Kado / Angpao Masuk</DialogTitle>
                <DialogDescription>
                  Penerimaan angpao tunai atau kado fisik dari tamu undangan.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Nama Pemberi Kado</label>
                  <Input
                    type="text"
                    placeholder="e.g. Bapak H. Slamet & Keluarga"
                    value={giverName}
                    onChange={(e) => setGiverName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Jenis Kado</label>
                    <Select value={giftType} onValueChange={(v: any) => setGiftType(v)}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Angpao Cash / Money</SelectItem>
                        <SelectItem value="item">Kado Fisik / Barang</SelectItem>
                        <SelectItem value="voucher">Voucher Belanja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Atribusi Pihak</label>
                    <Select value={giverSide} onValueChange={(v: any) => setGiverSide(v)}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="groom">Pihak Pria (Groom)</SelectItem>
                        <SelectItem value="bride">Pihak Wanita (Bride)</SelectItem>
                        <SelectItem value="joint">Bersama (Joint)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {giftType === "cash" ? (
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nominal Angpao (Rp)</label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Deskripsi Kado Barang</label>
                    <Input
                      type="text"
                      placeholder="e.g. Microwave Samsung 24L / Logam Mulia 5gr"
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium">Catatan Tambahan</label>
                  <Input
                    type="text"
                    placeholder="e.g. Diserahkan saat resepsi"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Catatan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* EDIT MODAL */}
        <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
          <DialogContent className="max-w-md">
            <form onSubmit={handleUpdateGift}>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Edit Catatan Kado</DialogTitle>
                <DialogDescription>
                  Perbarui rincian pemberi, jenis kado, nominal, atau atribusi pihak.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Nama Pemberi Kado</label>
                  <Input
                    type="text"
                    placeholder="e.g. Bapak H. Slamet & Keluarga"
                    value={giverName}
                    onChange={(e) => setGiverName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Jenis Kado</label>
                    <Select value={giftType} onValueChange={(v: any) => setGiftType(v)}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Angpao Cash / Money</SelectItem>
                        <SelectItem value="item">Kado Fisik / Barang</SelectItem>
                        <SelectItem value="voucher">Voucher Belanja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Atribusi Pihak</label>
                    <Select value={giverSide} onValueChange={(v: any) => setGiverSide(v)}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="groom">Pihak Pria (Groom)</SelectItem>
                        <SelectItem value="bride">Pihak Wanita (Bride)</SelectItem>
                        <SelectItem value="joint">Bersama (Joint)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {giftType === "cash" ? (
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nominal Angpao (Rp)</label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Deskripsi Kado Barang</label>
                    <Input
                      type="text"
                      placeholder="e.g. Microwave Samsung 24L / Logam Mulia 5gr"
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium">Catatan Tambahan</label>
                  <Input
                    type="text"
                    placeholder="e.g. Diserahkan saat resepsi"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
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

      {/* TABLE DATA */}
      {filteredGifts.length === 0 ? (
        <Card className="border-dashed p-8 text-center space-y-3">
          <Gift className="h-10 w-10 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm font-medium text-foreground">Tidak Ada Catatan Kado Ditemukan</p>
            <p className="text-xs text-muted-foreground mt-1">
              Klik &apos;Catat Kado Baru&apos; di atas untuk merekapitulasi angpao & kado fisik.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="border-border/80 shadow-xs overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead className="w-12 text-center text-xs font-semibold">No.</TableHead>
                <TableHead className="text-xs font-semibold">Pemberi Kado</TableHead>
                <TableHead className="text-xs font-semibold">Pihak</TableHead>
                <TableHead className="text-xs font-semibold">Jenis & Rincian Hadiah</TableHead>
                <TableHead className="text-xs font-semibold text-right">Nilai / Nominal</TableHead>
                <TableHead className="text-xs font-semibold text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedGifts.map((g, index) => {
                const globalIndex = (currentPage - 1) * pageSize + index + 1;

                return (
                  <TableRow key={g.id} className="hover:bg-muted/30">
                    <TableCell className="text-center font-mono font-semibold text-xs text-muted-foreground">
                      {globalIndex}
                    </TableCell>

                    <TableCell className="text-xs">
                      <p className="font-bold text-foreground">{g.giver_name}</p>
                      {g.notes && <p className="text-[11px] text-muted-foreground">{g.notes}</p>}
                    </TableCell>

                    <TableCell className="text-xs">
                      <Badge
                        variant="outline"
                        className={
                          g.giver_side === "groom"
                            ? "border-blue-500/40 text-blue-600 bg-blue-50/50"
                            : g.giver_side === "bride"
                            ? "border-pink-500/40 text-pink-600 bg-pink-50/50"
                            : "border-slate-500/40 text-slate-700 bg-slate-50/50 dark:text-slate-300 dark:bg-slate-900/40"
                        }
                      >
                        {g.giver_side === "groom"
                          ? "Pria"
                          : g.giver_side === "bride"
                          ? "Wanita"
                          : "Bersama"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs">
                      <div className="flex items-center space-x-1.5">
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          {g.gift_type}
                        </Badge>
                        <span className="font-medium text-foreground">
                          {g.gift_type === "cash"
                            ? "Angpao Tunai"
                            : g.item_description || "Kado Fisik"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-mono font-bold text-xs text-emerald-600">
                      {g.gift_type === "cash" ? `Rp ${(g.amount || 0).toLocaleString("id-ID")}` : "-"}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(g)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit Catatan"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget({ id: g.id, name: g.giver_name })}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

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
