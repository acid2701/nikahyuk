import { createClient } from "@/lib/db/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetFormModal } from "@/components/modules/budget/budget-form-modal";
import { BudgetPresetDialog } from "@/components/modules/budget/budget-preset-dialog";
import { BudgetListManager } from "@/components/modules/budget/budget-list-manager";
import { evaluatePaymentDueDate } from "@/lib/utils/due-date-evaluator";
import { AlertCircle, CheckCircle, Wallet, ArrowRightLeft } from "lucide-react";
import {
  getCollaboratorSecurityContext,
  resolveEffectiveEventIds,
} from "@/lib/auth/collaborator-security";
import { AccessDeniedCard } from "@/components/shared/access-denied-card";

export default async function BudgetPage(props: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const searchParams = (await props.searchParams) || {};
  const urlEventId = searchParams.eventId as string | undefined;

  const { permissions, allowedEventIds } =
    await getCollaboratorSecurityContext(weddingId);

  if (!permissions.budget) {
    return <AccessDeniedCard moduleTitle="Anggaran & Pembayaran" weddingId={weddingId} />;
  }

  const db = await createClient();

  const { data: events } = await db
    .from("wedding_events")
    .select("id, event_name")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: true });

  const { effectiveEventId, effectiveEventIds } = resolveEffectiveEventIds(
    urlEventId,
    events || [],
    allowedEventIds
  );

  const activeEvent =
    effectiveEventId
      ? events?.find((e) => e.id === effectiveEventId)
      : null;

  const activeEventId = activeEvent?.id;
  const eventIds = effectiveEventIds;

  let budgetItems: any[] = [];


  if (eventIds.length > 0) {
    const { data: items } = await db
      .from("budget_items")
      .select("*, payment_milestones(*, payment_attachments(*))")
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
            Kelola pos biaya untuk: <span className="font-semibold text-primary">{activeEvent?.event_name || "Semua Acara"}</span>.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <BudgetPresetDialog weddingId={weddingId} eventId={activeEventId} />
          <BudgetFormModal weddingId={weddingId} eventId={activeEventId} />
        </div>
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

      <BudgetListManager weddingId={weddingId} initialItems={budgetItems} />
    </div>
  );
}
