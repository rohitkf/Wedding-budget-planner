import { NextResponse } from "next/server";
import { createCreditCard, listCreditCards } from "@/lib/db/creditCards";
import { creditCardInputSchema } from "@/lib/validation";
import { parseBody, handleApiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    return NextResponse.json(listCreditCards());
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const input = await parseBody(req, creditCardInputSchema);
    const card = createCreditCard(input);
    return NextResponse.json(card, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
