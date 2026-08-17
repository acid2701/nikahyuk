import { z } from "zod";

export const PaymentMilestoneInputSchema = z.object({
  milestoneName: z.string().min(1, "Nama termin pembayaran wajib diisi."),
  amount: z.number().min(0, "Nominal (IDR) harus lebih dari atau sama dengan 0."),
  dueDate: z.string().optional().nullable(),
  paidDate: z.string().optional().nullable(),
  alertDaysBefore: z.number().optional(),
  paymentStatus: z.enum(["unpaid", "paid"] as const).default("unpaid"),
  paidBy: z.enum(["groom", "bride", "joint"] as const).default("joint"),
});

export type PaymentMilestoneInput = z.infer<typeof PaymentMilestoneInputSchema>;

export const BudgetItemInputSchema = z.object({
  weddingId: z.string().uuid(),
  eventId: z.string().uuid(),
  categoryId: z.string().uuid().optional().nullable(),
  vendorId: z.string().uuid().optional().nullable(),
  itemName: z.string().min(1, "Nama pos anggaran wajib diisi."),
  estimatedCost: z.number().min(0, "Target anggaran harus lebih dari atau sama dengan 0."),
  targetPayer: z.enum(["groom", "bride", "joint"] as const).default("joint"),
  notes: z.string().optional().nullable(),
  milestones: z.array(PaymentMilestoneInputSchema).optional().default([]),
});

export type BudgetItemInput = z.infer<typeof BudgetItemInputSchema>;
