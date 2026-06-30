// Seeds realistic sample data into the running dev server via its REST API.
// Usage: dev server must already be running, then `npm run seed`.

const BASE_URL = process.env.SEED_BASE_URL || "http://localhost:3000";

async function call(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${path} failed (${res.status}): ${text}`);
  }
  if (res.status === 204) return undefined;
  return res.json();
}

async function main() {
  console.log(`Seeding against ${BASE_URL} ...`);

  await call("PATCH", "/api/wedding-info", {
    currency: "GBP",
    weddingDate: "2026-09-12",
    expectedGuests: 120,
    rsvpAccepted: 95,
    rsvpDeclined: 10,
    rsvpPending: 15,
  });
  console.log("Wedding info set.");

  const jointSavings = await call("POST", "/api/savings", { name: "Joint Wedding Savings", balance: 15000 });
  const personalSavings = await call("POST", "/api/savings", { name: "Personal Savings", balance: 4000 });
  const amex = await call("POST", "/api/credit-cards", { name: "Amex Gold", creditLimit: 5000, availableCredit: 3500 });
  const barclaycard = await call("POST", "/api/credit-cards", { name: "Barclaycard", creditLimit: 3000, availableCredit: 3000 });
  console.log("Payment sources created.");

  const categories = {};
  for (const name of [
    "Venue & Catering",
    "Photography & Video",
    "Attire",
    "Flowers & Decor",
    "Music & Entertainment",
    "Stationery & Favors",
    "Transport",
  ]) {
    categories[name] = await call("POST", "/api/categories", { name });
  }
  console.log("Categories created.");

  async function addSub(categoryName, input) {
    return call("POST", "/api/subcategories", { categoryId: categories[categoryName].id, ...input });
  }

  const venueHall = await addSub("Venue & Catering", {
    name: "Reception Venue Hire",
    description: "Manor House exclusive hire for the day",
    pricingModel: "FIXED",
    estimatedCost: 8000,
    actualCost: 8500,
    depositAmount: 2000,
    depositRefundable: false,
    vendorName: "The Old Manor House",
    dueDate: "2026-07-01",
    notes: "Final balance due 6 weeks before the wedding.",
  });

  await addSub("Venue & Catering", {
    name: "Wedding Breakfast Catering",
    description: "Three-course meal per guest",
    pricingModel: "PER_GUEST",
    estimatedRate: 65,
    actualRate: 68,
    depositAmount: 500,
    depositRefundable: false,
    vendorName: "Harvest Table Catering",
    dueDate: "2026-08-15",
  });

  const evening = await addSub("Venue & Catering", {
    name: "Evening Buffet",
    pricingModel: "PER_GUEST",
    estimatedRate: 12,
    actualRate: 12,
    vendorName: "Harvest Table Catering",
    dueDate: "2026-08-15",
  });

  const photography = await addSub("Photography & Video", {
    name: "Wedding Photographer",
    description: "Full day coverage, 2 photographers",
    pricingModel: "FIXED",
    estimatedCost: 2200,
    actualCost: 2200,
    depositAmount: 400,
    depositRefundable: false,
    vendorName: "Aperture & Co",
    dueDate: "2026-08-01",
  });

  const videography = await addSub("Photography & Video", {
    name: "Videographer",
    pricingModel: "FIXED",
    estimatedCost: 1500,
    actualCost: 1500,
    vendorName: "Aperture & Co",
    dueDate: "2026-08-01",
  });

  const weddingDress = await addSub("Attire", {
    name: "Wedding Dress",
    pricingModel: "FIXED",
    estimatedCost: 1800,
    actualCost: 1950,
    depositAmount: 300,
    depositRefundable: false,
    vendorName: "Belle Bridal Boutique",
    dueDate: "2026-07-20",
  });

  const groomSuit = await addSub("Attire", {
    name: "Groom & Groomsmen Suits",
    pricingModel: "PER_UNIT",
    estimatedRate: 150,
    actualRate: 150,
    quantity: 5,
    vendorName: "Savile Row Hire",
    dueDate: "2026-08-10",
  });

  const florist = await addSub("Flowers & Decor", {
    name: "Florist Package",
    description: "Bouquets, centrepieces, arch florals",
    pricingModel: "FIXED",
    estimatedCost: 1200,
    actualCost: 1200,
    depositAmount: 200,
    depositRefundable: true,
    vendorName: "Bloom & Wild Weddings",
    dueDate: "2026-08-20",
    notes: "Deposit refundable if cancelled before 30 days out.",
  });

  const centerpieces = await addSub("Flowers & Decor", {
    name: "Table Centerpieces",
    pricingModel: "PER_UNIT",
    estimatedRate: 35,
    actualRate: 35,
    quantity: 14,
    vendorName: "Bloom & Wild Weddings",
  });

  const band = await addSub("Music & Entertainment", {
    name: "Live Band",
    pricingModel: "FIXED",
    estimatedCost: 1600,
    actualCost: 1600,
    depositAmount: 300,
    depositRefundable: true,
    vendorName: "The Reception Band",
    dueDate: "2026-08-25",
    notes: "Deposit refundable up to 60 days before the event.",
  });

  const dj = await addSub("Music & Entertainment", {
    name: "DJ for Evening",
    pricingModel: "FIXED",
    estimatedCost: 500,
    actualCost: 500,
    vendorName: "Mobile Disco Co",
  });

  const invites = await addSub("Stationery & Favors", {
    name: "Invitations & Save the Dates",
    pricingModel: "PER_GUEST",
    estimatedRate: 4,
    actualRate: 4,
    vendorName: "Paper & Twine Studio",
  });

  const favors = await addSub("Stationery & Favors", {
    name: "Guest Favors",
    pricingModel: "PER_GUEST",
    estimatedRate: 3.5,
    actualRate: 3.5,
    vendorName: "Paper & Twine Studio",
  });

  const transport = await addSub("Transport", {
    name: "Wedding Car Hire",
    pricingModel: "FIXED",
    estimatedCost: 450,
    actualCost: 450,
    vendorName: "Classic Car Hire Ltd",
    dueDate: "2026-09-01",
  });

  console.log("Subcategories created across FIXED, PER_GUEST, and PER_UNIT pricing models.");

  await call("POST", `/api/subcategories/${venueHall.id}/payments`, {
    amount: 2000,
    isDeposit: true,
    splits: [{ sourceType: "SAVINGS", savingsAccountId: jointSavings.id, amount: 2000 }],
  });

  await call("POST", `/api/subcategories/${venueHall.id}/payments`, {
    amount: 6500,
    splits: [
      { sourceType: "SAVINGS", savingsAccountId: jointSavings.id, amount: 4500 },
      { sourceType: "CREDIT_CARD", creditCardId: amex.id, amount: 2000 },
    ],
  });

  await call("POST", `/api/subcategories/${photography.id}/payments`, {
    amount: 2200,
    splits: [{ sourceType: "SAVINGS", savingsAccountId: jointSavings.id, amount: 2200 }],
  });

  await call("POST", `/api/subcategories/${weddingDress.id}/payments`, {
    amount: 300,
    isDeposit: true,
    splits: [{ sourceType: "SAVINGS", savingsAccountId: personalSavings.id, amount: 300 }],
  });

  await call("POST", `/api/subcategories/${groomSuit.id}/payments`, {
    amount: 375,
    splits: [{ sourceType: "CREDIT_CARD", creditCardId: barclaycard.id, amount: 375 }],
  });

  await call("POST", `/api/subcategories/${band.id}/payments`, {
    amount: 300,
    isDeposit: true,
    splits: [{ sourceType: "SAVINGS", savingsAccountId: jointSavings.id, amount: 300 }],
  });

  await call("POST", `/api/subcategories/${transport.id}/payments`, {
    amount: 450,
    splits: [{ sourceType: "CREDIT_CARD", creditCardId: amex.id, amount: 450 }],
  });

  await call("POST", `/api/subcategories/${florist.id}/payments`, {
    amount: 200,
    isDeposit: true,
    splits: [{ sourceType: "SAVINGS", savingsAccountId: jointSavings.id, amount: 200 }],
  });

  console.log("Payments recorded (deposits, full payments, and a multi-source split).");

  await call("POST", `/api/subcategories/${florist.id}/refund`, {
    status: "REFUNDED",
    creditToSavingsAccountId: jointSavings.id,
  });

  console.log("Florist refundable deposit marked as REFUNDED and credited back to Joint Wedding Savings.");

  console.log("\nSeed complete. Untouched subcategories left as NOT_STARTED for variety:");
  for (const s of [evening, videography, centerpieces, dj, invites, favors]) {
    console.log(` - ${s.name}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
