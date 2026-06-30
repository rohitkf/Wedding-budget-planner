import type {
  Category,
  CreditCard,
  Payment,
  RefundStatus,
  SavingsAccount,
  SourceType,
  Subcategory,
  WeddingInfo,
} from "@/lib/types";
import type { DashboardSummary } from "@/lib/calculations";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface AppData {
  weddingInfo: WeddingInfo;
  categories: import("@/lib/types").CategoryWithTotals[];
  subcategories: import("@/lib/types").SubcategoryComputed[];
  payments: Payment[];
  savings: SavingsAccount[];
  creditCards: CreditCard[];
  summary: DashboardSummary;
}

export const api = {
  getAppData: () => apiFetch<AppData>("/api/summary"),

  createCategory: (input: { name: string }) =>
    apiFetch<Category>("/api/categories", { method: "POST", body: JSON.stringify(input) }),
  updateCategory: (id: string, input: { name?: string }) =>
    apiFetch<Category>(`/api/categories/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteCategory: (id: string) => apiFetch<void>(`/api/categories/${id}`, { method: "DELETE" }),

  createSubcategory: (input: Record<string, unknown>) =>
    apiFetch<Subcategory>("/api/subcategories", { method: "POST", body: JSON.stringify(input) }),
  updateSubcategory: (id: string, input: Record<string, unknown>) =>
    apiFetch<Subcategory>(`/api/subcategories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteSubcategory: (id: string) =>
    apiFetch<void>(`/api/subcategories/${id}`, { method: "DELETE" }),

  recordPayment: (
    subcategoryId: string,
    input: {
      amount: number;
      isDeposit?: boolean;
      splits: { sourceType: SourceType; savingsAccountId?: string | null; creditCardId?: string | null; amount: number }[];
    }
  ) =>
    apiFetch<Payment[]>(`/api/subcategories/${subcategoryId}/payments`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  deletePayment: (id: string) => apiFetch<void>(`/api/payments/${id}`, { method: "DELETE" }),

  setRefundStatus: (subcategoryId: string, status: RefundStatus, creditToSavingsAccountId?: string | null) =>
    apiFetch<Subcategory>(`/api/subcategories/${subcategoryId}/refund`, {
      method: "POST",
      body: JSON.stringify({ status, creditToSavingsAccountId }),
    }),

  createSavingsAccount: (input: { name: string; balance: number }) =>
    apiFetch<SavingsAccount>("/api/savings", { method: "POST", body: JSON.stringify(input) }),
  updateSavingsAccount: (id: string, input: { name?: string; balance?: number }) =>
    apiFetch<SavingsAccount>(`/api/savings/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteSavingsAccount: (id: string) => apiFetch<void>(`/api/savings/${id}`, { method: "DELETE" }),

  createCreditCard: (input: { name: string; creditLimit: number; availableCredit: number }) =>
    apiFetch<CreditCard>("/api/credit-cards", { method: "POST", body: JSON.stringify(input) }),
  updateCreditCard: (
    id: string,
    input: { name?: string; creditLimit?: number; availableCredit?: number }
  ) =>
    apiFetch<CreditCard>(`/api/credit-cards/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteCreditCard: (id: string) => apiFetch<void>(`/api/credit-cards/${id}`, { method: "DELETE" }),

  updateWeddingInfo: (input: Partial<Omit<WeddingInfo, "id" | "updatedAt">>) =>
    apiFetch<WeddingInfo>("/api/wedding-info", { method: "PATCH", body: JSON.stringify(input) }),
};
