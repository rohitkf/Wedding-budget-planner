"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useAppMutation } from "@/hooks/useAppMutation";
import { api } from "@/lib/apiClient";
import type { CreditCard } from "@/lib/types";

export function CreditCardFormModal({
  open,
  onClose,
  card,
}: {
  open: boolean;
  onClose: () => void;
  card?: CreditCard | null;
}) {
  const [name, setName] = useState(card?.name ?? "");
  const [creditLimit, setCreditLimit] = useState(card?.creditLimit?.toString() ?? "");
  const [availableCredit, setAvailableCredit] = useState(card?.availableCredit?.toString() ?? "");

  const create = useAppMutation(api.createCreditCard, { successMessage: "Credit card added" });
  const update = useAppMutation(
    (input: { id: string; name: string; creditLimit: number; availableCredit: number }) =>
      api.updateCreditCard(input.id, {
        name: input.name,
        creditLimit: input.creditLimit,
        availableCredit: input.availableCredit,
      }),
    { successMessage: "Credit card updated" }
  );

  const saving = create.isPending || update.isPending;

  function reset() {
    setName(card?.name ?? "");
    setCreditLimit(card?.creditLimit?.toString() ?? "");
    setAvailableCredit(card?.availableCredit?.toString() ?? "");
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const limitNum = Number(creditLimit) || 0;
    const availableNum = Number(availableCredit) || 0;
    if (card) {
      await update.mutateAsync({ id: card.id, name: name.trim(), creditLimit: limitNum, availableCredit: availableNum });
    } else {
      await create.mutateAsync({ name: name.trim(), creditLimit: limitNum, availableCredit: availableNum });
    }
    handleClose();
  }

  const usedCredit = (Number(creditLimit) || 0) - (Number(availableCredit) || 0);

  return (
    <Modal open={open} onClose={handleClose} title={card ? "Edit Credit Card" : "Add Credit Card"} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="card-name">Card Name</Label>
          <Input
            id="card-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Amex Gold"
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="card-limit">Credit Limit</Label>
            <Input
              id="card-limit"
              type="number"
              min={0}
              step="0.01"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="card-available">Available Credit</Label>
            <Input
              id="card-available"
              type="number"
              min={0}
              step="0.01"
              value={availableCredit}
              onChange={(e) => setAvailableCredit(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
        <p className="text-xs text-foreground/50">Used credit (auto-calculated): {usedCredit.toFixed(2)}</p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} disabled={!name.trim()}>
            {card ? "Save Changes" : "Add Card"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
