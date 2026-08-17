import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BudgetFormModal } from "@/components/modules/budget/budget-form-modal";
import { MilestoneTimeline } from "@/components/modules/budget/milestone-timeline";
import { evaluatePaymentDueDate } from "@/lib/utils/due-date-evaluator";
import { DollarSign, AlertCircle, CheckCircle, Wallet, ArrowRightLeft } from "lucide-react";

export default async function BudgetPage(props: { params: Promise<any> }) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("wedding_events")
    .select("id, event_name")
    .eq("wedding_id", weddingId);

  const activeEventId = events && events.length > 0 ? events[0].id : undefined;
  const eventIds = (events || []).map((e) => e.id);

  let budgetItems: any[] = [];
  if (eventIds.length > 0) {
    const { data: items } = await supabase
      .from("budget_items")
      .select("*, payment_milestones(*)")
      .in("event_id", eventIds)
      .order("created_at", { ascending: false });
    budgetItems = items || [];
  }

  let totalTargetAmount = 0;
  let totalPaidAmount = 0;
  let overdueMilestoneCount = 0;

  budgetItems.forEach((item) => {
    totalTargetAmount += Number(item.estimated_cost || 0);
    const milestones = item.payment_milestones || [];
    milestones.forEach((m: any) => {
      if (m.payment_status === "paid") {
        totalPaidAmount += Number(m.amount || 0);
      } else if (m.due_date) {
        const evalRes = evaluatePaymentDueDate(m.payment_status, m.due_date);
        if (evalRes.status === "OVERDUE") {
          overdueMilestoneCount++;
        }
      }
    });
  });

  const totalRemaining = Math.max(0, totalTargetAmount - totalPaidAmount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            Anggaran & Multiple Payment Milestones
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola pos biaya, termin pembayaran, dan lacak jatuh tempo secara real-time.
          </p>
        </div>
        <BudgetFormModal weddingId={weddingId} eventId={activeEventId} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Target Anggaran
            </CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono">
              Rp {totalTargetAmount.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Rencana pengeluaran total
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Terbayar (Paid)
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono text-emerald-600">
              Rp {totalPaidAmount.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Termin terbayar lunas
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Sisa Tagihan Belum Lunas
            </CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono text-amber-600">
              Rp {totalRemaining.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Kewajiban pembayaran mendatang
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Peringatan Terlewat (Overdue)
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono text-rose-600">
              {overdueMilestoneCount} Termin
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Melewati tanggal jatuh tempo
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {budgetItems.length === 0 ? (
          <Card className="border-dashed p-8 text-center space-y-3">
            <DollarSign className="h-10 w-10 text-muted-foreground mx-auto" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Belum Ada Pos Anggaran
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Klik tombol &apos;Tambah Pos Anggaran&apos; di atas untuk mencatat anggaran pertama Anda.
              </p>
            </div>
          </Card>
        ) : (
          budgetItems.map((item) => {
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

                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Target Anggaran</p>
                      <p className="font-mono font-bold text-base text-foreground">
                        Rp {Number(item.estimated_cost).toLocaleString("id-ID")}
                      </p>
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
    </div>
  );
}
