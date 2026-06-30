"use client";

import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { CategorySpendChart } from "@/components/dashboard/CategorySpendChart";
import { FundsChart } from "@/components/dashboard/FundsChart";
import { GuestSummaryCard } from "@/components/dashboard/GuestSummaryCard";
import { FixedVariableCard } from "@/components/dashboard/FixedVariableCard";
import { formatCurrency } from "@/lib/currency";
import {
  PiggyBank,
  CreditCard as CreditCardIcon,
  Wallet,
  Receipt,
  Banknote,
  Undo2,
  Scale,
  Target,
} from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading, error } = useAppData();
  const [view, setView] = useState<"inclusive" | "exclusive">("inclusive");

  if (isLoading) {
    return <p className="text-sm text-foreground/50">Loading dashboard...</p>;
  }
  if (error || !data) {
    return <p className="text-sm text-red-500">Failed to load dashboard data.</p>;
  }

  const { summary, categories, weddingInfo } = data;
  const currency = weddingInfo.currency;
  const weddingSpend = view === "inclusive" ? summary.weddingSpendInclusive : summary.weddingSpendExclusive;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-foreground/50">
            Real-time overview of your wedding budget, payments, and available funds.
          </p>
        </div>
        <div className="flex items-center rounded-lg border border-border-subtle bg-surface p-1 text-sm">
          <button
            onClick={() => setView("inclusive")}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              view === "inclusive" ? "bg-rose-600 text-white" : "text-foreground/60"
            }`}
          >
            Include Deposits
          </button>
          <button
            onClick={() => setView("exclusive")}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              view === "exclusive" ? "bg-rose-600 text-white" : "text-foreground/60"
            }`}
          >
            Exclude Deposits
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Estimated Budget"
          value={formatCurrency(summary.totalEstimatedBudget, currency)}
          icon={<Target className="h-5 w-5" />}
        />
        <StatCard
          label="Total Actual Spending"
          value={formatCurrency(summary.totalActualSpending, currency)}
          icon={<Receipt className="h-5 w-5" />}
        />
        <StatCard
          label="Total Paid"
          value={formatCurrency(summary.totalPaid, currency)}
          icon={<Banknote className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard
          label="Remaining Budget"
          value={formatCurrency(summary.remainingBudget, currency)}
          icon={<Scale className="h-5 w-5" />}
          tone={summary.remainingBudget < 0 ? "red" : "amber"}
        />
        <StatCard
          label="Wedding Spend"
          value={formatCurrency(weddingSpend, currency)}
          hint={view === "inclusive" ? "Includes refundable deposits" : "Excludes refundable deposits"}
          icon={<Wallet className="h-5 w-5" />}
          tone="rose"
        />
        <StatCard
          label="Refundable Deposits (Pending)"
          value={formatCurrency(summary.refundableDepositsPending, currency)}
          hint={`${formatCurrency(summary.refundableDepositsTotal, currency)} total deposited`}
          icon={<Undo2 className="h-5 w-5" />}
        />
        <StatCard
          label="Savings Remaining"
          value={formatCurrency(summary.savingsRemaining, currency)}
          icon={<PiggyBank className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard
          label="Credit Available"
          value={formatCurrency(summary.creditAvailable, currency)}
          icon={<CreditCardIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Credit Used"
          value={formatCurrency(summary.creditUsed, currency)}
          icon={<CreditCardIcon className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label="Combined Available Funds"
          value={formatCurrency(summary.combinedAvailableFunds, currency)}
          icon={<Wallet className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard
          label="Overall Wedding Cost"
          value={formatCurrency(summary.overallWeddingCost, currency)}
          hint="Actual spend, excluding refundable deposits"
          icon={<Target className="h-5 w-5" />}
          tone="rose"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardBody>
            <CategorySpendChart categories={categories} currency={currency} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Savings vs Credit</CardTitle>
          </CardHeader>
          <CardBody>
            <FundsChart
              savingsRemaining={summary.savingsRemaining}
              creditAvailable={summary.creditAvailable}
              creditUsed={summary.creditUsed}
              currency={currency}
            />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GuestSummaryCard weddingInfo={weddingInfo} />
        <FixedVariableCard fixed={summary.fixedCostTotal} variable={summary.variableCostTotal} currency={currency} />
      </div>
    </div>
  );
}
