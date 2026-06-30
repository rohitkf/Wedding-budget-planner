"use client";

import { useAppData } from "@/hooks/useAppData";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { FundsChart } from "@/components/dashboard/FundsChart";
import { formatCurrency } from "@/lib/currency";
import { PiggyBank, CreditCard as CreditCardIcon, Wallet } from "lucide-react";

export default function FinancialOverviewPage() {
  const { data, isLoading, error } = useAppData();

  if (isLoading) {
    return <p className="text-sm text-foreground/50">Loading financial overview...</p>;
  }
  if (error || !data) {
    return <p className="text-sm text-red-500">Failed to load financial overview.</p>;
  }

  const { savings, creditCards, summary, weddingInfo } = data;
  const currency = weddingInfo.currency;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Financial Overview</h1>
        <p className="text-sm text-foreground/50">All of your available funds in one place.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Savings Remaining"
          value={formatCurrency(summary.savingsRemaining, currency)}
          icon={<PiggyBank className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard
          label="Credit Available"
          value={formatCurrency(summary.creditAvailable, currency)}
          hint={`Used: ${formatCurrency(summary.creditUsed, currency)} of ${formatCurrency(summary.creditLimitTotal, currency)}`}
          icon={<CreditCardIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Combined Available Funds"
          value={formatCurrency(summary.combinedAvailableFunds, currency)}
          icon={<Wallet className="h-5 w-5" />}
          tone="rose"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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

        <Card>
          <CardHeader>
            <CardTitle>Savings Accounts</CardTitle>
          </CardHeader>
          <CardBody className="!px-0 !pt-2">
            {savings.length === 0 ? (
              <p className="px-5 py-2 text-sm text-foreground/50">No savings accounts yet.</p>
            ) : (
              <>
                {savings.map((s) => (
                  <div key={s.id} className="flex items-center justify-between border-t border-border-subtle px-5 py-3 first:border-t-0">
                    <span className="text-sm">{s.name}</span>
                    <span className="text-sm font-medium">{formatCurrency(s.balance, currency)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-border-subtle px-5 py-3 font-medium">
                  <span className="text-sm">Total</span>
                  <span className="text-sm text-emerald-600">{formatCurrency(summary.savingsRemaining, currency)}</span>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credit Cards</CardTitle>
        </CardHeader>
        <CardBody className="!px-0 !pt-2">
          {creditCards.length === 0 ? (
            <p className="px-5 py-2 text-sm text-foreground/50">No credit cards yet.</p>
          ) : (
            <div className="grid grid-cols-1 divide-y divide-border-subtle sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
              {creditCards.map((c) => {
                const used = c.creditLimit - c.availableCredit;
                const usedPct = c.creditLimit > 0 ? (used / c.creditLimit) * 100 : 0;
                return (
                  <div key={c.id} className="px-5 py-4">
                    <p className="font-medium">{c.name}</p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div className="h-full bg-amber-500" style={{ width: `${Math.min(usedPct, 100)}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-foreground/60">
                      <span>Available: {formatCurrency(c.availableCredit, currency)}</span>
                      <span>Limit: {formatCurrency(c.creditLimit, currency)}</span>
                    </div>
                    <p className="mt-1 text-xs text-amber-600">Used: {formatCurrency(used, currency)}</p>
                  </div>
                );
              })}
            </div>
          )}
          {creditCards.length > 0 && (
            <div className="flex items-center justify-between border-t border-border-subtle px-5 py-3 font-medium">
              <span className="text-sm">Total Available / Used</span>
              <span className="text-sm">
                {formatCurrency(summary.creditAvailable, currency)} / {formatCurrency(summary.creditUsed, currency)}
              </span>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
