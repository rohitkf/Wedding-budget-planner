export type PricingModel = "FIXED" | "PER_GUEST" | "PER_UNIT";
export type ExpenseStatus = "NOT_STARTED" | "DEPOSIT_PAID" | "PARTIALLY_PAID" | "FULLY_PAID";
export type RefundStatus = "PENDING" | "REFUNDED";
export type SourceType = "SAVINGS" | "CREDIT_CARD";

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  pricingModel: PricingModel;
  estimatedCost: number | null;
  actualCost: number | null;
  estimatedRate: number | null;
  actualRate: number | null;
  quantity: number | null;
  depositAmount: number | null;
  depositRefundable: boolean;
  refundStatus: RefundStatus | null;
  vendorName: string | null;
  dueDate: string | null;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsAccount {
  id: string;
  name: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditCard {
  id: string;
  name: string;
  creditLimit: number;
  availableCredit: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  subcategoryId: string;
  sourceType: SourceType;
  savingsAccountId: string | null;
  creditCardId: string | null;
  amount: number;
  isDeposit: boolean;
  paidAt: string;
  createdAt: string;
}

export interface WeddingInfo {
  id: number;
  currency: string;
  weddingDate: string | null;
  expectedGuests: number;
  rsvpAccepted: number;
  rsvpDeclined: number;
  rsvpPending: number;
  actualAttendance: number | null;
  updatedAt: string;
}

// Computed (derived, never persisted) view of a subcategory
export interface SubcategoryComputed extends Subcategory {
  estimatedCostComputed: number;
  actualCostComputed: number;
  costBasis: number;
  totalPaid: number;
  remaining: number;
  status: ExpenseStatus;
  refundableHeld: number;
}

export interface CategoryWithTotals extends Category {
  subcategories: SubcategoryComputed[];
  totalEstimated: number;
  totalActual: number;
  totalPaid: number;
  totalRemaining: number;
}
