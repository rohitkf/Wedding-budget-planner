import clsx from "clsx";
import type { ExpenseStatus, RefundStatus } from "@/lib/types";

const STATUS_STYLES: Record<ExpenseStatus, string> = {
  NOT_STARTED: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  DEPOSIT_PAID: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  PARTIALLY_PAID: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  FULLY_PAID: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const STATUS_LABELS: Record<ExpenseStatus, string> = {
  NOT_STARTED: "Not Started",
  DEPOSIT_PAID: "Deposit Paid",
  PARTIALLY_PAID: "Partially Paid",
  FULLY_PAID: "Fully Paid",
};

export function StatusBadge({ status }: { status: ExpenseStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

const REFUND_STYLES: Record<RefundStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  REFUNDED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

export function RefundBadge({ status }: { status: RefundStatus }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", REFUND_STYLES[status])}>
      {status === "PENDING" ? "Refund Pending" : "Refunded"}
    </span>
  );
}

export function Badge({
  className,
  children,
  tone = "neutral",
}: {
  className?: string;
  children: React.ReactNode;
  tone?: "neutral" | "rose" | "emerald" | "amber";
}) {
  const toneClasses: Record<string, string> = {
    neutral: "bg-surface-muted text-foreground/70",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  };
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", toneClasses[tone], className)}>
      {children}
    </span>
  );
}
