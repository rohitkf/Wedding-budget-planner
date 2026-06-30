import { listCategories } from "./db/categories";
import { listSubcategories } from "./db/subcategories";
import { listPayments } from "./db/payments";
import { listSavingsAccounts } from "./db/savingsAccounts";
import { listCreditCards } from "./db/creditCards";
import { getWeddingInfo } from "./db/weddingInfo";
import { computeSubcategory, computeCategoryTotals, computeDashboardSummary } from "./calculations";
import type { CategoryWithTotals, Payment, SubcategoryComputed } from "./types";

export interface ComputedData {
  weddingInfo: ReturnType<typeof getWeddingInfo>;
  categories: CategoryWithTotals[];
  subcategories: SubcategoryComputed[];
  payments: Payment[];
  savings: ReturnType<typeof listSavingsAccounts>;
  creditCards: ReturnType<typeof listCreditCards>;
}

/** Single place that assembles raw rows + the calculation engine into the data every page needs. */
export function getComputedData(): ComputedData {
  const weddingInfo = getWeddingInfo();
  const categories = listCategories();
  const allSubcategories = listSubcategories();
  const allPayments = listPayments();
  const savings = listSavingsAccounts();
  const creditCards = listCreditCards();

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

export function getDashboardSummary() {
  const data = getComputedData();
  const summary = computeDashboardSummary(data.subcategories, data.savings, data.creditCards);
  return { ...data, summary };
}
