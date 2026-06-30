import { NextResponse } from "next/server";
import { deleteCategory, getCategory, updateCategory } from "@/lib/db/categories";
import { categoryInputSchema } from "@/lib/validation";
import { parseBody, handleApiError, jsonError } from "@/lib/api-helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const input = await parseBody(req, categoryInputSchema.partial());
    const category = await updateCategory(id, input);
    if (!category) return jsonError("Category not found", 404);
    return NextResponse.json(category);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await getCategory(id);
    if (!existing) return jsonError("Category not found", 404);
    await deleteCategory(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
