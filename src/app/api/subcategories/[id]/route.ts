import { NextResponse } from "next/server";
import { deleteSubcategory, getSubcategory, updateSubcategory } from "@/lib/db/subcategories";
import { subcategoryUpdateSchema } from "@/lib/validation";
import { parseBody, handleApiError, jsonError } from "@/lib/api-helpers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sub = await getSubcategory(id);
    if (!sub) return jsonError("Subcategory not found", 404);
    return NextResponse.json(sub);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const input = await parseBody(req, subcategoryUpdateSchema);
    const sub = await updateSubcategory(id, input);
    if (!sub) return jsonError("Subcategory not found", 404);
    return NextResponse.json(sub);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await getSubcategory(id);
    if (!existing) return jsonError("Subcategory not found", 404);
    await deleteSubcategory(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
