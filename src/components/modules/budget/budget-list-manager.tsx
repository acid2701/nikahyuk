"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MilestoneTimeline } from "@/components/modules/budget/milestone-timeline";
import { deleteBudgetItemAction } from "@/actions/budget-actions";
import { useToast } from "@/components/ui/use-toast";
import { DollarSign, Trash2, User, Users, Heart } from "lucide-react";

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
  const { toast } = useToast();

  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const filteredItems = items.filter((item) => {
    if (sideFilter === "all") return true;
    return item.target_payer === sideFilter;
  });

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

  async function handleDeleteItem(itemId: string, itemName: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus pos anggaran '${itemName}'?`)) {
      return;
    }

    try {
      await deleteBudgetItemAction(itemId, weddingId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      toast({
        title: "Pos Anggaran Dihapus",
        description: `Pos '${itemName}' berhasil dihapus.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Menghapus Pos Anggaran",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
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
        filteredItems.map((item) => {
          const milestones = item.payment_milestones || [];
          return (
            <Card key={item.id} className="border-border/80">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
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

                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">Target Anggaran</p>
                      <p className="font-mono font-bold text-base text-foreground">
                        Rp {Number(item.estimated_cost).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(item.id, item.item_name)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
        })
      )}
    </div>
  );
}
