import { NextResponse } from "next/server";
import { deleteCreditCard, getCreditCard, updateCreditCard } from "@/lib/db/creditCards";
import { creditCardInputSchema } from "@/lib/validation";
import { parseBody, handleApiError, jsonError } from "@/lib/api-helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const input = await parseBody(req, creditCardInputSchema.partial());
    const card = await updateCreditCard(id, input);
    if (!card) return jsonError("Credit card not found", 404);
    return NextResponse.json(card);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!(await getCreditCard(id))) return jsonError("Credit card not found", 404);
    try {
      await deleteCreditCard(id);
    } catch {
      return jsonError("Cannot delete a card that has recorded payments against it", 409);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
