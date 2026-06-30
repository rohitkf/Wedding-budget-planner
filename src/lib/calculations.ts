import type {
  Category,
  CategoryWithTotals,
  CreditCard,
  ExpenseStatus,
  Payment,
  SavingsAccount,
  Subcategory,
  SubcategoryComputed,
} from "@/lib/types";

/**
 * Pure calculation engine. No I/O. Safe to import from both server (API routes)
 * and client (budget simulator) code so the math only ever lives in one place.
 */

export function computeSubcategoryCosts(
  sub: Pick<
    Subcategory,
    "pricingModel" | "estimatedCost" | "actualCost" | "estimatedRate" | "actualRate" | "quantity"
  >,
  guestCount: number
): { estimatedCostComputed: number; actualCostComputed: number } {
  switch (sub.pricingModel) {
    case "PER_GUEST": {
      const estimatedRate = sub.estimatedRate ?? 0;
      const actualRate = sub.actualRate ?? sub.estimatedRate ?? 0;
      return {
        estimatedCostComputed: estimatedRate * guestCount,
        actualCostComputed: actualRate * guestCount,
      };
    }
    case "PER_UNIT": {
      const qty = sub.quantity ?? 0;
      const estimatedRate = sub.estimatedRate ?? 0;
      const actualRate = sub.actualRate ?? sub.estimatedRate ?? 0;
      return {
        estimatedCostComputed: estimatedRate * qty,
        actualCostComputed: actualRate * qty,
      };
    }
    case "FIXED":
    default: {
      const estimatedCostComputed = sub.estimatedCost ?? 0;
      const actualCostComputed = sub.actualCost ?? estimatedCostComputed;
      return { estimatedCostComputed, actualCostComputed };
    }
  }
}

export function deriveStatus(totalPaid: number, costBasis: number, hasDeposit: boolean): ExpenseStatus {
  if (totalPaid <= 0) return "NOT_STARTED";
  if (totalPaid >= costBasis && costBasis > 0) return "FULLY_PAID";
  if (hasDeposit) return "DEPOSIT_PAID";
  return "PARTIALLY_PAID";
}

export function computeSubcategory(
  sub: Subcategory,
  payments: Payment[],
  guestCount: number
): SubcategoryComputed {
  const { estimatedCostComputed, actualCostComputed } = computeSubcategoryCosts(sub, guestCount);
  const costBasis = actualCostComputed;
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = costBasis - totalPaid;
  const hasDeposit = payments.some((p) => p.isDeposit);
  const status = deriveStatus(totalPaid, costBasis, hasDeposit);
  const refundableHeld = sub.depositRefundable && sub.refundStatus === "PENDING" ? sub.depositAmount ?? 0 : 0;

  return {
    ...sub,
    estimatedCostComputed,
    actualCostComputed,
    costBasis,
    totalPaid,
    remaining,
    status,
    refundableHeld,
  };
}

export function computeCategoryTotals(
  category: Category,
  subcategories: SubcategoryComputed[]
): CategoryWithTotals {
  return {
    ...category,
    subcategories,
    totalEstimated: subcategories.reduce((s, x) => s + x.estimatedCostComputed, 0),
    totalActual: subcategories.reduce((s, x) => s + x.actualCostComputed, 0),
    totalPaid: subcategories.reduce((s, x) => s + x.totalPaid, 0),
    totalRemaining: subcategories.reduce((s, x) => s + x.remaining, 0),
  };
}

export interface DashboardSummary {
  totalEstimatedBudget: number;
  totalActualSpending: number;
  totalPaid: number;
  remainingBudget: number;

  refundableDepositsTotal: number;
  refundableDepositsPending: number;
  refundableDepositsRefunded: number;

  weddingSpendInclusive: number; // View 1
  weddingSpendExclusive: number; // View 2

  savingsRemaining: number;
  creditLimitTotal: number;
  creditAvailable: number;
  creditUsed: number;
  combinedAvailableFunds: number;

  fixedCostTotal: number;
  variableCostTotal: number;

  overallWeddingCost: number;
}

export function computeDashboardSummary(
  subcategories: SubcategoryComputed[],
  savings: SavingsAccount[],
  creditCards: CreditCard[]
): DashboardSummary {
  const totalEstimatedBudget = subcategories.reduce((s, x) => s + x.estimatedCostComputed, 0);
  const totalActualSpending = subcategories.reduce((s, x) => s + x.actualCostComputed, 0);
  const totalPaid = subcategories.reduce((s, x) => s + x.totalPaid, 0);
  const remainingBudget = totalActualSpending - totalPaid;

  const refundableDepositsTotal = subcategories.reduce(
    (s, x) => s + (x.depositRefundable ? x.depositAmount ?? 0 : 0),
    0
  );
  const refundableDepositsPending = subcategories.reduce((s, x) => s + x.refundableHeld, 0);
  const refundableDepositsRefunded = refundableDepositsTotal - refundableDepositsPending;

  const savingsRemaining = savings.reduce((s, a) => s + a.balance, 0);
  const creditLimitTotal = creditCards.reduce((s, c) => s + c.creditLimit, 0);
  const creditAvailable = creditCards.reduce((s, c) => s + c.availableCredit, 0);
  const creditUsed = creditLimitTotal - creditAvailable;
  const combinedAvailableFunds = savingsRemaining + creditAvailable;

  const fixedCostTotal = subcategories.reduce(
    (s, x) => s + (x.pricingModel !== "PER_GUEST" ? x.actualCostComputed : 0),
    0
  );
  const variableCostTotal = subcategories.reduce(
    (s, x) => s + (x.pricingModel === "PER_GUEST" ? x.actualCostComputed : 0),
    0
  );

  return {
    totalEstimatedBudget,
    totalActualSpending,
    totalPaid,
    remainingBudget,
    refundableDepositsTotal,
    refundableDepositsPending,
    refundableDepositsRefunded,
    weddingSpendInclusive: totalActualSpending,
    weddingSpendExclusive: totalActualSpending - refundableDepositsTotal,
    savingsRemaining,
    creditLimitTotal,
    creditAvailable,
    creditUsed,
    combinedAvailableFunds,
    fixedCostTotal,
    variableCostTotal,
    overallWeddingCost: totalActualSpending - refundableDepositsTotal,
  };
}

/** Recomputes estimated totals for a hypothetical guest count, leaving stored data untouched. */
export function simulateGuestCount(
  subcategories: Pick<
    Subcategory,
    "pricingModel" | "estimatedCost" | "actualCost" | "estimatedRate" | "actualRate" | "quantity"
  >[],
  hypotheticalGuestCount: number
): { totalEstimated: number; totalActual: number } {
  let totalEstimated = 0;
  let totalActual = 0;
  for (const sub of subcategories) {
    const { estimatedCostComputed, actualCostComputed } = computeSubcategoryCosts(
      sub,
      hypotheticalGuestCount
    );
    totalEstimated += estimatedCostComputed;
    totalActual += actualCostComputed;
  }
  return { totalEstimated, totalActual };
}
