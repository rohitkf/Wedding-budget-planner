"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/currency";

export function FundsChart({
  savingsRemaining,
  creditAvailable,
  creditUsed,
  currency,
}: {
  savingsRemaining: number;
  creditAvailable: number;
  creditUsed: number;
  currency: string;
}) {
  const data = [
    { name: "Savings Remaining", value: Math.max(savingsRemaining, 0), color: "#16a34a" },
    { name: "Credit Available", value: Math.max(creditAvailable, 0), color: "#2563eb" },
    { name: "Credit Used", value: Math.max(creditUsed, 0), color: "#e11d48" },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return <p className="text-sm text-foreground/50">Add savings accounts or credit cards to see this breakdown.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0), currency)} contentStyle={{ fontSize: 13, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
