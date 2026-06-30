import { getDb } from "./client";
import { newId, nowIso } from "./ids";
import type { Category } from "@/lib/types";

interface CategoryRow {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function mapRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listCategories(): Category[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM categories ORDER BY sort_order ASC, created_at ASC")
    .all() as unknown as CategoryRow[];
  return rows.map(mapRow);
}

export function getCategory(id: string): Category | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as
    | CategoryRow
    | undefined;
  return row ? mapRow(row) : null;
}

export function createCategory(input: { name: string; sortOrder?: number }): Category {
  const db = getDb();
  const id = newId();
  const now = nowIso();
  db.prepare(
    `INSERT INTO categories (id, name, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`
  ).run(id, input.name, input.sortOrder ?? 0, now, now);
  return getCategory(id)!;
}

export function updateCategory(
  id: string,
  input: { name?: string; sortOrder?: number }
): Category | null {
  const db = getDb();
  const existing = getCategory(id);
  if (!existing) return null;
  const now = nowIso();
  db.prepare(`UPDATE categories SET name = ?, sort_order = ?, updated_at = ? WHERE id = ?`).run(
    input.name ?? existing.name,
    input.sortOrder ?? existing.sortOrder,
    now,
    id
  );
  return getCategory(id);
}

export function deleteCategory(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  return result.changes > 0;
}
