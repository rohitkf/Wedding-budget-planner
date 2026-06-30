import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";

export function jsonError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiValidationError("Request body must be valid JSON");
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiValidationError(formatZodError(result.error));
  }
  return result.data;
}

export class ApiValidationError extends Error {}

function formatZodError(error: ZodError): string {
  return error.issues.map((i) => i.message).join("; ");
}

export function handleApiError(err: unknown) {
  if (err instanceof ApiValidationError) {
    return jsonError(err.message, 400);
  }
  console.error(err);
  return jsonError("Internal server error", 500);
}
