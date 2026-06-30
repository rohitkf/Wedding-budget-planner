import { NextResponse } from "next/server";
import { createSavingsAccount, listSavingsAccounts } from "@/lib/db/savingsAccounts";
import { savingsAccountInputSchema } from "@/lib/validation";
import { parseBody, handleApiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    return NextResponse.json(listSavingsAccounts());
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const input = await parseBody(req, savingsAccountInputSchema);
    const account = createSavingsAccount(input);
    return NextResponse.json(account, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
