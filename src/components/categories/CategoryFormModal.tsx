"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useAppMutation } from "@/hooks/useAppMutation";
import { api } from "@/lib/apiClient";
import type { Category } from "@/lib/types";

export function CategoryFormModal({
  open,
  onClose,
  category,
}: {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
}) {
  const [name, setName] = useState(category?.name ?? "");

  const create = useAppMutation(api.createCategory, { successMessage: "Category created" });
  const update = useAppMutation(
    (input: { id: string; name: string }) => api.updateCategory(input.id, { name: input.name }),
    { successMessage: "Category updated" }
  );

  const saving = create.isPending || update.isPending;

  function reset() {
    setName(category?.name ?? "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (category) {
      await update.mutateAsync({ id: category.id, name: name.trim() });
    } else {
      await create.mutateAsync({ name: name.trim() });
    }
    onClose();
    setName("");
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={category ? "Edit Category" : "Add Category"}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="category-name">Category Name</Label>
          <Input
            id="category-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Venue, Decor, Photography"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} disabled={!name.trim()}>
            {category ? "Save Changes" : "Add Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
