import clsx from "clsx";
import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  tone?: "neutral" | "rose" | "emerald" | "amber" | "red";
}

const toneClasses: Record<string, string> = {
  neutral: "text-foreground",
  rose: "text-rose-600 dark:text-rose-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
  red: "text-red-600 dark:text-red-400",
};

export function StatCard({ label, value, hint, icon, tone = "neutral" }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-foreground/60">{label}</p>
        {icon && <div className="text-foreground/30">{icon}</div>}
      </div>
      <p className={clsx("mt-2 text-2xl font-semibold tracking-tight", toneClasses[tone])}>{value}</p>
      {hint && <p className="mt-1 text-xs text-foreground/50">{hint}</p>}
    </Card>
  );
}
