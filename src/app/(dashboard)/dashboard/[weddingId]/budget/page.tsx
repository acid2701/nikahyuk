import { prisma } from "@/lib/prisma";
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

  const rawEvents = await prisma.weddingEvent.findMany({
    where: { weddingId },
    select: { id: true, eventName: true },
    orderBy: { createdAt: "asc" },
  });

  const events = rawEvents.map((e) => ({
    id: e.id,
    event_name: e.eventName,
  }));

  const { effectiveEventId, effectiveEventIds } = resolveEffectiveEventIds(
    urlEventId,
    events,
    allowedEventIds
  );

  const activeEvent =
    effectiveEventId
      ? events.find((e) => e.id === effectiveEventId)
      : null;

  const activeEventId = activeEvent?.id;
  const eventIds = effectiveEventIds;

  let rawItems: any[] = [];

  if (eventIds.length > 0) {
    rawItems = await prisma.budgetItem.findMany({
      where: { eventId: { in: eventIds } },
      include: {
        milestones: {
          include: {
            attachments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  const budgetItems = rawItems.map((item) => ({
    id: item.id,
    event_id: item.eventId,
    category_id: item.categoryId,
    vendor_id: item.vendorId,
    item_name: item.itemName,
    estimated_cost: Number(item.estimatedCost || 0),
    target_payer: item.targetPayer,
    notes: item.notes,
    created_at: item.createdAt.toISOString(),
    payment_milestones: item.milestones.map((m: any) => ({
      id: m.id,
      budget_item_id: m.budgetItemId,
      milestone_name: m.milestoneName,
      amount: Number(m.amount || 0),
      due_date: m.dueDate ? (m.dueDate instanceof Date ? m.dueDate.toISOString().split("T")[0] : String(m.dueDate)) : null,
      payment_status: m.paymentStatus,
      paid_at: m.paidAt ? m.paidAt.toISOString() : null,
      created_at: m.createdAt.toISOString(),
      payment_attachments: m.attachments.map((a: any) => ({
        id: a.id,
        milestone_id: a.milestoneId,
        file_name: a.documentTitle,
        file_url: a.r2FileKey,
        file_size: Number(a.fileSizeBytes),
        mime_type: a.mimeType,
        created_at: a.uploadedAt.toISOString(),
      })),
    })),
  }));

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
        <div className="space-y-1">
          <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Rencana Anggaran & Pembayaran
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Kelola pos biaya dan pantau pembayaran bertahap (DP s/d Pelunasan) untuk:{" "}
            <span className="font-semibold text-foreground">{activeEvent?.event_name || "Semua Acara"}</span>.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <BudgetPresetDialog weddingId={weddingId} eventId={activeEventId} />
          <BudgetFormModal weddingId={weddingId} eventId={activeEventId} />
        </div>
      </div>

      <div className="grid gap-3.5 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 hover:border-primary/40 hover:shadow-xs transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Target Anggaran
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <div className="text-lg sm:text-xl font-bold font-mono text-foreground truncate">
              Rp {totalTargetAmount.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Rencana pengeluaran total
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 hover:border-emerald-500/40 hover:shadow-xs transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Dana Terbayar
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <div className="text-lg sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 truncate">
              Rp {totalPaidAmount.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Termin terbayar lunas
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 hover:border-amber-500/40 hover:shadow-xs transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Sisa Tagihan
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <div className="text-lg sm:text-xl font-bold font-mono text-amber-600 dark:text-amber-400 truncate">
              Rp {totalRemaining.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Kewajiban mendatang
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 hover:border-rose-500/40 hover:shadow-xs transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Tagihan Jatuh Tempo
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <div className="text-lg sm:text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {overdueMilestoneCount} Tagihan
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Mendekati / lewat tempo
            </p>
          </CardContent>
        </Card>
      </div>

      <BudgetListManager weddingId={weddingId} initialItems={budgetItems} />
    </div>
  );
}
