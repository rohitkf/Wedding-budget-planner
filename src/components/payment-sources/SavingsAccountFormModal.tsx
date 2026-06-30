"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useAppMutation } from "@/hooks/useAppMutation";
import { api } from "@/lib/apiClient";
import type { SavingsAccount } from "@/lib/types";

export function SavingsAccountFormModal({
  open,
  onClose,
  account,
}: {
  open: boolean;
  onClose: () => void;
  account?: SavingsAccount | null;
}) {
  const [name, setName] = useState(account?.name ?? "");
  const [balance, setBalance] = useState(account?.balance?.toString() ?? "");

  const create = useAppMutation(api.createSavingsAccount, { successMessage: "Savings account added" });
  const update = useAppMutation(
    (input: { id: string; name: string; balance: number }) =>
      api.updateSavingsAccount(input.id, { name: input.name, balance: input.balance }),
    { successMessage: "Savings account updated" }
  );

  const saving = create.isPending || update.isPending;

  function reset() {
    setName(account?.name ?? "");
    setBalance(account?.balance?.toString() ?? "");
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const balanceNum = Number(balance) || 0;
    if (!name.trim()) return;
    if (account) {
      await update.mutateAsync({ id: account.id, name: name.trim(), balance: balanceNum });
    } else {
      await create.mutateAsync({ name: name.trim(), balance: balanceNum });
    }
    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={account ? "Edit Savings Account" : "Add Savings Account"} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="savings-name">Account Name</Label>
          <Input
            id="savings-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Joint Savings"
            autoFocus
          />
        </div>
        <div>
          <Label htmlFor="savings-balance">Current Balance</Label>
          <Input
            id="savings-balance"
            type="number"
            step="0.01"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} disabled={!name.trim()}>
            {account ? "Save Changes" : "Add Account"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
