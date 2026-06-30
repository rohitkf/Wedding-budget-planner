import { getDb } from "./client";
import { newId, nowIso } from "./ids";
import type { CreditCard } from "@/lib/types";

interface Row {
  id: string;
  name: string;
  credit_limit: number;
  available_credit: number;
  created_at: string;
  updated_at: string;
}

function mapRow(row: Row): CreditCard {
  return {
    id: row.id,
    name: row.name,
    creditLimit: row.credit_limit,
    availableCredit: row.available_credit,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listCreditCards(): CreditCard[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM credit_cards ORDER BY created_at ASC")
    .all() as unknown as Row[];
  return rows.map(mapRow);
}

export function getCreditCard(id: string): CreditCard | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM credit_cards WHERE id = ?").get(id) as Row | undefined;
  return row ? mapRow(row) : null;
}

export function createCreditCard(input: {
  name: string;
  creditLimit: number;
  availableCredit: number;
}): CreditCard {
  const db = getDb();
  const id = newId();
  const now = nowIso();
  db.prepare(
    `INSERT INTO credit_cards (id, name, credit_limit, available_credit, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, input.name, input.creditLimit, input.availableCredit, now, now);
  return getCreditCard(id)!;
}

export function updateCreditCard(
  id: string,
  input: { name?: string; creditLimit?: number; availableCredit?: number }
): CreditCard | null {
  const existing = getCreditCard(id);
  if (!existing) return null;
  const db = getDb();
  const now = nowIso();
  db.prepare(
    `UPDATE credit_cards SET name = ?, credit_limit = ?, available_credit = ?, updated_at = ? WHERE id = ?`
  ).run(
    input.name ?? existing.name,
    input.creditLimit ?? existing.creditLimit,
    input.availableCredit ?? existing.availableCredit,
    now,
    id
  );
  return getCreditCard(id);
}

export function adjustAvailableCredit(id: string, delta: number): CreditCard | null {
  const existing = getCreditCard(id);
  if (!existing) return null;
  return updateCreditCard(id, { availableCredit: existing.availableCredit + delta });
}

export function deleteCreditCard(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM credit_cards WHERE id = ?").run(id);
  return result.changes > 0;
}
