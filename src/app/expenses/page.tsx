"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { StatusBadge, RefundBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/currency";
import type { SubcategoryComputed } from "@/lib/types";
import { Download, Search } from "lucide-react";

type SortField = "name" | "estimated" | "actual" | "paid" | "remaining" | "dueDate";

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate).getTime() < new Date(new Date().toDateString()).getTime();
}

export default function ExpensesPage() {
  const { data, isLoading, error } = useAppData();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("actual");

  const filteredSorted = useMemo(() => {
    if (!data) return [];
    let list = data.subcategories;
    if (categoryFilter) list = list.filter((s) => s.categoryId === categoryFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || (s.vendorName ?? "").toLowerCase().includes(q)
      );
    }
    const sorted = [...list].sort((a, b) => {
      switch (sortField) {
        case "name":
          return a.name.localeCompare(b.name);
        case "estimated":
          return b.estimatedCostComputed - a.estimatedCostComputed;
        case "paid":
          return b.totalPaid - a.totalPaid;
        case "remaining":
          return b.remaining - a.remaining;
        case "dueDate":
          return (a.dueDate ?? "9999-99-99").localeCompare(b.dueDate ?? "9999-99-99");
        case "actual":
        default:
          return b.actualCostComputed - a.actualCostComputed;
      }
    });
    return sorted;
  }, [data, search, categoryFilter, sortField]);

  if (isLoading) {
    return <p className="text-sm text-foreground/50">Loading expense tracking...</p>;
  }
  if (error || !data) {
    return <p className="text-sm text-red-500">Failed to load expense tracking.</p>;
  }

  const { categories, subcategories, payments, savings, creditCards, weddingInfo } = data;
  const currency = weddingInfo.currency;
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

  const withDueDate = subcategories.filter((s) => s.dueDate && s.remaining > 0.005);
  const overdue = withDueDate.filter((s) => isOverdue(s.dueDate)).sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
  const upcoming = withDueDate.filter((s) => !isOverdue(s.dueDate)).sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));

  const largestExpenses = [...subcategories].sort((a, b) => b.actualCostComputed - a.actualCostComputed).slice(0, 8);

  const refundableDeposits = subcategories.filter((s) => s.depositRefundable && (s.depositAmount ?? 0) > 0);
  const pendingRefunds = refundableDeposits.filter((s) => s.refundStatus === "PENDING");

  const vendorTotals = new Map<string, { totalEstimated: number; totalActual: number; totalPaid: number }>();
  for (const s of subcategories) {
    const key = s.vendorName?.trim() || "No vendor specified";
    const existing = vendorTotals.get(key) ?? { totalEstimated: 0, totalActual: 0, totalPaid: 0 };
    existing.totalEstimated += s.estimatedCostComputed;
    existing.totalActual += s.actualCostComputed;
    existing.totalPaid += s.totalPaid;
    vendorTotals.set(key, existing);
  }
  const vendorRows = [...vendorTotals.entries()].sort((a, b) => b[1].totalActual - a[1].totalActual);

  const sourceNameById = new Map<string, string>();
  for (const s of savings) sourceNameById.set(`SAVINGS:${s.id}`, s.name);
  for (const c of creditCards) sourceNameById.set(`CREDIT_CARD:${c.id}`, c.name);
  const paymentMethodTotals = new Map<string, number>();
  for (const p of payments) {
    const key = p.sourceType === "SAVINGS" ? `SAVINGS:${p.savingsAccountId}` : `CREDIT_CARD:${p.creditCardId}`;
    paymentMethodTotals.set(key, (paymentMethodTotals.get(key) ?? 0) + p.amount);
  }
  const paymentMethodRows = [...paymentMethodTotals.entries()]
    .map(([key, total]) => ({ name: sourceNameById.get(key) ?? "Unknown", total }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expense Tracking</h1>
          <p className="text-sm text-foreground/50">Search, filter, and analyze every wedding expense.</p>
        </div>
        <a
          href="/api/export"
          download
          className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-muted px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-border-subtle"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or vendor..."
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-auto">
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select value={sortField} onChange={(e) => setSortField(e.target.value as SortField)} className="w-auto">
              <option value="actual">Sort: Actual cost</option>
              <option value="estimated">Sort: Estimated cost</option>
              <option value="paid">Sort: Paid</option>
              <option value="remaining">Sort: Remaining</option>
              <option value="dueDate">Sort: Due date</option>
              <option value="name">Sort: Name</option>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left text-xs text-foreground/50">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Vendor</th>
                  <th className="py-2 pr-3 text-right">Estimated</th>
                  <th className="py-2 pr-3 text-right">Actual</th>
                  <th className="py-2 pr-3 text-right">Paid</th>
                  <th className="py-2 pr-3 text-right">Remaining</th>
                  <th className="py-2 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSorted.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-foreground/50">
                      No expenses match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredSorted.map((s: SubcategoryComputed) => (
                    <tr key={s.id} className="border-b border-border-subtle last:border-b-0">
                      <td className="py-2 pr-3 font-medium">{s.name}</td>
                      <td className="py-2 pr-3 text-foreground/60">{categoryNameById.get(s.categoryId) ?? "—"}</td>
                      <td className="py-2 pr-3 text-foreground/60">{s.vendorName ?? "—"}</td>
                      <td className="py-2 pr-3 text-right">{formatCurrency(s.estimatedCostComputed, currency)}</td>
                      <td className="py-2 pr-3 text-right">{formatCurrency(s.actualCostComputed, currency)}</td>
                      <td className="py-2 pr-3 text-right text-emerald-600">{formatCurrency(s.totalPaid, currency)}</td>
                      <td className="py-2 pr-3 text-right">{formatCurrency(s.remaining, currency)}</td>
                      <td className="py-2 pr-3">
                        <StatusBadge status={s.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming & Overdue Payments</CardTitle>
          </CardHeader>
          <CardBody className="!px-0 !pt-2">
            {withDueDate.length === 0 ? (
              <p className="px-5 py-2 text-sm text-foreground/50">No outstanding payments with a due date.</p>
            ) : (
              [...overdue, ...upcoming].map((s) => (
                <div key={s.id} className="flex items-center justify-between border-t border-border-subtle px-5 py-3 first:border-t-0">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-foreground/50">
                      Due {s.dueDate} · {categoryNameById.get(s.categoryId) ?? "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(s.remaining, currency)}</p>
                    {isOverdue(s.dueDate) ? (
                      <span className="text-xs font-medium text-red-500">Overdue</span>
                    ) : (
                      <span className="text-xs text-foreground/50">Upcoming</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Largest Expenses</CardTitle>
          </CardHeader>
          <CardBody className="!px-0 !pt-2">
            {largestExpenses.length === 0 ? (
              <p className="px-5 py-2 text-sm text-foreground/50">No expenses recorded yet.</p>
            ) : (
              largestExpenses.map((s) => (
                <div key={s.id} className="flex items-center justify-between border-t border-border-subtle px-5 py-3 first:border-t-0">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-foreground/50">{categoryNameById.get(s.categoryId) ?? "—"}</p>
                  </div>
                  <p className="text-sm font-medium">{formatCurrency(s.actualCostComputed, currency)}</p>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Refundable Deposits & Pending Refunds</CardTitle>
          </CardHeader>
          <CardBody className="!px-0 !pt-2">
            {refundableDeposits.length === 0 ? (
              <p className="px-5 py-2 text-sm text-foreground/50">No refundable deposits recorded.</p>
            ) : (
              refundableDeposits.map((s) => (
                <div key={s.id} className="flex items-center justify-between border-t border-border-subtle px-5 py-3 first:border-t-0">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-foreground/50">{categoryNameById.get(s.categoryId) ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{formatCurrency(s.depositAmount ?? 0, currency)}</p>
                    {s.refundStatus && <RefundBadge status={s.refundStatus} />}
                  </div>
                </div>
              ))
            )}
            {pendingRefunds.length > 0 && (
              <p className="px-5 pt-3 text-xs text-foreground/50">
                {pendingRefunds.length} deposit{pendingRefunds.length === 1 ? "" : "s"} still pending refund.
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spend by Payment Method</CardTitle>
          </CardHeader>
          <CardBody className="!px-0 !pt-2">
            {paymentMethodRows.length === 0 ? (
              <p className="px-5 py-2 text-sm text-foreground/50">No payments recorded yet.</p>
            ) : (
              paymentMethodRows.map((row) => (
                <div key={row.name} className="flex items-center justify-between border-t border-border-subtle px-5 py-3 first:border-t-0">
                  <span className="text-sm font-medium">{row.name}</span>
                  <span className="text-sm">{formatCurrency(row.total, currency)}</span>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spend by Vendor</CardTitle>
        </CardHeader>
        <CardBody className="!px-0 !pt-2">
          {vendorRows.length === 0 ? (
            <p className="px-5 py-2 text-sm text-foreground/50">No expenses recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-left text-xs text-foreground/50">
                    <th className="py-2 pl-5 pr-3">Vendor</th>
                    <th className="py-2 pr-3 text-right">Estimated</th>
                    <th className="py-2 pr-3 text-right">Actual</th>
                    <th className="py-2 pr-5 text-right">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorRows.map(([vendor, totals]) => (
                    <tr key={vendor} className="border-b border-border-subtle last:border-b-0">
                      <td className="py-2 pl-5 pr-3 font-medium">{vendor}</td>
                      <td className="py-2 pr-3 text-right">{formatCurrency(totals.totalEstimated, currency)}</td>
                      <td className="py-2 pr-3 text-right">{formatCurrency(totals.totalActual, currency)}</td>
                      <td className="py-2 pr-5 text-right text-emerald-600">{formatCurrency(totals.totalPaid, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
