import { NextResponse } from "next/server";
import { createCategory } from "@/lib/db/categories";
import { categoryInputSchema } from "@/lib/validation";
import { parseBody, handleApiError } from "@/lib/api-helpers";
import { getComputedData } from "@/lib/aggregate";

export async function GET() {
  try {
    const { categories } = getComputedData();
    return NextResponse.json(categories);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const input = await parseBody(req, categoryInputSchema);
    const category = createCategory(input);
    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
