import { readStore, withStore } from "./store";
import { newId, nowIso } from "./ids";
import type { CreditCard } from "@/lib/types";

function sortByCreatedAt(cards: CreditCard[]): CreditCard[] {
  return [...cards].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function listCreditCards(): Promise<CreditCard[]> {
  const { creditCards } = await readStore();
  return sortByCreatedAt(creditCards);
}

export async function getCreditCard(id: string): Promise<CreditCard | null> {
  const { creditCards } = await readStore();
  return creditCards.find((c) => c.id === id) ?? null;
}

export async function createCreditCard(input: {
  name: string;
  creditLimit: number;
  availableCredit: number;
}): Promise<CreditCard> {
  return withStore((store) => {
    const now = nowIso();
    const card: CreditCard = {
      id: newId(),
      name: input.name,
      creditLimit: input.creditLimit,
      availableCredit: input.availableCredit,
      createdAt: now,
      updatedAt: now,
    };
    store.creditCards.push(card);
    return card;
  });
}

export async function updateCreditCard(
  id: string,
  input: { name?: string; creditLimit?: number; availableCredit?: number }
): Promise<CreditCard | null> {
  return withStore((store) => {
    const existing = store.creditCards.find((c) => c.id === id);
    if (!existing) return null;
    if (input.name !== undefined) existing.name = input.name;
    if (input.creditLimit !== undefined) existing.creditLimit = input.creditLimit;
    if (input.availableCredit !== undefined) existing.availableCredit = input.availableCredit;
    existing.updatedAt = nowIso();
    return existing;
  });
}

export async function adjustAvailableCredit(id: string, delta: number): Promise<CreditCard | null> {
  return withStore((store) => {
    const existing = store.creditCards.find((c) => c.id === id);
    if (!existing) return null;
    existing.availableCredit += delta;
    existing.updatedAt = nowIso();
    return existing;
  });
}

export async function deleteCreditCard(id: string): Promise<boolean> {
  return withStore((store) => {
    const inUse = store.payments.some((p) => p.creditCardId === id);
    if (inUse) throw new Error("Cannot delete a card that has recorded payments against it");
    const index = store.creditCards.findIndex((c) => c.id === id);
    if (index === -1) return false;
    store.creditCards.splice(index, 1);
    return true;
  });
}
