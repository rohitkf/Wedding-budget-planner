import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/currency";

export function FixedVariableCard({
  fixed,
  variable,
  currency,
}: {
  fixed: number;
  variable: number;
  currency: string;
}) {
  const total = fixed + variable;
  const fixedPct = total > 0 ? (fixed / total) * 100 : 0;
  const variablePct = total > 0 ? (variable / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fixed vs Variable Costs</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-muted">
          <div className="bg-rose-600" style={{ width: `${fixedPct}%` }} />
          <div className="bg-amber-500" style={{ width: `${variablePct}%` }} />
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <div>
            <p className="flex items-center gap-2 text-foreground/60">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> Fixed Costs
            </p>
            <p className="mt-1 text-lg font-semibold">{formatCurrency(fixed, currency)}</p>
          </div>
          <div className="text-right">
            <p className="flex items-center justify-end gap-2 text-foreground/60">
              Variable Costs <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            </p>
            <p className="mt-1 text-lg font-semibold">{formatCurrency(variable, currency)}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-foreground/50">
          Variable costs scale automatically with your guest count (per-guest priced items).
        </p>
      </CardBody>
    </Card>
  );
}
