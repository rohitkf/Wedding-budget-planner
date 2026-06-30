"use client";

import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { Button } from "@/components/ui/Button";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { CategoryFormModal } from "@/components/categories/CategoryFormModal";
import { Plus } from "lucide-react";

export default function CategoriesPage() {
  const { data, isLoading, error } = useAppData();
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  if (isLoading) {
    return <p className="text-sm text-foreground/50">Loading categories...</p>;
  }
  if (error || !data) {
    return <p className="text-sm text-red-500">Failed to load categories.</p>;
  }

  const { categories, weddingInfo, savings, creditCards } = data;
  const guestCount = weddingInfo.expectedGuests;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budget Categories</h1>
          <p className="text-sm text-foreground/50">
            Organize your wedding spend into categories and subcategories, with automatic cost calculation.
          </p>
        </div>
        <Button onClick={() => setAddCategoryOpen(true)}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-foreground/50">No categories yet. Add your first category to get started.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              currency={weddingInfo.currency}
              guestCount={guestCount}
              savings={savings}
              creditCards={creditCards}
            />
          ))}
        </div>
      )}

      <CategoryFormModal open={addCategoryOpen} onClose={() => setAddCategoryOpen(false)} />
    </div>
  );
}
