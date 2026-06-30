import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/lib/aggregate";
import { handleApiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    return NextResponse.json(getDashboardSummary());
  } catch (err) {
    return handleApiError(err);
  }
}
