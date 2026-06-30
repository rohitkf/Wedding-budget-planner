"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Input";
import { useAppMutation } from "@/hooks/useAppMutation";
import { api } from "@/lib/apiClient";
import { formatCurrency } from "@/lib/currency";
import type { SavingsAccount, SubcategoryComputed } from "@/lib/types";

export function RefundModal({
  open,
  onClose,
  subcategory,
  savings,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  subcategory: SubcategoryComputed;
  savings: SavingsAccount[];
  currency: string;
}) {
  const [creditToSavingsAccountId, setCreditToSavingsAccountId] = useState<string>("");

  const setRefund = useAppMutation(
    (input: { status: "PENDING" | "REFUNDED"; creditToSavingsAccountId?: string | null }) =>
      api.setRefundStatus(subcategory.id, input.status, input.creditToSavingsAccountId),
    { successMessage: "Refund status updated" }
  );

  function handleClose() {
    setCreditToSavingsAccountId("");
    onClose();
  }

  async function markRefunded(e: React.FormEvent) {
    e.preventDefault();
    await setRefund.mutateAsync({
      status: "REFUNDED",
      creditToSavingsAccountId: creditToSavingsAccountId || null,
    });
    handleClose();
  }

  async function markPending() {
    await setRefund.mutateAsync({ status: "PENDING" });
    handleClose();
  }

  const depositAmount = subcategory.depositAmount ?? 0;

  return (
    <Modal open={open} onClose={handleClose} title={`Refundable Deposit — ${subcategory.name}`} size="sm">
      <form onSubmit={markRefunded} className="flex flex-col gap-4">
        <p className="text-sm text-foreground/70">
          Deposit amount: <span className="font-medium">{formatCurrency(depositAmount, currency)}</span>
        </p>
        <p className="text-sm text-foreground/70">
          Current status:{" "}
          <span className="font-medium">{subcategory.refundStatus === "REFUNDED" ? "Refunded" : "Pending"}</span>
        </p>

        {subcategory.refundStatus !== "REFUNDED" && (
          <div>
            <Label htmlFor="refund-savings">Credit refund to savings account (optional)</Label>
            <Select
              id="refund-savings"
              value={creditToSavingsAccountId}
              onChange={(e) => setCreditToSavingsAccountId(e.target.value)}
            >
              <option value="">Don&apos;t credit any account</option>
              {savings.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({formatCurrency(s.balance, currency)})
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          {subcategory.refundStatus === "REFUNDED" ? (
            <Button type="button" variant="secondary" loading={setRefund.isPending} onClick={markPending}>
              Mark as Pending
            </Button>
          ) : (
            <Button type="submit" loading={setRefund.isPending}>
              Mark as Refunded
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
