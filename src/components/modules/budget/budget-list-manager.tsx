"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MilestoneTimeline } from "@/components/modules/budget/milestone-timeline";
import { DeleteBudgetItemModal } from "@/components/modules/budget/delete-budget-modal";
import { EditBudgetItemModal } from "@/components/modules/budget/edit-budget-modal";
import { DataTablePagination } from "@/components/shared/pagination/data-table-pagination";
import { DollarSign, Trash2, Edit, User, Users, Heart } from "lucide-react";

export interface BudgetItemData {
  id: string;
  item_name: string;
  estimated_cost: number;
  target_payer: "groom" | "bride" | "joint";
  notes?: string | null;
  payment_milestones: any[];
}

export interface BudgetListManagerProps {
  weddingId: string;
  initialItems: BudgetItemData[];
}

export function BudgetListManager({ weddingId, initialItems }: BudgetListManagerProps) {
  const [items, setItems] = React.useState<BudgetItemData[]>(initialItems);
  const [sideFilter, setSideFilter] = React.useState<"all" | "groom" | "bride" | "joint">("all");
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<BudgetItemData | null>(null);
  const [deletingItem, setDeletingItem] = React.useState<BudgetItemData | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const filteredItems = items.filter((item) => {
    if (sideFilter === "all") return true;
    return item.target_payer === sideFilter;
  });

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Calculate side totals for strict financial isolation
  const groomTotal = items
    .filter((i) => i.target_payer === "groom")
    .reduce((acc, i) => acc + Number(i.estimated_cost || 0), 0);

  const brideTotal = items
    .filter((i) => i.target_payer === "bride")
    .reduce((acc, i) => acc + Number(i.estimated_cost || 0), 0);

  const jointTotal = items
    .filter((i) => i.target_payer === "joint")
    .reduce((acc, i) => acc + Number(i.estimated_cost || 0), 0);

  function handleOpenEdit(item: BudgetItemData) {
    setEditingItem(item);
    setOpenEditModal(true);
  }

  function handleOpenDelete(item: BudgetItemData) {
    setDeletingItem(item);
    setOpenDeleteModal(true);
  }

  return (
    <div className="space-y-4">
      {/* Side Filter Tabs for Strict Financial Isolation */}
      <Tabs value={sideFilter} onValueChange={(val: any) => setSideFilter(val)} className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted/60">
          <TabsTrigger value="all" className="py-2 text-xs gap-1.5 font-medium">
            <DollarSign className="h-4 w-4 text-primary" />
            Semua Pihak ({items.length})
          </TabsTrigger>
          <TabsTrigger value="groom" className="py-2 text-xs gap-1.5 font-medium">
            <User className="h-4 w-4 text-blue-600" />
            Pria (Rp {groomTotal.toLocaleString("id-ID")})
          </TabsTrigger>
          <TabsTrigger value="bride" className="py-2 text-xs gap-1.5 font-medium">
            <Heart className="h-4 w-4 text-pink-600" />
            Wanita (Rp {brideTotal.toLocaleString("id-ID")})
          </TabsTrigger>
          <TabsTrigger value="joint" className="py-2 text-xs gap-1.5 font-medium">
            <Users className="h-4 w-4 text-emerald-600" />
            Bersama (Rp {jointTotal.toLocaleString("id-ID")})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* List of Budget Items */}
      {filteredItems.length === 0 ? (
        <Card className="border-dashed p-8 text-center space-y-3">
          <DollarSign className="h-10 w-10 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {sideFilter === "all"
                ? "Belum Ada Pos Anggaran"
                : `Tidak Ada Pos Anggaran Khusus ${
                    sideFilter === "groom"
                      ? "Pihak Pria"
                      : sideFilter === "bride"
                      ? "Pihak Wanita"
                      : "Pihak Bersama"
                  }`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Klik &apos;Seeder Presets Anggaran&apos; atau &apos;Tambah Pos Anggaran&apos; di atas.
            </p>
          </div>
        </Card>
      ) : (
        <>
        {paginatedItems.map((item, index) => {
          const milestones = item.payment_milestones || [];
          const globalIndex = (currentPage - 1) * pageSize + index + 1;
          return (
            <Card key={item.id} className="border-border/80">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        #{globalIndex}
                      </span>
                      <CardTitle className="text-base font-semibold">
                        {item.item_name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-semibold"
                      >
                        {item.target_payer === "groom"
                          ? "Pihak Pria"
                          : item.target_payer === "bride"
                          ? "Pihak Wanita"
                          : "Bersama"}
                      </Badge>
                    </div>
                    {item.notes && (
                      <CardDescription className="text-xs mt-1">
                        Catatan: {item.notes}
                      </CardDescription>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">Target Anggaran</p>
                      <p className="font-mono font-bold text-base text-foreground">
                        Rp {Number(item.estimated_cost).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 pl-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(item)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                        title="Edit Pos Anggaran"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDelete(item)}
                        className="h-8 w-8 text-destructive hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/50 shrink-0"
                        title="Hapus Pos Anggaran"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="border-t border-border/50 pt-3">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                  Riwayat Termin Pembayaran ({milestones.length} Termin):
                </h4>
                <MilestoneTimeline
                  weddingId={weddingId}
                  milestones={milestones as any}
                />
              </CardContent>
            </Card>
          );
        })}
        {totalPages > 1 && (
          <div className="pt-2">
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredItems.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
        </>
      )}

      {editingItem && (
        <EditBudgetItemModal
          open={openEditModal}
          onOpenChange={setOpenEditModal}
          weddingId={weddingId}
          item={editingItem}
        />
      )}

      {deletingItem && (
        <DeleteBudgetItemModal
          open={openDeleteModal}
          onOpenChange={setOpenDeleteModal}
          itemId={deletingItem.id}
          itemName={deletingItem.item_name}
          weddingId={weddingId}
        />
      )}
    </div>
  );
}
