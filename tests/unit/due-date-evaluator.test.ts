import { describe, it, expect } from "vitest";
import { evaluatePaymentDueDate } from "@/lib/utils/due-date-evaluator";

describe("evaluatePaymentDueDate Unit Tests", () => {
  const baseToday = new Date("2026-08-20T00:00:00.000Z");

  it("should return PAID status with variant success when paymentStatus is paid", () => {
    const result = evaluatePaymentDueDate("paid", "2026-08-15", 7, baseToday);
    expect(result.status).toBe("PAID");
    expect(result.variant).toBe("success");
    expect(result.label).toBe("Lunas");
  });

  it("should return OVERDUE status with variant destructive when due date has passed", () => {
    const result = evaluatePaymentDueDate("unpaid", "2026-08-15", 7, baseToday);
    expect(result.status).toBe("OVERDUE");
    expect(result.variant).toBe("destructive");
    expect(result.daysDifference).toBe(5);
    expect(result.label).toBe("Terlewat 5 Hari");
  });

  it("should return UPCOMING status with variant warning when due date is within alert threshold", () => {
    const resultH3 = evaluatePaymentDueDate("unpaid", "2026-08-23", 7, baseToday);
    expect(resultH3.status).toBe("UPCOMING");
    expect(resultH3.variant).toBe("warning");
    expect(resultH3.label).toBe("H-3 Jatuh Tempo");

    const resultToday = evaluatePaymentDueDate("unpaid", "2026-08-20", 7, baseToday);
    expect(resultToday.status).toBe("UPCOMING");
    expect(resultToday.label).toBe("Jatuh Tempo Hari Ini");
  });

  it("should return NEUTRAL status with variant secondary when due date is far in future or missing", () => {
    const resultFuture = evaluatePaymentDueDate("unpaid", "2026-09-15", 7, baseToday);
    expect(resultFuture.status).toBe("NEUTRAL");
    expect(resultFuture.variant).toBe("secondary");
    expect(resultFuture.label).toBe("H-26");

    const resultNoDate = evaluatePaymentDueDate("unpaid", null, 7, baseToday);
    expect(resultNoDate.status).toBe("NEUTRAL");
    expect(resultNoDate.label).toBe("Belum Lunas");
  });
});
