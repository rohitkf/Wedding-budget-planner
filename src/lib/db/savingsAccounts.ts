import { getDb } from "./client";
import { newId, nowIso } from "./ids";
import type { SavingsAccount } from "@/lib/types";

interface Row {
  id: string;
  name: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

function mapRow(row: Row): SavingsAccount {
  return {
    id: row.id,
    name: row.name,
    balance: row.balance,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listSavingsAccounts(): SavingsAccount[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM savings_accounts ORDER BY created_at ASC")
    .all() as unknown as Row[];
  return rows.map(mapRow);
}

export function getSavingsAccount(id: string): SavingsAccount | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM savings_accounts WHERE id = ?").get(id) as
    | Row
    | undefined;
  return row ? mapRow(row) : null;
}

export function createSavingsAccount(input: { name: string; balance: number }): SavingsAccount {
  const db = getDb();
  const id = newId();
  const now = nowIso();
  db.prepare(
    `INSERT INTO savings_accounts (id, name, balance, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`
  ).run(id, input.name, input.balance, now, now);
  return getSavingsAccount(id)!;
}

export function updateSavingsAccount(
  id: string,
  input: { name?: string; balance?: number }
): SavingsAccount | null {
  const existing = getSavingsAccount(id);
  if (!existing) return null;
  const db = getDb();
  const now = nowIso();
  db.prepare(`UPDATE savings_accounts SET name = ?, balance = ?, updated_at = ? WHERE id = ?`).run(
    input.name ?? existing.name,
    input.balance ?? existing.balance,
    now,
    id
  );
  return getSavingsAccount(id);
}

export function adjustSavingsBalance(id: string, delta: number): SavingsAccount | null {
  const existing = getSavingsAccount(id);
  if (!existing) return null;
  return updateSavingsAccount(id, { balance: existing.balance + delta });
}

export function deleteSavingsAccount(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM savings_accounts WHERE id = ?").run(id);
  return result.changes > 0;
}
