import { getDb } from "./client";
import { nowIso } from "./ids";
import type { WeddingInfo } from "@/lib/types";

interface Row {
  id: number;
  currency: string;
  wedding_date: string | null;
  expected_guests: number;
  rsvp_accepted: number;
  rsvp_declined: number;
  rsvp_pending: number;
  actual_attendance: number | null;
  updated_at: string;
}

function mapRow(row: Row): WeddingInfo {
  return {
    id: row.id,
    currency: row.currency,
    weddingDate: row.wedding_date,
    expectedGuests: row.expected_guests,
    rsvpAccepted: row.rsvp_accepted,
    rsvpDeclined: row.rsvp_declined,
    rsvpPending: row.rsvp_pending,
    actualAttendance: row.actual_attendance,
    updatedAt: row.updated_at,
  };
}

export function getWeddingInfo(): WeddingInfo {
  const db = getDb();
  const row = db.prepare("SELECT * FROM wedding_info WHERE id = 1").get() as unknown as Row;
  return mapRow(row);
}

export function updateWeddingInfo(input: Partial<Omit<WeddingInfo, "id" | "updatedAt">>): WeddingInfo {
  const db = getDb();
  const existing = getWeddingInfo();
  const now = nowIso();
  db.prepare(
    `UPDATE wedding_info SET
      currency = ?, wedding_date = ?, expected_guests = ?, rsvp_accepted = ?, rsvp_declined = ?,
      rsvp_pending = ?, actual_attendance = ?, updated_at = ?
    WHERE id = 1`
  ).run(
    input.currency ?? existing.currency,
    input.weddingDate !== undefined ? input.weddingDate : existing.weddingDate,
    input.expectedGuests ?? existing.expectedGuests,
    input.rsvpAccepted ?? existing.rsvpAccepted,
    input.rsvpDeclined ?? existing.rsvpDeclined,
    input.rsvpPending ?? existing.rsvpPending,
    input.actualAttendance !== undefined ? input.actualAttendance : existing.actualAttendance,
    now
  );
  return getWeddingInfo();
}
