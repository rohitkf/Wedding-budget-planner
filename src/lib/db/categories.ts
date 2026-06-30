import { readStore, withStore } from "./store";
import { newId, nowIso } from "./ids";
import type { Category } from "@/lib/types";

function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt)
  );
}

export async function listCategories(): Promise<Category[]> {
  const { categories } = await readStore();
  return sortCategories(categories);
}

export async function getCategory(id: string): Promise<Category | null> {
  const { categories } = await readStore();
  return categories.find((c) => c.id === id) ?? null;
}

export async function createCategory(input: { name: string; sortOrder?: number }): Promise<Category> {
  return withStore((store) => {
    const now = nowIso();
    const category: Category = {
      id: newId(),
      name: input.name,
      sortOrder: input.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    store.categories.push(category);
    return category;
  });
}

export async function updateCategory(
  id: string,
  input: { name?: string; sortOrder?: number }
): Promise<Category | null> {
  return withStore((store) => {
    const existing = store.categories.find((c) => c.id === id);
    if (!existing) return null;
    if (input.name !== undefined) existing.name = input.name;
    if (input.sortOrder !== undefined) existing.sortOrder = input.sortOrder;
    existing.updatedAt = nowIso();
    return existing;
  });
}

export async function deleteCategory(id: string): Promise<boolean> {
  return withStore((store) => {
    const index = store.categories.findIndex((c) => c.id === id);
    if (index === -1) return false;
    store.categories.splice(index, 1);

    const removedSubcategoryIds = new Set(
      store.subcategories.filter((s) => s.categoryId === id).map((s) => s.id)
    );
    store.subcategories = store.subcategories.filter((s) => s.categoryId !== id);
    store.payments = store.payments.filter((p) => !removedSubcategoryIds.has(p.subcategoryId));
    return true;
  });
}
