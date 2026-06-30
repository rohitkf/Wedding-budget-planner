import { readStore, withStore } from "./store";
import { newId, nowIso } from "./ids";
import type { Payment, SourceType } from "@/lib/types";

function sortByPaidAt(payments: Payment[]): Payment[] {
  return [...payments].sort((a, b) => a.paidAt.localeCompare(b.paidAt));
}

export async function listPayments(subcategoryId?: string): Promise<Payment[]> {
  const { payments } = await readStore();
  const filtered = subcategoryId ? payments.filter((p) => p.subcategoryId === subcategoryId) : payments;
  return sortByPaidAt(filtered);
}

export async function getPayment(id: string): Promise<Payment | null> {
  const { payments } = await readStore();
  return payments.find((p) => p.id === id) ?? null;
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
export async function recordPayments(
  subcategoryId: string,
  splits: PaymentSplitInput[]
): Promise<Payment[]> {
  return withStore((store) => {
    const created: Payment[] = [];
    for (const split of splits) {
      const now = nowIso();
      const payment: Payment = {
        id: newId(),
        subcategoryId,
        sourceType: split.sourceType,
        savingsAccountId: split.sourceType === "SAVINGS" ? split.savingsAccountId ?? null : null,
        creditCardId: split.sourceType === "CREDIT_CARD" ? split.creditCardId ?? null : null,
        amount: split.amount,
        isDeposit: !!split.isDeposit,
        paidAt: split.paidAt ?? now,
        createdAt: now,
      };
      store.payments.push(payment);

      if (split.sourceType === "SAVINGS" && split.savingsAccountId) {
        const account = store.savingsAccounts.find((a) => a.id === split.savingsAccountId);
        if (account) {
          account.balance -= split.amount;
          account.updatedAt = now;
        }
      } else if (split.sourceType === "CREDIT_CARD" && split.creditCardId) {
        const card = store.creditCards.find((c) => c.id === split.creditCardId);
        if (card) {
          card.availableCredit -= split.amount;
          card.updatedAt = now;
        }
      }

      created.push(payment);
    }
    return created;
  });
}

/** Deletes a payment and restores the balance it was deducted from. */
export async function deletePayment(id: string): Promise<boolean> {
  return withStore((store) => {
    const index = store.payments.findIndex((p) => p.id === id);
    if (index === -1) return false;
    const [payment] = store.payments.splice(index, 1);
    const now = nowIso();

    if (payment.sourceType === "SAVINGS" && payment.savingsAccountId) {
      const account = store.savingsAccounts.find((a) => a.id === payment.savingsAccountId);
      if (account) {
        account.balance += payment.amount;
        account.updatedAt = now;
      }
    } else if (payment.sourceType === "CREDIT_CARD" && payment.creditCardId) {
      const card = store.creditCards.find((c) => c.id === payment.creditCardId);
      if (card) {
        card.availableCredit += payment.amount;
        card.updatedAt = now;
      }
    }
    return true;
  });
}
