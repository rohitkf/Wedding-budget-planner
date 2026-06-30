import { NextResponse } from "next/server";
import { getSubcategory, setRefundStatus } from "@/lib/db/subcategories";
import { adjustSavingsBalance, getSavingsAccount } from "@/lib/db/savingsAccounts";
import { refundActionSchema } from "@/lib/validation";
import { parseBody, handleApiError, jsonError, ApiValidationError } from "@/lib/api-helpers";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const subcategory = getSubcategory(id);
    if (!subcategory) return jsonError("Subcategory not found", 404);
    if (!subcategory.depositRefundable) {
      throw new ApiValidationError("This expense does not have a refundable deposit");
    }

    const input = await parseBody(req, refundActionSchema);

    if (
      input.status === "REFUNDED" &&
      subcategory.refundStatus !== "REFUNDED" &&
      input.creditToSavingsAccountId
    ) {
      const account = getSavingsAccount(input.creditToSavingsAccountId);
      if (!account) throw new ApiValidationError("Savings account not found");
      adjustSavingsBalance(input.creditToSavingsAccountId, subcategory.depositAmount ?? 0);
    }

    const updated = setRefundStatus(id, input.status);
    return NextResponse.json(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
