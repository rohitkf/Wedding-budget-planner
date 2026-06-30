import { NextResponse } from "next/server";
import { getWeddingInfo, updateWeddingInfo } from "@/lib/db/weddingInfo";
import { weddingInfoUpdateSchema } from "@/lib/validation";
import { parseBody, handleApiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    return NextResponse.json(await getWeddingInfo());
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const input = await parseBody(req, weddingInfoUpdateSchema);
    const info = await updateWeddingInfo(input);
    return NextResponse.json(info);
  } catch (err) {
    return handleApiError(err);
  }
}
