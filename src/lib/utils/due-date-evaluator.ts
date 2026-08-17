export type DueDateStatus = "PAID" | "OVERDUE" | "UPCOMING" | "NEUTRAL";

export interface DueDateEvaluationResult {
  status: DueDateStatus;
  daysDifference: number;
  label: string;
  variant: "success" | "destructive" | "warning" | "secondary";
}

export function evaluatePaymentDueDate(
  paymentStatus: "unpaid" | "paid",
  dueDateString?: string | null,
  alertDaysBefore: number = 7,
  currentDateOverride?: Date
): DueDateEvaluationResult {
  if (paymentStatus === "paid") {
    return {
      status: "PAID",
      daysDifference: 0,
      label: "Lunas",
      variant: "success",
    };
  }

  if (!dueDateString) {
    return {
      status: "NEUTRAL",
      daysDifference: 0,
      label: "Belum Lunas",
      variant: "secondary",
    };
  }

  const today = currentDateOverride
    ? new Date(currentDateOverride)
    : new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateString);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: "OVERDUE",
      daysDifference: Math.abs(diffDays),
      label: `Terlewat ${Math.abs(diffDays)} Hari`,
      variant: "destructive",
    };
  }

  if (diffDays <= alertDaysBefore) {
    return {
      status: "UPCOMING",
      daysDifference: diffDays,
      label:
        diffDays === 0
          ? "Jatuh Tempo Hari Ini"
          : `H-${diffDays} Jatuh Tempo`,
      variant: "warning",
    };
  }

  return {
    status: "NEUTRAL",
    daysDifference: diffDays,
    label: `H-${diffDays}`,
    variant: "secondary",
  };
}
