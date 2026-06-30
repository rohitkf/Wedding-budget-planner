"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAppMutation } from "@/hooks/useAppMutation";
import { api } from "@/lib/apiClient";
import { formatCurrency } from "@/lib/currency";
import type { CategoryWithTotals, CreditCard, SavingsAccount } from "@/lib/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { CategoryFormModal } from "./CategoryFormModal";
import { SubcategoryFormModal } from "./SubcategoryFormModal";
import { SubcategoryRow } from "./SubcategoryRow";

export function CategoryCard({
  category,
  currency,
  guestCount,
  savings,
  creditCards,
}: {
  category: CategoryWithTotals;
  currency: string;
  guestCount: number;
  savings: SavingsAccount[];
  creditCards: CreditCard[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [addSubOpen, setAddSubOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteCategory = useAppMutation(api.deleteCategory, { successMessage: "Category deleted" });

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>{category.name}</CardTitle>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/50">
            <span>Estimated: {formatCurrency(category.totalEstimated, currency)}</span>
            <span>Actual: {formatCurrency(category.totalActual, currency)}</span>
            <span className="text-emerald-600">Paid: {formatCurrency(category.totalPaid, currency)}</span>
            <span className={category.totalRemaining > 0 ? "text-amber-600" : ""}>
              Remaining: {formatCurrency(category.totalRemaining, currency)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="secondary" size="sm" onClick={() => setAddSubOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Subcategory
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)} title="Edit category">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)} title="Delete category">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardHeader>
      <CardBody className="!px-0 !pt-2">
        {category.subcategories.length === 0 ? (
          <p className="px-5 py-4 text-sm text-foreground/50">
            No subcategories yet. Add one to start tracking spend in this category.
          </p>
        ) : (
          category.subcategories.map((sub) => (
            <SubcategoryRow
              key={sub.id}
              subcategory={sub}
              categoryId={category.id}
              currency={currency}
              guestCount={guestCount}
              savings={savings}
              creditCards={creditCards}
            />
          ))
        )}
      </CardBody>

      {editOpen && <CategoryFormModal open={editOpen} onClose={() => setEditOpen(false)} category={category} />}
      {addSubOpen && (
        <SubcategoryFormModal
          open={addSubOpen}
          onClose={() => setAddSubOpen(false)}
          categoryId={category.id}
          guestCount={guestCount}
        />
      )}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Category"
        description={`Are you sure you want to delete "${category.name}"? This will also delete all of its subcategories and payment history.`}
        loading={deleteCategory.isPending}
        onConfirm={async () => {
          await deleteCategory.mutateAsync(category.id);
          setDeleteOpen(false);
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </Card>
  );
}
