import { get, put } from "@vercel/blob";
import fs from "node:fs";
import path from "node:path";
import type { Category, CreditCard, Payment, SavingsAccount, Subcategory, WeddingInfo } from "@/lib/types";

export interface Store {
  weddingInfo: WeddingInfo;
  categories: Category[];
  subcategories: Subcategory[];
  payments: Payment[];
  savingsAccounts: SavingsAccount[];
  creditCards: CreditCard[];
}

const BLOB_PATHNAME = "wedding-budget-store.json";
const LOCAL_STORE_PATH =
  process.env.DATA_STORE_PATH || path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "store.json");

function defaultStore(): Store {
  const now = new Date().toISOString();
  return {
    weddingInfo: {
      id: 1,
      currency: "GBP",
      weddingDate: null,
      expectedGuests: 0,
      rsvpAccepted: 0,
      rsvpDeclined: 0,
      rsvpPending: 0,
      actualAttendance: null,
      updatedAt: now,
    },
    categories: [],
    subcategories: [],
    payments: [],
    savingsAccounts: [],
    creditCards: [],
  };
}

function hasBlobToken(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function assertNotVercel(): void {
  if (process.env.VERCEL) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set. Connect a Vercel Blob store to this project in the Vercel dashboard under Storage, then redeploy."
    );
  }
}

async function readLocalStore(): Promise<Store> {
  try {
    const raw = fs.readFileSync(LOCAL_STORE_PATH, "utf-8");
    return JSON.parse(raw) as Store;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      const store = defaultStore();
      await writeLocalStore(store);
      return store;
    }
    throw err;
  }
}

async function writeLocalStore(store: Store): Promise<void> {
  fs.mkdirSync(path.dirname(LOCAL_STORE_PATH), { recursive: true });
  fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(store, null, 2));
}

async function readBlobStore(): Promise<Store> {
  const result = await get(BLOB_PATHNAME, { access: "private" });
  if (!result) {
    const store = defaultStore();
    await writeBlobStore(store);
    return store;
  }
  const text = await new Response(result.stream).text();
  return JSON.parse(text) as Store;
}

async function writeBlobStore(store: Store): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(store), {
    access: "private",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json",
  });
}

/** Reads the whole app-data document. Single JSON blob keeps this within Vercel's free Hobby tier (a few KB vs. the 1GB included). */
export async function readStore(): Promise<Store> {
  if (!hasBlobToken()) assertNotVercel();
  return hasBlobToken() ? readBlobStore() : readLocalStore();
}

export async function writeStore(store: Store): Promise<void> {
  if (!hasBlobToken()) assertNotVercel();
  return hasBlobToken() ? writeBlobStore(store) : writeLocalStore(store);
}

/** Read-modify-write helper: loads the store, lets the mutator update it in place, then persists once. */
export async function withStore<T>(mutator: (store: Store) => T): Promise<T> {
  const store = await readStore();
  const result = mutator(store);
  await writeStore(store);
  return result;
}
