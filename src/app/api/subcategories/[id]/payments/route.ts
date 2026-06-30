import { NextResponse } from "next/server";
import { getSubcategory } from "@/lib/db/subcategories";
import { listPayments, recordPayments } from "@/lib/db/payments";
import { getSavingsAccount } from "@/lib/db/savingsAccounts";
import { getCreditCard } from "@/lib/db/creditCards";
import { recordPaymentSchema } from "@/lib/validation";
import { parseBody, handleApiError, jsonError, ApiValidationError } from "@/lib/api-helpers";

// Note: we intentionally don't block payments that would push a balance/available-credit
// negative — real account data may lag reality, and an over-limit warning in the UI is
// more useful than a hard stop here.

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!(await getSubcategory(id))) return jsonError("Subcategory not found", 404);
    return NextResponse.json(await listPayments(id));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const subcategory = await getSubcategory(id);
    if (!subcategory) return jsonError("Subcategory not found", 404);

    const input = await parseBody(req, recordPaymentSchema);

    for (const split of input.splits) {
      if (split.sourceType === "SAVINGS") {
        if (!split.savingsAccountId || !(await getSavingsAccount(split.savingsAccountId))) {
          throw new ApiValidationError("Savings account not found for one of the splits");
        }
      } else {
        if (!split.creditCardId || !(await getCreditCard(split.creditCardId))) {
          throw new ApiValidationError("Credit card not found for one of the splits");
        }
      }
    }

    const payments = await recordPayments(id, input.splits.map((s) => ({ ...s, isDeposit: input.isDeposit, paidAt: input.paidAt })));
    return NextResponse.json(payments, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
