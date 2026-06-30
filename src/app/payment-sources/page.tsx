"use client";

import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAppMutation } from "@/hooks/useAppMutation";
import { api } from "@/lib/apiClient";
import { formatCurrency } from "@/lib/currency";
import { SavingsAccountFormModal } from "@/components/payment-sources/SavingsAccountFormModal";
import { CreditCardFormModal } from "@/components/payment-sources/CreditCardFormModal";
import type { CreditCard, SavingsAccount } from "@/lib/types";
import { Pencil, Plus, Trash2 } from "lucide-react";

function SavingsRow({ account, currency }: { account: SavingsAccount; currency: string }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const del = useAppMutation(api.deleteSavingsAccount, { successMessage: "Savings account removed" });

  return (
    <div className="flex items-center justify-between border-t border-border-subtle px-5 py-4 first:border-t-0">
      <div>
        <p className="font-medium">{account.name}</p>
        <p className="text-sm text-foreground/60">{formatCurrency(account.balance, currency)}</p>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
      {editOpen && <SavingsAccountFormModal open={editOpen} onClose={() => setEditOpen(false)} account={account} />}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Savings Account"
        description={`Are you sure you want to delete "${account.name}"? Payments already recorded against it will keep their history.`}
        onConfirm={() => {
          setDeleteOpen(false);
          del.mutate(account.id);
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}

function CreditCardRow({ card, currency }: { card: CreditCard; currency: string }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const del = useAppMutation(api.deleteCreditCard, { successMessage: "Credit card removed" });
  const used = card.creditLimit - card.availableCredit;

  return (
    <div className="flex items-center justify-between border-t border-border-subtle px-5 py-4 first:border-t-0">
      <div>
        <p className="font-medium">{card.name}</p>
        <p className="text-sm text-foreground/60">
          {formatCurrency(card.availableCredit, currency)} available of {formatCurrency(card.creditLimit, currency)}
        </p>
        <p className="text-xs text-amber-600">Used: {formatCurrency(used, currency)}</p>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
      {editOpen && <CreditCardFormModal open={editOpen} onClose={() => setEditOpen(false)} card={card} />}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Credit Card"
        description={`Are you sure you want to delete "${card.name}"? Payments already recorded against it will keep their history.`}
        onConfirm={() => {
          setDeleteOpen(false);
          del.mutate(card.id);
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}

export default function PaymentSourcesPage() {
  const { data, isLoading, error } = useAppData();
  const [addSavingsOpen, setAddSavingsOpen] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);

  if (isLoading) {
    return <p className="text-sm text-foreground/50">Loading payment sources...</p>;
  }
  if (error || !data) {
    return <p className="text-sm text-red-500">Failed to load payment sources.</p>;
  }

  const { savings, creditCards, weddingInfo } = data;
  const currency = weddingInfo.currency;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payment Sources</h1>
        <p className="text-sm text-foreground/50">Manage the savings accounts and credit cards funding your wedding.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Savings Accounts</CardTitle>
            <Button size="sm" onClick={() => setAddSavingsOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Add Account
            </Button>
          </CardHeader>
          <CardBody className="!px-0 !pt-2">
            {savings.length === 0 ? (
              <p className="px-5 py-4 text-sm text-foreground/50">No savings accounts yet.</p>
            ) : (
              savings.map((s) => <SavingsRow key={s.id} account={s} currency={currency} />)
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Credit Cards</CardTitle>
            <Button size="sm" onClick={() => setAddCardOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Add Card
            </Button>
          </CardHeader>
          <CardBody className="!px-0 !pt-2">
            {creditCards.length === 0 ? (
              <p className="px-5 py-4 text-sm text-foreground/50">No credit cards yet.</p>
            ) : (
              creditCards.map((c) => <CreditCardRow key={c.id} card={c} currency={currency} />)
            )}
          </CardBody>
        </Card>
      </div>

      <SavingsAccountFormModal open={addSavingsOpen} onClose={() => setAddSavingsOpen(false)} />
      <CreditCardFormModal open={addCardOpen} onClose={() => setAddCardOpen(false)} />
    </div>
  );
}
