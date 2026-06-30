import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import type { WeddingInfo } from "@/lib/types";

export function GuestSummaryCard({ weddingInfo }: { weddingInfo: WeddingInfo }) {
  const items = [
    { label: "Expected Guests", value: weddingInfo.expectedGuests, tone: "text-foreground" },
    { label: "RSVP Accepted", value: weddingInfo.rsvpAccepted, tone: "text-emerald-600 dark:text-emerald-400" },
    { label: "Pending", value: weddingInfo.rsvpPending, tone: "text-amber-600 dark:text-amber-400" },
    { label: "Declined", value: weddingInfo.rsvpDeclined, tone: "text-red-600 dark:text-red-400" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guest Summary</CardTitle>
      </CardHeader>
      <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-xs text-foreground/50">{item.label}</p>
            <p className={`mt-1 text-xl font-semibold ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
