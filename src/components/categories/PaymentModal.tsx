"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { useAppMutation } from "@/hooks/useAppMutation";
import { api } from "@/lib/apiClient";
import { formatCurrency } from "@/lib/currency";
import type { CreditCard, SavingsAccount, SourceType, SubcategoryComputed } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

interface SplitRow {
  key: string;
  sourceType: SourceType;
  accountId: string;
  amount: string;
}

function newSplitRow(savings: SavingsAccount[], creditCards: CreditCard[]): SplitRow {
  const sourceType: SourceType = savings.length > 0 ? "SAVINGS" : "CREDIT_CARD";
  const accountId = sourceType === "SAVINGS" ? savings[0]?.id ?? "" : creditCards[0]?.id ?? "";
  return { key: crypto.randomUUID(), sourceType, accountId, amount: "" };
}

export function PaymentModal({
  open,
  onClose,
  subcategory,
  savings,
  creditCards,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  subcategory: SubcategoryComputed;
  savings: SavingsAccount[];
  creditCards: CreditCard[];
  currency: string;
}) {
  const [amount, setAmount] = useState(subcategory.remaining > 0 ? subcategory.remaining.toFixed(2) : "");
  const [isDeposit, setIsDeposit] = useState(false);
  const [splits, setSplits] = useState<SplitRow[]>([newSplitRow(savings, creditCards)]);
  const [error, setError] = useState<string | null>(null);

  const record = useAppMutation(
    (input: Parameters<typeof api.recordPayment>[1]) => api.recordPayment(subcategory.id, input),
    { successMessage: "Payment recorded" }
  );

  const splitSum = splits.reduce((s, sp) => s + (Number(sp.amount) || 0), 0);
  const amountNum = Number(amount) || 0;
  const sumMatches = Math.abs(splitSum - amountNum) < 0.005;

  function reset() {
    setAmount("");
    setIsDeposit(false);
    setSplits([newSplitRow(savings, creditCards)]);
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function updateSplit(key: string, patch: Partial<SplitRow>) {
    setSplits((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  }

  function addSplit() {
    setSplits((prev) => [...prev, newSplitRow(savings, creditCards)]);
  }

  function removeSplit(key: string) {
    setSplits((prev) => (prev.length > 1 ? prev.filter((s) => s.key !== key) : prev));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (amountNum <= 0) {
      setError("Enter a payment amount greater than 0.");
      return;
    }
    if (!sumMatches) {
      setError(`Split amounts (${formatCurrency(splitSum, currency)}) must add up exactly to the payment amount (${formatCurrency(amountNum, currency)}).`);
      return;
    }
    if (splits.some((s) => !s.accountId || !(Number(s.amount) > 0))) {
      setError("Every split needs a selected account/card and an amount greater than 0.");
      return;
    }

    await record.mutateAsync({
      amount: amountNum,
      isDeposit,
      splits: splits.map((s) => ({
        sourceType: s.sourceType,
        savingsAccountId: s.sourceType === "SAVINGS" ? s.accountId : null,
        creditCardId: s.sourceType === "CREDIT_CARD" ? s.accountId : null,
        amount: Number(s.amount),
      })),
    });
    handleClose();
  }

  const noSources = savings.length === 0 && creditCards.length === 0;

  return (
    <Modal open={open} onClose={handleClose} title={`Record Payment — ${subcategory.name}`} size="lg">
      {noSources ? (
        <p className="text-sm text-foreground/60">
          Add a savings account or credit card under Financial Overview before recording payments.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pay-amount">Payment Amount</Label>
              <Input
                id="pay-amount"
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
              <p className="mt-1 text-xs text-foreground/50">Remaining due: {formatCurrency(subcategory.remaining, currency)}</p>
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-foreground/70">
              <input
                type="checkbox"
                checked={isDeposit}
                onChange={(e) => setIsDeposit(e.target.checked)}
                className="h-4 w-4 rounded border-border-subtle"
              />
              This payment is a deposit
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label className="!mb-0">Payment Splits</Label>
              <Button type="button" variant="secondary" size="sm" onClick={addSplit}>
                <Plus className="h-3.5 w-3.5" /> Add Split
              </Button>
            </div>

            {splits.map((split) => {
              const options = split.sourceType === "SAVINGS" ? savings : creditCards;
              return (
                <div key={split.key} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr,1.5fr,1fr,auto] sm:items-end">
                  <div>
                    <Select
                      value={split.sourceType}
                      onChange={(e) => {
                        const sourceType = e.target.value as SourceType;
                        const opts = sourceType === "SAVINGS" ? savings : creditCards;
                        updateSplit(split.key, { sourceType, accountId: opts[0]?.id ?? "" });
                      }}
                    >
                      <option value="SAVINGS">Savings</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={split.accountId}
                      onChange={(e) => updateSplit(split.key, { accountId: e.target.value })}
                    >
                      <option value="">Select account</option>
                      {options.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                          {split.sourceType === "SAVINGS"
                            ? ` (${formatCurrency((o as SavingsAccount).balance, currency)})`
                            : ` (${formatCurrency((o as CreditCard).availableCredit, currency)} available)`}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={split.amount}
                      onChange={(e) => updateSplit(split.key, { amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSplit(split.key)}
                    disabled={splits.length === 1}
                    className="justify-self-start rounded-lg p-2 text-foreground/40 hover:text-red-500 disabled:opacity-30 sm:justify-self-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}

            <div className="flex justify-between text-xs text-foreground/50">
              <span>Split total: {formatCurrency(splitSum, currency)}</span>
              <span className={sumMatches ? "text-emerald-600" : "text-red-500"}>
                {sumMatches ? "Matches payment amount" : "Must match payment amount"}
              </span>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={record.isPending}>
              Record Payment
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
