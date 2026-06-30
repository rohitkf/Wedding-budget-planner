import { NextResponse } from "next/server";
import { deleteSavingsAccount, getSavingsAccount, updateSavingsAccount } from "@/lib/db/savingsAccounts";
import { savingsAccountInputSchema } from "@/lib/validation";
import { parseBody, handleApiError, jsonError } from "@/lib/api-helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const input = await parseBody(req, savingsAccountInputSchema.partial());
    const account = updateSavingsAccount(id, input);
    if (!account) return jsonError("Savings account not found", 404);
    return NextResponse.json(account);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!getSavingsAccount(id)) return jsonError("Savings account not found", 404);
    try {
      deleteSavingsAccount(id);
    } catch {
      return jsonError("Cannot delete an account that has recorded payments against it", 409);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
