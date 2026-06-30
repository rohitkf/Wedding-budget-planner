import { listCategories } from "./db/categories";
import { listSubcategories } from "./db/subcategories";
import { listPayments } from "./db/payments";
import { listSavingsAccounts } from "./db/savingsAccounts";
import { listCreditCards } from "./db/creditCards";
import { getWeddingInfo } from "./db/weddingInfo";
import { computeSubcategory, computeCategoryTotals, computeDashboardSummary } from "./calculations";
import type { CategoryWithTotals, Payment, SubcategoryComputed } from "./types";

export interface ComputedData {
  weddingInfo: Awaited<ReturnType<typeof getWeddingInfo>>;
  categories: CategoryWithTotals[];
  subcategories: SubcategoryComputed[];
  payments: Payment[];
  savings: Awaited<ReturnType<typeof listSavingsAccounts>>;
  creditCards: Awaited<ReturnType<typeof listCreditCards>>;
}

/** Single place that assembles raw rows + the calculation engine into the data every page needs. */
export async function getComputedData(): Promise<ComputedData> {
  const weddingInfo = await getWeddingInfo();
  const categories = await listCategories();
  const allSubcategories = await listSubcategories();
  const allPayments = await listPayments();
  const savings = await listSavingsAccounts();
  const creditCards = await listCreditCards();

  const paymentsBySubcategory = new Map<string, Payment[]>();
  for (const p of allPayments) {
    const list = paymentsBySubcategory.get(p.subcategoryId) ?? [];
    list.push(p);
    paymentsBySubcategory.set(p.subcategoryId, list);
  }

  const subcategories: SubcategoryComputed[] = allSubcategories.map((sub) =>
    computeSubcategory(sub, paymentsBySubcategory.get(sub.id) ?? [], weddingInfo.expectedGuests)
  );

  const subsByCategory = new Map<string, SubcategoryComputed[]>();
  for (const sub of subcategories) {
    const list = subsByCategory.get(sub.categoryId) ?? [];
    list.push(sub);
    subsByCategory.set(sub.categoryId, list);
  }

  const categoriesWithTotals: CategoryWithTotals[] = categories.map((cat) =>
    computeCategoryTotals(cat, subsByCategory.get(cat.id) ?? [])
  );

  return {
    weddingInfo,
    categories: categoriesWithTotals,
    subcategories,
    payments: allPayments,
    savings,
    creditCards,
  };
}

export async function getDashboardSummary() {
  const data = await getComputedData();
  const summary = computeDashboardSummary(data.subcategories, data.savings, data.creditCards);
  return { ...data, summary };
}
