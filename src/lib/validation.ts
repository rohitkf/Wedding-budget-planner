import { z } from "zod";

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  sortOrder: z.number().optional(),
});

export const pricingModelSchema = z.enum(["FIXED", "PER_GUEST", "PER_UNIT"]);

export const subcategoryInputSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional().nullable(),
  pricingModel: pricingModelSchema.default("FIXED"),
  estimatedCost: z.number().min(0).optional().nullable(),
  actualCost: z.number().min(0).optional().nullable(),
  estimatedRate: z.number().min(0).optional().nullable(),
  actualRate: z.number().min(0).optional().nullable(),
  quantity: z.number().min(0).optional().nullable(),
  depositAmount: z.number().min(0).optional().nullable(),
  depositRefundable: z.boolean().optional(),
  vendorName: z.string().trim().optional().nullable(),
  dueDate: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  sortOrder: z.number().optional(),
});

export const subcategoryUpdateSchema = subcategoryInputSchema.partial().extend({
  categoryId: z.string().min(1).optional(),
});

export const savingsAccountInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  balance: z.number(),
});

export const creditCardInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  creditLimit: z.number().min(0),
  availableCredit: z.number().min(0),
});

const paymentSplitSchema = z
  .object({
    sourceType: z.enum(["SAVINGS", "CREDIT_CARD"]),
    savingsAccountId: z.string().optional().nullable(),
    creditCardId: z.string().optional().nullable(),
    amount: z.number().positive("Split amount must be greater than 0"),
  })
  .refine(
    (s) => (s.sourceType === "SAVINGS" ? !!s.savingsAccountId : !!s.creditCardId),
    { message: "A source account/card must be selected for each split" }
  );

export const recordPaymentSchema = z
  .object({
    amount: z.number().positive("Amount must be greater than 0"),
    isDeposit: z.boolean().optional(),
    paidAt: z.string().optional(),
    splits: z.array(paymentSplitSchema).min(1, "At least one payment split is required"),
  })
  .refine(
    (data) => {
      const sum = data.splits.reduce((s, sp) => s + sp.amount, 0);
      return Math.abs(sum - data.amount) < 0.005;
    },
    { message: "Payment splits must add up exactly to the payment amount" }
  );

export const weddingInfoUpdateSchema = z.object({
  currency: z.string().trim().min(1).optional(),
  weddingDate: z.string().trim().optional().nullable(),
  expectedGuests: z.number().int().min(0).optional(),
  rsvpAccepted: z.number().int().min(0).optional(),
  rsvpDeclined: z.number().int().min(0).optional(),
  rsvpPending: z.number().int().min(0).optional(),
  actualAttendance: z.number().int().min(0).optional().nullable(),
});

export const refundActionSchema = z.object({
  status: z.enum(["PENDING", "REFUNDED"]),
  creditToSavingsAccountId: z.string().optional().nullable(),
});
