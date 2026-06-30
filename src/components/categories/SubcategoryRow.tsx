"use client";

import { useState } from "react";
import { StatusBadge, RefundBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAppMutation } from "@/hooks/useAppMutation";
import { api } from "@/lib/apiClient";
import { formatCurrency } from "@/lib/currency";
import type { CreditCard, SavingsAccount, SubcategoryComputed } from "@/lib/types";
import { CreditCard as CreditCardIcon, Pencil, Receipt, Trash2, Undo2 } from "lucide-react";
import { SubcategoryFormModal } from "./SubcategoryFormModal";
import { PaymentModal } from "./PaymentModal";
import { RefundModal } from "./RefundModal";

function pricingSummary(sub: SubcategoryComputed, currency: string, guestCount: number): string {
  switch (sub.pricingModel) {
    case "PER_GUEST": {
      const rate = sub.actualRate ?? sub.estimatedRate ?? 0;
      return `${formatCurrency(rate, currency)}/guest x ${guestCount}`;
    }
    case "PER_UNIT": {
      const rate = sub.actualRate ?? sub.estimatedRate ?? 0;
      return `${sub.quantity ?? 0} x ${formatCurrency(rate, currency)}`;
    }
    default:
      return "Fixed";
  }
}

export function SubcategoryRow({
  subcategory,
  categoryId,
  currency,
  guestCount,
  savings,
  creditCards,
}: {
  subcategory: SubcategoryComputed;
  categoryId: string;
  currency: string;
  guestCount: number;
  savings: SavingsAccount[];
  creditCards: CreditCard[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteSub = useAppMutation(api.deleteSubcategory, { successMessage: "Subcategory deleted" });

  const hasRefundableDeposit = subcategory.depositRefundable && (subcategory.depositAmount ?? 0) > 0;

  return (
    <div className="flex flex-col gap-2 border-t border-border-subtle px-5 py-4 first:border-t-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{subcategory.name}</p>
            <StatusBadge status={subcategory.status} />
            {hasRefundableDeposit && subcategory.refundStatus && <RefundBadge status={subcategory.refundStatus} />}
          </div>
          {subcategory.description && <p className="mt-0.5 text-sm text-foreground/50">{subcategory.description}</p>}
          <p className="mt-1 text-xs text-foreground/50">
            {pricingSummary(subcategory, currency, guestCount)}
            {subcategory.vendorName ? ` · Vendor: ${subcategory.vendorName}` : ""}
            {subcategory.dueDate ? ` · Due: ${subcategory.dueDate}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setPayOpen(true)} title="Record Payment">
            <Receipt className="h-4 w-4" />
          </Button>
          {hasRefundableDeposit && (
            <Button variant="ghost" size="sm" onClick={() => setRefundOpen(true)} title="Manage Refund">
              <Undo2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)} title="Delete">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-foreground/50">Estimated</p>
          <p className="font-medium">{formatCurrency(subcategory.estimatedCostComputed, currency)}</p>
        </div>
        <div>
          <p className="text-xs text-foreground/50">Actual</p>
          <p className="font-medium">{formatCurrency(subcategory.actualCostComputed, currency)}</p>
        </div>
        <div>
          <p className="text-xs text-foreground/50">Paid</p>
          <p className="font-medium text-emerald-600">{formatCurrency(subcategory.totalPaid, currency)}</p>
        </div>
        <div>
          <p className="text-xs text-foreground/50">Remaining</p>
          <p className={`font-medium ${subcategory.remaining > 0 ? "text-amber-600" : "text-foreground"}`}>
            {formatCurrency(subcategory.remaining, currency)}
          </p>
        </div>
      </div>

      {hasRefundableDeposit && (
        <p className="flex items-center gap-1.5 text-xs text-foreground/50">
          <CreditCardIcon className="h-3.5 w-3.5" /> Refundable deposit: {formatCurrency(subcategory.depositAmount ?? 0, currency)}
        </p>
      )}

      {editOpen && (
        <SubcategoryFormModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          categoryId={categoryId}
          subcategory={subcategory}
          guestCount={guestCount}
        />
      )}
      {payOpen && (
        <PaymentModal
          open={payOpen}
          onClose={() => setPayOpen(false)}
          subcategory={subcategory}
          savings={savings}
          creditCards={creditCards}
          currency={currency}
        />
      )}
      {refundOpen && (
        <RefundModal
          open={refundOpen}
          onClose={() => setRefundOpen(false)}
          subcategory={subcategory}
          savings={savings}
          currency={currency}
        />
      )}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Subcategory"
        description={`Are you sure you want to delete "${subcategory.name}"? This will also delete its payment history.`}
        loading={deleteSub.isPending}
        onConfirm={async () => {
          await deleteSub.mutateAsync(subcategory.id);
          setDeleteOpen(false);
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
