"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { useAppMutation } from "@/hooks/useAppMutation";
import { api } from "@/lib/apiClient";
import type { PricingModel, Subcategory } from "@/lib/types";

function toNumberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function SubcategoryFormModal({
  open,
  onClose,
  categoryId,
  subcategory,
  guestCount,
}: {
  open: boolean;
  onClose: () => void;
  categoryId: string;
  subcategory?: Subcategory | null;
  guestCount: number;
}) {
  const [name, setName] = useState(subcategory?.name ?? "");
  const [description, setDescription] = useState(subcategory?.description ?? "");
  const [pricingModel, setPricingModel] = useState<PricingModel>(subcategory?.pricingModel ?? "FIXED");
  const [estimatedCost, setEstimatedCost] = useState(subcategory?.estimatedCost?.toString() ?? "");
  const [actualCost, setActualCost] = useState(subcategory?.actualCost?.toString() ?? "");
  const [estimatedRate, setEstimatedRate] = useState(subcategory?.estimatedRate?.toString() ?? "");
  const [actualRate, setActualRate] = useState(subcategory?.actualRate?.toString() ?? "");
  const [quantity, setQuantity] = useState(subcategory?.quantity?.toString() ?? "");
  const [depositAmount, setDepositAmount] = useState(subcategory?.depositAmount?.toString() ?? "");
  const [depositRefundable, setDepositRefundable] = useState(subcategory?.depositRefundable ?? false);
  const [vendorName, setVendorName] = useState(subcategory?.vendorName ?? "");
  const [dueDate, setDueDate] = useState(subcategory?.dueDate ?? "");
  const [notes, setNotes] = useState(subcategory?.notes ?? "");

  const create = useAppMutation(api.createSubcategory, { successMessage: "Subcategory created" });
  const update = useAppMutation(
    (input: { id: string; data: Record<string, unknown> }) => api.updateSubcategory(input.id, input.data),
    { successMessage: "Subcategory updated" }
  );

  const saving = create.isPending || update.isPending;

  function reset() {
    setName(subcategory?.name ?? "");
    setDescription(subcategory?.description ?? "");
    setPricingModel(subcategory?.pricingModel ?? "FIXED");
    setEstimatedCost(subcategory?.estimatedCost?.toString() ?? "");
    setActualCost(subcategory?.actualCost?.toString() ?? "");
    setEstimatedRate(subcategory?.estimatedRate?.toString() ?? "");
    setActualRate(subcategory?.actualRate?.toString() ?? "");
    setQuantity(subcategory?.quantity?.toString() ?? "");
    setDepositAmount(subcategory?.depositAmount?.toString() ?? "");
    setDepositRefundable(subcategory?.depositRefundable ?? false);
    setVendorName(subcategory?.vendorName ?? "");
    setDueDate(subcategory?.dueDate ?? "");
    setNotes(subcategory?.notes ?? "");
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Record<string, unknown> = {
      categoryId,
      name: name.trim(),
      description: description.trim() || null,
      pricingModel,
      estimatedCost: pricingModel === "FIXED" ? toNumberOrNull(estimatedCost) : null,
      actualCost: pricingModel === "FIXED" ? toNumberOrNull(actualCost) : null,
      estimatedRate: pricingModel === "PER_GUEST" || pricingModel === "PER_UNIT" ? toNumberOrNull(estimatedRate) : null,
      actualRate: pricingModel === "PER_GUEST" || pricingModel === "PER_UNIT" ? toNumberOrNull(actualRate) : null,
      quantity: pricingModel === "PER_UNIT" ? toNumberOrNull(quantity) : null,
      depositAmount: toNumberOrNull(depositAmount),
      depositRefundable,
      vendorName: vendorName.trim() || null,
      dueDate: dueDate.trim() || null,
      notes: notes.trim() || null,
    };

    if (subcategory) {
      await update.mutateAsync({ id: subcategory.id, data: payload });
    } else {
      await create.mutateAsync(payload);
    }
    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={subcategory ? "Edit Subcategory" : "Add Subcategory"} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="sub-name">Name</Label>
            <Input
              id="sub-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wedding Venue Hire"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="sub-vendor">Vendor</Label>
            <Input
              id="sub-vendor"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="e.g. The Grand Hall"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="sub-description">Description</Label>
          <Textarea
            id="sub-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Optional notes about this item"
          />
        </div>

        <div>
          <Label htmlFor="sub-pricing">Pricing Model</Label>
          <Select
            id="sub-pricing"
            value={pricingModel}
            onChange={(e) => setPricingModel(e.target.value as PricingModel)}
          >
            <option value="FIXED">Fixed Amount</option>
            <option value="PER_GUEST">Per Guest (scales with guest count)</option>
            <option value="PER_UNIT">Quantity x Unit Price</option>
          </Select>
        </div>

        {pricingModel === "FIXED" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sub-est-cost">Estimated Cost</Label>
              <Input
                id="sub-est-cost"
                type="number"
                min={0}
                step="0.01"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="sub-act-cost">Actual Cost</Label>
              <Input
                id="sub-act-cost"
                type="number"
                min={0}
                step="0.01"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="Defaults to estimated cost"
              />
            </div>
          </div>
        )}

        {pricingModel === "PER_GUEST" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sub-est-rate">Estimated Rate (per guest)</Label>
              <Input
                id="sub-est-rate"
                type="number"
                min={0}
                step="0.01"
                value={estimatedRate}
                onChange={(e) => setEstimatedRate(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="sub-act-rate">Actual Rate (per guest)</Label>
              <Input
                id="sub-act-rate"
                type="number"
                min={0}
                step="0.01"
                value={actualRate}
                onChange={(e) => setActualRate(e.target.value)}
                placeholder="Defaults to estimated rate"
              />
            </div>
            <p className="sm:col-span-2 text-xs text-foreground/50">
              Current guest count: <span className="font-medium">{guestCount}</span>. Cost recalculates automatically
              whenever the guest count changes.
            </p>
          </div>
        )}

        {pricingModel === "PER_UNIT" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="sub-quantity">Quantity</Label>
              <Input
                id="sub-quantity"
                type="number"
                min={0}
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="sub-est-rate-unit">Estimated Unit Price</Label>
              <Input
                id="sub-est-rate-unit"
                type="number"
                min={0}
                step="0.01"
                value={estimatedRate}
                onChange={(e) => setEstimatedRate(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="sub-act-rate-unit">Actual Unit Price</Label>
              <Input
                id="sub-act-rate-unit"
                type="number"
                min={0}
                step="0.01"
                value={actualRate}
                onChange={(e) => setActualRate(e.target.value)}
                placeholder="Defaults to estimated price"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="sub-deposit">Deposit Amount</Label>
            <Input
              id="sub-deposit"
              type="number"
              min={0}
              step="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="sub-due-date">Due Date</Label>
            <Input id="sub-due-date" type="date" value={dueDate ?? ""} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground/70">
          <input
            type="checkbox"
            checked={depositRefundable}
            onChange={(e) => setDepositRefundable(e.target.checked)}
            className="h-4 w-4 rounded border-border-subtle"
          />
          Deposit is refundable
        </label>

        <div>
          <Label htmlFor="sub-notes">Notes</Label>
          <Textarea
            id="sub-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Optional notes"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} disabled={!name.trim()}>
            {subcategory ? "Save Changes" : "Add Subcategory"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
