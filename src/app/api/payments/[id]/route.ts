import { NextResponse } from "next/server";
import { deletePayment, getPayment } from "@/lib/db/payments";
import { handleApiError, jsonError } from "@/lib/api-helpers";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!(await getPayment(id))) return jsonError("Payment not found", 404);
    await deletePayment(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
