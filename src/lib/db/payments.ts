import { getDb } from "./client";
import { newId, nowIso } from "./ids";
import type { Payment, SourceType } from "@/lib/types";
import { adjustSavingsBalance } from "./savingsAccounts";
import { adjustAvailableCredit } from "./creditCards";

interface Row {
  id: string;
  subcategory_id: string;
  source_type: string;
  savings_account_id: string | null;
  credit_card_id: string | null;
  amount: number;
  is_deposit: number;
  paid_at: string;
  created_at: string;
}

function mapRow(row: Row): Payment {
  return {
    id: row.id,
    subcategoryId: row.subcategory_id,
    sourceType: row.source_type as SourceType,
    savingsAccountId: row.savings_account_id,
    creditCardId: row.credit_card_id,
    amount: row.amount,
    isDeposit: !!row.is_deposit,
    paidAt: row.paid_at,
    createdAt: row.created_at,
  };
}

export function listPayments(subcategoryId?: string): Payment[] {
  const db = getDb();
  const rows = subcategoryId
    ? (db
        .prepare("SELECT * FROM payments WHERE subcategory_id = ? ORDER BY paid_at ASC")
        .all(subcategoryId) as unknown as Row[])
    : (db.prepare("SELECT * FROM payments ORDER BY paid_at ASC").all() as unknown as Row[]);
  return rows.map(mapRow);
}

export function getPayment(id: string): Payment | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM payments WHERE id = ?").get(id) as Row | undefined;
  return row ? mapRow(row) : null;
}

export interface PaymentSplitInput {
  sourceType: SourceType;
  savingsAccountId?: string | null;
  creditCardId?: string | null;
  amount: number;
  isDeposit?: boolean;
  paidAt?: string;
}

/** Records one or more payment splits against a subcategory, deducting the relevant source balances. */
export function recordPayments(subcategoryId: string, splits: PaymentSplitInput[]): Payment[] {
  const db = getDb();
  const created: Payment[] = [];

  db.exec("BEGIN");
  try {
    for (const split of splits) {
      const id = newId();
      const now = nowIso();
      db.prepare(
        `INSERT INTO payments (
          id, subcategory_id, source_type, savings_account_id, credit_card_id, amount, is_deposit, paid_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id,
        subcategoryId,
        split.sourceType,
        split.sourceType === "SAVINGS" ? split.savingsAccountId ?? null : null,
        split.sourceType === "CREDIT_CARD" ? split.creditCardId ?? null : null,
        split.amount,
        split.isDeposit ? 1 : 0,
        split.paidAt ?? now,
        now
      );

      if (split.sourceType === "SAVINGS" && split.savingsAccountId) {
        adjustSavingsBalance(split.savingsAccountId, -split.amount);
      } else if (split.sourceType === "CREDIT_CARD" && split.creditCardId) {
        adjustAvailableCredit(split.creditCardId, -split.amount);
      }

      created.push(getPayment(id)!);
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }

  return created;
}

/** Deletes a payment and restores the balance it was deducted from. */
export function deletePayment(id: string): boolean {
  const db = getDb();
  const payment = getPayment(id);
  if (!payment) return false;

  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM payments WHERE id = ?").run(id);
    if (payment.sourceType === "SAVINGS" && payment.savingsAccountId) {
      adjustSavingsBalance(payment.savingsAccountId, payment.amount);
    } else if (payment.sourceType === "CREDIT_CARD" && payment.creditCardId) {
      adjustAvailableCredit(payment.creditCardId, payment.amount);
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
  return true;
}
