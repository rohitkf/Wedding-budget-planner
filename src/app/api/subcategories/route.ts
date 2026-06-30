import { NextResponse } from "next/server";
import { createSubcategory } from "@/lib/db/subcategories";
import { getCategory } from "@/lib/db/categories";
import { subcategoryInputSchema } from "@/lib/validation";
import { parseBody, handleApiError, jsonError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const input = await parseBody(req, subcategoryInputSchema);
    if (!(await getCategory(input.categoryId))) {
      return jsonError("Category not found", 404);
    }
    const subcategory = await createSubcategory(input);
    return NextResponse.json(subcategory, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
