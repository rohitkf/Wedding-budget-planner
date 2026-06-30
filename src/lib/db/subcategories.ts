import { readStore, withStore } from "./store";
import { newId, nowIso } from "./ids";
import type { PricingModel, RefundStatus, Subcategory } from "@/lib/types";

function sortSubcategories(subcategories: Subcategory[]): Subcategory[] {
  return [...subcategories].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt)
  );
}

export async function listSubcategories(categoryId?: string): Promise<Subcategory[]> {
  const { subcategories } = await readStore();
  const filtered = categoryId
    ? subcategories.filter((s) => s.categoryId === categoryId)
    : subcategories;
  return sortSubcategories(filtered);
}

export async function getSubcategory(id: string): Promise<Subcategory | null> {
  const { subcategories } = await readStore();
  return subcategories.find((s) => s.id === id) ?? null;
}

export interface SubcategoryInput {
  categoryId: string;
  name: string;
  description?: string | null;
  pricingModel?: PricingModel;
  estimatedCost?: number | null;
  actualCost?: number | null;
  estimatedRate?: number | null;
  actualRate?: number | null;
  quantity?: number | null;
  depositAmount?: number | null;
  depositRefundable?: boolean;
  refundStatus?: RefundStatus | null;
  vendorName?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  sortOrder?: number;
}

export async function createSubcategory(input: SubcategoryInput): Promise<Subcategory> {
  return withStore((store) => {
    const now = nowIso();
    const subcategory: Subcategory = {
      id: newId(),
      categoryId: input.categoryId,
      name: input.name,
      description: input.description ?? null,
      pricingModel: input.pricingModel ?? "FIXED",
      estimatedCost: input.estimatedCost ?? null,
      actualCost: input.actualCost ?? null,
      estimatedRate: input.estimatedRate ?? null,
      actualRate: input.actualRate ?? null,
      quantity: input.quantity ?? null,
      depositAmount: input.depositAmount ?? null,
      depositRefundable: input.depositRefundable ?? false,
      refundStatus: input.depositRefundable ? input.refundStatus ?? "PENDING" : null,
      vendorName: input.vendorName ?? null,
      dueDate: input.dueDate ?? null,
      notes: input.notes ?? null,
      sortOrder: input.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    store.subcategories.push(subcategory);
    return subcategory;
  });
}

export async function updateSubcategory(
  id: string,
  input: Partial<SubcategoryInput>
): Promise<Subcategory | null> {
  return withStore((store) => {
    const existing = store.subcategories.find((s) => s.id === id);
    if (!existing) return null;

    const depositRefundable =
      input.depositRefundable !== undefined ? input.depositRefundable : existing.depositRefundable;
    let refundStatus =
      input.refundStatus !== undefined ? input.refundStatus : existing.refundStatus;
    if (!depositRefundable) {
      refundStatus = null;
    } else if (!refundStatus) {
      refundStatus = "PENDING";
    }

    if (input.categoryId !== undefined) existing.categoryId = input.categoryId;
    if (input.name !== undefined) existing.name = input.name;
    if (input.description !== undefined) existing.description = input.description;
    if (input.pricingModel !== undefined) existing.pricingModel = input.pricingModel;
    if (input.estimatedCost !== undefined) existing.estimatedCost = input.estimatedCost;
    if (input.actualCost !== undefined) existing.actualCost = input.actualCost;
    if (input.estimatedRate !== undefined) existing.estimatedRate = input.estimatedRate;
    if (input.actualRate !== undefined) existing.actualRate = input.actualRate;
    if (input.quantity !== undefined) existing.quantity = input.quantity;
    if (input.depositAmount !== undefined) existing.depositAmount = input.depositAmount;
    existing.depositRefundable = depositRefundable;
    existing.refundStatus = refundStatus;
    if (input.vendorName !== undefined) existing.vendorName = input.vendorName;
    if (input.dueDate !== undefined) existing.dueDate = input.dueDate;
    if (input.notes !== undefined) existing.notes = input.notes;
    if (input.sortOrder !== undefined) existing.sortOrder = input.sortOrder;
    existing.updatedAt = nowIso();
    return existing;
  });
}

export async function deleteSubcategory(id: string): Promise<boolean> {
  return withStore((store) => {
    const index = store.subcategories.findIndex((s) => s.id === id);
    if (index === -1) return false;
    store.subcategories.splice(index, 1);
    store.payments = store.payments.filter((p) => p.subcategoryId !== id);
    return true;
  });
}

export async function setRefundStatus(id: string, status: RefundStatus): Promise<Subcategory | null> {
  return withStore((store) => {
    const existing = store.subcategories.find((s) => s.id === id);
    if (!existing) return null;
    existing.refundStatus = status;
    existing.updatedAt = nowIso();
    return existing;
  });
}
