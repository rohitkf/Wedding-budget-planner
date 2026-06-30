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

  // Category IDs
  const catVenue = "cat-venue";
  const catPhoto = "cat-photo";
  const catAttire = "cat-attire";
  const catFlowers = "cat-flowers";
  const catMusic = "cat-music";
  const catStationery = "cat-stationery";
  const catTransport = "cat-transport";

  // Subcategory IDs
  const subVenueHall = "sub-venue-hall";
  const subCatering = "sub-catering";
  const subEveningBuffet = "sub-evening-buffet";
  const subPhotographer = "sub-photographer";
  const subVideographer = "sub-videographer";
  const subDress = "sub-dress";
  const subSuits = "sub-suits";
  const subFlorist = "sub-florist";
  const subCentrepieces = "sub-centrepieces";
  const subBand = "sub-band";
  const subDJ = "sub-dj";
  const subInvites = "sub-invites";
  const subFavors = "sub-favors";
  const subCar = "sub-car";

  // Payment source IDs
  const savJoint = "sav-joint";
  const savPersonal = "sav-personal";
  const ccAmex = "cc-amex";
  const ccBarclaycard = "cc-barclaycard";

  const categories: Category[] = [
    { id: catVenue,      name: "Venue & Catering",        sortOrder: 0, createdAt: now, updatedAt: now },
    { id: catPhoto,      name: "Photography & Video",      sortOrder: 1, createdAt: now, updatedAt: now },
    { id: catAttire,     name: "Attire",                   sortOrder: 2, createdAt: now, updatedAt: now },
    { id: catFlowers,    name: "Flowers & Decor",          sortOrder: 3, createdAt: now, updatedAt: now },
    { id: catMusic,      name: "Music & Entertainment",    sortOrder: 4, createdAt: now, updatedAt: now },
    { id: catStationery, name: "Stationery & Favors",      sortOrder: 5, createdAt: now, updatedAt: now },
    { id: catTransport,  name: "Transport",                sortOrder: 6, createdAt: now, updatedAt: now },
  ];

  const subcategories: Subcategory[] = [
    {
      id: subVenueHall, categoryId: catVenue, name: "Reception Venue Hire", sortOrder: 0,
      description: "Manor House exclusive hire for the day", pricingModel: "FIXED",
      estimatedCost: 8000, actualCost: 8500, estimatedRate: null, actualRate: null, quantity: null,
      depositAmount: 2000, depositRefundable: false, refundStatus: null,
      vendorName: "The Old Manor House", dueDate: "2026-07-01",
      notes: "Final balance due 6 weeks before the wedding.", createdAt: now, updatedAt: now,
    },
    {
      id: subCatering, categoryId: catVenue, name: "Wedding Breakfast Catering", sortOrder: 1,
      description: "Three-course meal per guest", pricingModel: "PER_GUEST",
      estimatedCost: null, actualCost: null, estimatedRate: 65, actualRate: 68, quantity: null,
      depositAmount: 500, depositRefundable: false, refundStatus: null,
      vendorName: "Harvest Table Catering", dueDate: "2026-08-15",
      notes: null, createdAt: now, updatedAt: now,
    },
    {
      id: subEveningBuffet, categoryId: catVenue, name: "Evening Buffet", sortOrder: 2,
      description: null, pricingModel: "PER_GUEST",
      estimatedCost: null, actualCost: null, estimatedRate: 12, actualRate: 12, quantity: null,
      depositAmount: null, depositRefundable: false, refundStatus: null,
      vendorName: "Harvest Table Catering", dueDate: "2026-08-15",
      notes: null, createdAt: now, updatedAt: now,
    },
    {
      id: subPhotographer, categoryId: catPhoto, name: "Wedding Photographer", sortOrder: 0,
      description: "Full day coverage, 2 photographers", pricingModel: "FIXED",
      estimatedCost: 2200, actualCost: 2200, estimatedRate: null, actualRate: null, quantity: null,
      depositAmount: 400, depositRefundable: false, refundStatus: null,
      vendorName: "Aperture & Co", dueDate: "2026-08-01",
      notes: null, createdAt: now, updatedAt: now,
    },
    {
      id: subVideographer, categoryId: catPhoto, name: "Videographer", sortOrder: 1,
      description: null, pricingModel: "FIXED",
      estimatedCost: 1500, actualCost: 1500, estimatedRate: null, actualRate: null, quantity: null,
      depositAmount: null, depositRefundable: false, refundStatus: null,
      vendorName: "Aperture & Co", dueDate: "2026-08-01",
      notes: null, createdAt: now, updatedAt: now,
    },
    {
      id: subDress, categoryId: catAttire, name: "Wedding Dress", sortOrder: 0,
      description: null, pricingModel: "FIXED",
      estimatedCost: 1800, actualCost: 1950, estimatedRate: null, actualRate: null, quantity: null,
      depositAmount: 300, depositRefundable: false, refundStatus: null,
      vendorName: "Belle Bridal Boutique", dueDate: "2026-07-20",
      notes: null, createdAt: now, updatedAt: now,
    },
    {
      id: subSuits, categoryId: catAttire, name: "Groom & Groomsmen Suits", sortOrder: 1,
      description: null, pricingModel: "PER_UNIT",
      estimatedCost: null, actualCost: null, estimatedRate: 150, actualRate: 150, quantity: 5,
      depositAmount: null, depositRefundable: false, refundStatus: null,
      vendorName: "Savile Row Hire", dueDate: "2026-08-10",
      notes: null, createdAt: now, updatedAt: now,
    },
    {
      id: subFlorist, categoryId: catFlowers, name: "Florist Package", sortOrder: 0,
      description: "Bouquets, centrepieces, arch florals", pricingModel: "FIXED",
      estimatedCost: 1200, actualCost: 1200, estimatedRate: null, actualRate: null, quantity: null,
      depositAmount: 200, depositRefundable: true, refundStatus: "REFUNDED",
      vendorName: "Bloom & Wild Weddings", dueDate: "2026-08-20",
      notes: "Deposit refundable if cancelled before 30 days out.", createdAt: now, updatedAt: now,
    },
    {
      id: subCentrepieces, categoryId: catFlowers, name: "Table Centrepieces", sortOrder: 1,
      description: null, pricingModel: "PER_UNIT",
      estimatedCost: null, actualCost: null, estimatedRate: 35, actualRate: 35, quantity: 14,
      depositAmount: null, depositRefundable: false, refundStatus: null,
      vendorName: "Bloom & Wild Weddings", dueDate: null,
      notes: null, createdAt: now, updatedAt: now,
    },
    {
      id: subBand, categoryId: catMusic, name: "Live Band", sortOrder: 0,
      description: null, pricingModel: "FIXED",
      estimatedCost: 1600, actualCost: 1600, estimatedRate: null, actualRate: null, quantity: null,
      depositAmount: 300, depositRefundable: true, refundStatus: "PENDING",
      vendorName: "The Reception Band", dueDate: "2026-08-25",
      notes: "Deposit refundable up to 60 days before the event.", createdAt: now, updatedAt: now,
    },
    {
      id: subDJ, categoryId: catMusic, name: "DJ for Evening", sortOrder: 1,
      description: null, pricingModel: "FIXED",
      estimatedCost: 500, actualCost: 500, estimatedRate: null, actualRate: null, quantity: null,
      depositAmount: null, depositRefundable: false, refundStatus: null,
      vendorName: "Mobile Disco Co", dueDate: null,
      notes: null, createdAt: now, updatedAt: now,
    },
    {
      id: subInvites, categoryId: catStationery, name: "Invitations & Save the Dates", sortOrder: 0,
      description: null, pricingModel: "PER_GUEST",
      estimatedCost: null, actualCost: null, estimatedRate: 4, actualRate: 4, quantity: null,
      depositAmount: null, depositRefundable: false, refundStatus: null,
      vendorName: "Paper & Twine Studio", dueDate: null,
      notes: null, createdAt: now, updatedAt: now,
    },
    {
      id: subFavors, categoryId: catStationery, name: "Guest Favors", sortOrder: 1,
      description: null, pricingModel: "PER_GUEST",
      estimatedCost: null, actualCost: null, estimatedRate: 3.5, actualRate: 3.5, quantity: null,
      depositAmount: null, depositRefundable: false, refundStatus: null,
      vendorName: "Paper & Twine Studio", dueDate: null,
      notes: null, createdAt: now, updatedAt: now,
    },
    {
      id: subCar, categoryId: catTransport, name: "Wedding Car Hire", sortOrder: 0,
      description: null, pricingModel: "FIXED",
      estimatedCost: 450, actualCost: 450, estimatedRate: null, actualRate: null, quantity: null,
      depositAmount: null, depositRefundable: false, refundStatus: null,
      vendorName: "Classic Car Hire Ltd", dueDate: "2026-09-01",
      notes: null, createdAt: now, updatedAt: now,
    },
  ];

  const savingsAccounts: SavingsAccount[] = [
    { id: savJoint,    name: "Joint Wedding Savings", balance: 6000,  createdAt: now, updatedAt: now },
    { id: savPersonal, name: "Personal Savings",      balance: 3700,  createdAt: now, updatedAt: now },
  ];

  const creditCards: CreditCard[] = [
    { id: ccAmex,        name: "Amex Gold",   creditLimit: 5000, availableCredit: 1050, createdAt: now, updatedAt: now },
    { id: ccBarclaycard, name: "Barclaycard", creditLimit: 3000, availableCredit: 2625, createdAt: now, updatedAt: now },
  ];

  const payments: Payment[] = [
    // Venue deposit
    { id: "pay-1", subcategoryId: subVenueHall,   sourceType: "SAVINGS",     savingsAccountId: savJoint,    creditCardId: null, amount: 2000, isDeposit: true,  paidAt: now, createdAt: now },
    // Venue balance (split)
    { id: "pay-2", subcategoryId: subVenueHall,   sourceType: "SAVINGS",     savingsAccountId: savJoint,    creditCardId: null, amount: 4500, isDeposit: false, paidAt: now, createdAt: now },
    { id: "pay-3", subcategoryId: subVenueHall,   sourceType: "CREDIT_CARD", savingsAccountId: null, creditCardId: ccAmex,        amount: 2000, isDeposit: false, paidAt: now, createdAt: now },
    // Photographer (fully paid)
    { id: "pay-4", subcategoryId: subPhotographer, sourceType: "SAVINGS",    savingsAccountId: savJoint,    creditCardId: null, amount: 2200, isDeposit: false, paidAt: now, createdAt: now },
    // Dress deposit
    { id: "pay-5", subcategoryId: subDress,        sourceType: "SAVINGS",    savingsAccountId: savPersonal, creditCardId: null, amount: 300,  isDeposit: true,  paidAt: now, createdAt: now },
    // Suits partial
    { id: "pay-6", subcategoryId: subSuits,        sourceType: "CREDIT_CARD", savingsAccountId: null, creditCardId: ccBarclaycard, amount: 375, isDeposit: false, paidAt: now, createdAt: now },
    // Band deposit
    { id: "pay-7", subcategoryId: subBand,         sourceType: "SAVINGS",    savingsAccountId: savJoint,    creditCardId: null, amount: 300,  isDeposit: true,  paidAt: now, createdAt: now },
    // Car (fully paid)
    { id: "pay-8", subcategoryId: subCar,          sourceType: "CREDIT_CARD", savingsAccountId: null, creditCardId: ccAmex,        amount: 450,  isDeposit: false, paidAt: now, createdAt: now },
    // Florist deposit (refunded)
    { id: "pay-9", subcategoryId: subFlorist,      sourceType: "SAVINGS",    savingsAccountId: savJoint,    creditCardId: null, amount: 200,  isDeposit: true,  paidAt: now, createdAt: now },
  ];

  return {
    weddingInfo: {
      id: 1,
      currency: "GBP",
      weddingDate: "2026-09-12",
      expectedGuests: 120,
      rsvpAccepted: 95,
      rsvpDeclined: 10,
      rsvpPending: 15,
      actualAttendance: null,
      updatedAt: now,
    },
    categories,
    subcategories,
    payments,
    savingsAccounts,
    creditCards,
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
