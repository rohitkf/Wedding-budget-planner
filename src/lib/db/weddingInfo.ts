import { readStore, withStore } from "./store";
import { nowIso } from "./ids";
import type { WeddingInfo } from "@/lib/types";

export async function getWeddingInfo(): Promise<WeddingInfo> {
  const { weddingInfo } = await readStore();
  return weddingInfo;
}

export async function updateWeddingInfo(
  input: Partial<Omit<WeddingInfo, "id" | "updatedAt">>
): Promise<WeddingInfo> {
  return withStore((store) => {
    const existing = store.weddingInfo;
    if (input.currency !== undefined) existing.currency = input.currency;
    if (input.weddingDate !== undefined) existing.weddingDate = input.weddingDate;
    if (input.expectedGuests !== undefined) existing.expectedGuests = input.expectedGuests;
    if (input.rsvpAccepted !== undefined) existing.rsvpAccepted = input.rsvpAccepted;
    if (input.rsvpDeclined !== undefined) existing.rsvpDeclined = input.rsvpDeclined;
    if (input.rsvpPending !== undefined) existing.rsvpPending = input.rsvpPending;
    if (input.actualAttendance !== undefined) existing.actualAttendance = input.actualAttendance;
    existing.updatedAt = nowIso();
    return existing;
  });
}
