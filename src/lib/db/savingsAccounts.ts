import { readStore, withStore } from "./store";
import { newId, nowIso } from "./ids";
import type { SavingsAccount } from "@/lib/types";

function sortByCreatedAt(accounts: SavingsAccount[]): SavingsAccount[] {
  return [...accounts].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function listSavingsAccounts(): Promise<SavingsAccount[]> {
  const { savingsAccounts } = await readStore();
  return sortByCreatedAt(savingsAccounts);
}

export async function getSavingsAccount(id: string): Promise<SavingsAccount | null> {
  const { savingsAccounts } = await readStore();
  return savingsAccounts.find((a) => a.id === id) ?? null;
}

export async function createSavingsAccount(input: {
  name: string;
  balance: number;
}): Promise<SavingsAccount> {
  return withStore((store) => {
    const now = nowIso();
    const account: SavingsAccount = {
      id: newId(),
      name: input.name,
      balance: input.balance,
      createdAt: now,
      updatedAt: now,
    };
    store.savingsAccounts.push(account);
    return account;
  });
}

export async function updateSavingsAccount(
  id: string,
  input: { name?: string; balance?: number }
): Promise<SavingsAccount | null> {
  return withStore((store) => {
    const existing = store.savingsAccounts.find((a) => a.id === id);
    if (!existing) return null;
    if (input.name !== undefined) existing.name = input.name;
    if (input.balance !== undefined) existing.balance = input.balance;
    existing.updatedAt = nowIso();
    return existing;
  });
}

export async function adjustSavingsBalance(id: string, delta: number): Promise<SavingsAccount | null> {
  return withStore((store) => {
    const existing = store.savingsAccounts.find((a) => a.id === id);
    if (!existing) return null;
    existing.balance += delta;
    existing.updatedAt = nowIso();
    return existing;
  });
}

export async function deleteSavingsAccount(id: string): Promise<boolean> {
  return withStore((store) => {
    const inUse = store.payments.some((p) => p.savingsAccountId === id);
    if (inUse) throw new Error("Cannot delete an account that has recorded payments against it");
    const index = store.savingsAccounts.findIndex((a) => a.id === id);
    if (index === -1) return false;
    store.savingsAccounts.splice(index, 1);
    return true;
  });
}
