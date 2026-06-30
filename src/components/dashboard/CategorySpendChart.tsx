"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoryWithTotals } from "@/lib/types";
import { formatCurrency } from "@/lib/currency";

export function CategorySpendChart({
  categories,
  currency,
}: {
  categories: CategoryWithTotals[];
  currency: string;
}) {
  const data = categories
    .map((c) => ({ name: c.name, Estimated: c.totalEstimated, Actual: c.totalActual }))
    .sort((a, b) => b.Actual - a.Actual);

  if (data.length === 0) {
    return <p className="text-sm text-foreground/50">Add a category to see spending by category.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value ?? 0), currency)}
          contentStyle={{ fontSize: 13, borderRadius: 8 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Estimated" fill="#d4a5a5" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Actual" fill="#e11d48" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
