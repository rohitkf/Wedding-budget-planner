import { getComputedData } from "@/lib/aggregate";
import { handleApiError } from "@/lib/api-helpers";

function csvCell(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const HEADERS = [
  "Category",
  "Subcategory",
  "Vendor",
  "Pricing Model",
  "Estimated Cost",
  "Actual Cost",
  "Total Paid",
  "Remaining",
  "Status",
  "Deposit Amount",
  "Refundable",
  "Refund Status",
  "Due Date",
  "Notes",
];

export async function GET() {
  try {
    const { categories } = await getComputedData();
    const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
    const rows: string[] = [HEADERS.map(csvCell).join(",")];

    for (const category of categories) {
      for (const sub of category.subcategories) {
        rows.push(
          [
            categoryNameById.get(sub.categoryId) ?? "",
            sub.name,
            sub.vendorName ?? "",
            sub.pricingModel,
            sub.estimatedCostComputed.toFixed(2),
            sub.actualCostComputed.toFixed(2),
            sub.totalPaid.toFixed(2),
            sub.remaining.toFixed(2),
            sub.status,
            sub.depositAmount?.toFixed(2) ?? "",
            sub.depositRefundable ? "Yes" : "No",
            sub.refundStatus ?? "",
            sub.dueDate ?? "",
            sub.notes ?? "",
          ]
            .map(csvCell)
            .join(",")
        );
      }
    }

    const csv = rows.join("\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="wedding-budget-export.csv"`,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
