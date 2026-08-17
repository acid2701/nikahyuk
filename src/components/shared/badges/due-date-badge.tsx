"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { evaluatePaymentDueDate } from "@/lib/utils/due-date-evaluator";
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DueDateBadgeProps {
  paymentStatus: "unpaid" | "paid";
  dueDateString?: string | null;
  alertDaysBefore?: number;
  className?: string;
}

export function DueDateBadge({
  paymentStatus,
  dueDateString,
  alertDaysBefore = 7,
  className,
}: DueDateBadgeProps) {
  const result = evaluatePaymentDueDate(
    paymentStatus,
    dueDateString,
    alertDaysBefore
  );

  const iconMap = {
    PAID: CheckCircle2,
    OVERDUE: AlertTriangle,
    UPCOMING: Clock,
    NEUTRAL: Clock,
  };

  const Icon = iconMap[result.status];

  return (
    <Badge
      variant={result.variant}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full transition-colors",
        result.status === "PAID" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        result.status === "OVERDUE" && "bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse",
        result.status === "UPCOMING" && "bg-amber-500/10 text-amber-600 border-amber-500/20",
        result.status === "NEUTRAL" && "bg-muted text-muted-foreground border-border",
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{result.label}</span>
    </Badge>
  );
}
