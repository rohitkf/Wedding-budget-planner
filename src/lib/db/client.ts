import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "wedding.db");

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subcategories (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  pricing_model TEXT NOT NULL DEFAULT 'FIXED',
  estimated_cost REAL,
  actual_cost REAL,
  estimated_rate REAL,
  actual_rate REAL,
  quantity REAL,
  deposit_amount REAL,
  deposit_refundable INTEGER NOT NULL DEFAULT 0,
  refund_status TEXT,
  vendor_name TEXT,
  due_date TEXT,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);

CREATE TABLE IF NOT EXISTS savings_accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  balance REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS credit_cards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  credit_limit REAL NOT NULL DEFAULT 0,
  available_credit REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  subcategory_id TEXT NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  savings_account_id TEXT REFERENCES savings_accounts(id),
  credit_card_id TEXT REFERENCES credit_cards(id),
  amount REAL NOT NULL,
  is_deposit INTEGER NOT NULL DEFAULT 0,
  paid_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_payments_subcategory ON payments(subcategory_id);

CREATE TABLE IF NOT EXISTS wedding_info (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  currency TEXT NOT NULL DEFAULT 'GBP',
  wedding_date TEXT,
  expected_guests INTEGER NOT NULL DEFAULT 0,
  rsvp_accepted INTEGER NOT NULL DEFAULT 0,
  rsvp_declined INTEGER NOT NULL DEFAULT 0,
  rsvp_pending INTEGER NOT NULL DEFAULT 0,
  actual_attendance INTEGER,
  updated_at TEXT NOT NULL
);
`;

function createDb(): DatabaseSync {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA_SQL);

  const row = db.prepare("SELECT id FROM wedding_info WHERE id = 1").get();
  if (!row) {
    db.prepare(
      `INSERT INTO wedding_info (id, currency, expected_guests, rsvp_accepted, rsvp_declined, rsvp_pending, updated_at)
       VALUES (1, 'GBP', 0, 0, 0, 0, ?)`
    ).run(new Date().toISOString());
  }

  return db;
}

declare global {
  var __weddingDb: DatabaseSync | undefined;
}

export function getDb(): DatabaseSync {
  if (!globalThis.__weddingDb) {
    globalThis.__weddingDb = createDb();
  }
  return globalThis.__weddingDb;
}
