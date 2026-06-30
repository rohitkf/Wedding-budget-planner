import { getDb } from "./client";
import { newId, nowIso } from "./ids";
import type { PricingModel, RefundStatus, Subcategory } from "@/lib/types";

interface SubcategoryRow {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  pricing_model: string;
  estimated_cost: number | null;
  actual_cost: number | null;
  estimated_rate: number | null;
  actual_rate: number | null;
  quantity: number | null;
  deposit_amount: number | null;
  deposit_refundable: number;
  refund_status: string | null;
  vendor_name: string | null;
  due_date: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function mapRow(row: SubcategoryRow): Subcategory {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description,
    pricingModel: row.pricing_model as PricingModel,
    estimatedCost: row.estimated_cost,
    actualCost: row.actual_cost,
    estimatedRate: row.estimated_rate,
    actualRate: row.actual_rate,
    quantity: row.quantity,
    depositAmount: row.deposit_amount,
    depositRefundable: !!row.deposit_refundable,
    refundStatus: row.refund_status as RefundStatus | null,
    vendorName: row.vendor_name,
    dueDate: row.due_date,
    notes: row.notes,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listSubcategories(categoryId?: string): Subcategory[] {
  const db = getDb();
  const rows = categoryId
    ? (db
        .prepare(
          "SELECT * FROM subcategories WHERE category_id = ? ORDER BY sort_order ASC, created_at ASC"
        )
        .all(categoryId) as unknown as SubcategoryRow[])
    : (db
        .prepare("SELECT * FROM subcategories ORDER BY sort_order ASC, created_at ASC")
        .all() as unknown as SubcategoryRow[]);
  return rows.map(mapRow);
}

export function getSubcategory(id: string): Subcategory | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM subcategories WHERE id = ?").get(id) as
    | SubcategoryRow
    | undefined;
  return row ? mapRow(row) : null;
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

export function createSubcategory(input: SubcategoryInput): Subcategory {
  const db = getDb();
  const id = newId();
  const now = nowIso();
  db.prepare(
    `INSERT INTO subcategories (
      id, category_id, name, description, pricing_model, estimated_cost, actual_cost,
      estimated_rate, actual_rate, quantity, deposit_amount, deposit_refundable, refund_status,
      vendor_name, due_date, notes, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.categoryId,
    input.name,
    input.description ?? null,
    input.pricingModel ?? "FIXED",
    input.estimatedCost ?? null,
    input.actualCost ?? null,
    input.estimatedRate ?? null,
    input.actualRate ?? null,
    input.quantity ?? null,
    input.depositAmount ?? null,
    input.depositRefundable ? 1 : 0,
    input.depositRefundable ? input.refundStatus ?? "PENDING" : null,
    input.vendorName ?? null,
    input.dueDate ?? null,
    input.notes ?? null,
    input.sortOrder ?? 0,
    now,
    now
  );
  return getSubcategory(id)!;
}

export function updateSubcategory(
  id: string,
  input: Partial<SubcategoryInput>
): Subcategory | null {
  const existing = getSubcategory(id);
  if (!existing) return null;
  const db = getDb();
  const now = nowIso();

  const depositRefundable =
    input.depositRefundable !== undefined ? input.depositRefundable : existing.depositRefundable;
  let refundStatus =
    input.refundStatus !== undefined ? input.refundStatus : existing.refundStatus;
  if (!depositRefundable) {
    refundStatus = null;
  } else if (!refundStatus) {
    refundStatus = "PENDING";
  }

  db.prepare(
    `UPDATE subcategories SET
      category_id = ?, name = ?, description = ?, pricing_model = ?, estimated_cost = ?,
      actual_cost = ?, estimated_rate = ?, actual_rate = ?, quantity = ?, deposit_amount = ?,
      deposit_refundable = ?, refund_status = ?, vendor_name = ?, due_date = ?, notes = ?,
      sort_order = ?, updated_at = ?
    WHERE id = ?`
  ).run(
    input.categoryId ?? existing.categoryId,
    input.name ?? existing.name,
    input.description !== undefined ? input.description : existing.description,
    input.pricingModel ?? existing.pricingModel,
    input.estimatedCost !== undefined ? input.estimatedCost : existing.estimatedCost,
    input.actualCost !== undefined ? input.actualCost : existing.actualCost,
    input.estimatedRate !== undefined ? input.estimatedRate : existing.estimatedRate,
    input.actualRate !== undefined ? input.actualRate : existing.actualRate,
    input.quantity !== undefined ? input.quantity : existing.quantity,
    input.depositAmount !== undefined ? input.depositAmount : existing.depositAmount,
    depositRefundable ? 1 : 0,
    refundStatus,
    input.vendorName !== undefined ? input.vendorName : existing.vendorName,
    input.dueDate !== undefined ? input.dueDate : existing.dueDate,
    input.notes !== undefined ? input.notes : existing.notes,
    input.sortOrder ?? existing.sortOrder,
    now,
    id
  );
  return getSubcategory(id);
}

export function deleteSubcategory(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM subcategories WHERE id = ?").run(id);
  return result.changes > 0;
}

export function setRefundStatus(id: string, status: RefundStatus): Subcategory | null {
  const db = getDb();
  const existing = getSubcategory(id);
  if (!existing) return null;
  db.prepare("UPDATE subcategories SET refund_status = ?, updated_at = ? WHERE id = ?").run(
    status,
    nowIso(),
    id
  );
  return getSubcategory(id);
}
