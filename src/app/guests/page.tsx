"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useAppMutation } from "@/hooks/useAppMutation";
import { api } from "@/lib/apiClient";
import { formatCurrency } from "@/lib/currency";
import { simulateGuestCount } from "@/lib/calculations";
import type { WeddingInfo } from "@/lib/types";

function GuestDetailsForm({ weddingInfo, guestLinkedCount }: { weddingInfo: WeddingInfo; guestLinkedCount: number }) {
  const [expectedGuests, setExpectedGuests] = useState(String(weddingInfo.expectedGuests));
  const [rsvpAccepted, setRsvpAccepted] = useState(String(weddingInfo.rsvpAccepted));
  const [rsvpDeclined, setRsvpDeclined] = useState(String(weddingInfo.rsvpDeclined));
  const [rsvpPending, setRsvpPending] = useState(String(weddingInfo.rsvpPending));
  const [actualAttendance, setActualAttendance] = useState(
    weddingInfo.actualAttendance != null ? String(weddingInfo.actualAttendance) : ""
  );

  const update = useAppMutation(api.updateWeddingInfo, { successMessage: "Guest details saved" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await update.mutateAsync({
      expectedGuests: Number(expectedGuests) || 0,
      rsvpAccepted: Number(rsvpAccepted) || 0,
      rsvpDeclined: Number(rsvpDeclined) || 0,
      rsvpPending: Number(rsvpPending) || 0,
      actualAttendance: actualAttendance.trim() === "" ? null : Number(actualAttendance) || 0,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="guests-expected">Expected Guests</Label>
          <Input
            id="guests-expected"
            type="number"
            min={0}
            value={expectedGuests}
            onChange={(e) => setExpectedGuests(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="guests-accepted">RSVP Accepted</Label>
          <Input
            id="guests-accepted"
            type="number"
            min={0}
            value={rsvpAccepted}
            onChange={(e) => setRsvpAccepted(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="guests-declined">RSVP Declined</Label>
          <Input
            id="guests-declined"
            type="number"
            min={0}
            value={rsvpDeclined}
            onChange={(e) => setRsvpDeclined(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="guests-pending">RSVP Pending</Label>
          <Input
            id="guests-pending"
            type="number"
            min={0}
            value={rsvpPending}
            onChange={(e) => setRsvpPending(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="guests-attendance">Actual Attendance</Label>
          <Input
            id="guests-attendance"
            type="number"
            min={0}
            value={actualAttendance}
            onChange={(e) => setActualAttendance(e.target.value)}
            placeholder="After the wedding"
          />
        </div>
      </div>
      <p className="text-xs text-foreground/50">
        {guestLinkedCount} subcategor{guestLinkedCount === 1 ? "y" : "ies"} use per-guest pricing and will
        recalculate automatically when Expected Guests changes.
      </p>
      <div className="flex justify-end">
        <Button type="submit" loading={update.isPending}>
          Save Guest Details
        </Button>
      </div>
    </form>
  );
}

export default function GuestsPage() {
  const { data, isLoading, error } = useAppData();
  const [simulatedGuests, setSimulatedGuests] = useState<string | null>(null);

  const simulation = useMemo(() => {
    if (!data) return null;
    const hypotheticalCount = Number(simulatedGuests ?? data.weddingInfo.expectedGuests) || 0;
    return simulateGuestCount(data.subcategories, hypotheticalCount);
  }, [data, simulatedGuests]);

  if (isLoading) {
    return <p className="text-sm text-foreground/50">Loading guest details...</p>;
  }
  if (error || !data) {
    return <p className="text-sm text-red-500">Failed to load guest details.</p>;
  }

  const currency = data.weddingInfo.currency;
  const currentGuestCount = data.weddingInfo.expectedGuests;
  const guestLinkedCount = data.subcategories.filter((s) => s.pricingModel === "PER_GUEST").length;
  const simulatedGuestsValue = simulatedGuests ?? String(currentGuestCount);

  const delta = simulation ? simulation.totalActual - data.summary.totalActualSpending : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Guests & Budget Simulator</h1>
        <p className="text-sm text-foreground/50">
          Guest count drives every per-guest priced item automatically. Use the simulator to preview budget impact
          before committing to a new guest count.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Guest Count & RSVPs</CardTitle>
        </CardHeader>
        <CardBody>
          <GuestDetailsForm
            key={data.weddingInfo.updatedAt}
            weddingInfo={data.weddingInfo}
            guestLinkedCount={guestLinkedCount}
          />
        </CardBody>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Budget Simulator</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <p className="text-sm text-foreground/60">
            Preview how your budget would change at a hypothetical guest count, without saving anything.
          </p>
          <div>
            <Label htmlFor="simulator-guests">Hypothetical Guest Count</Label>
            <Input
              id="simulator-guests"
              type="number"
              min={0}
              value={simulatedGuestsValue}
              onChange={(e) => setSimulatedGuests(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border-subtle p-4">
              <p className="text-xs text-foreground/50">Current ({currentGuestCount} guests)</p>
              <p className="mt-1 text-lg font-semibold">{formatCurrency(data.summary.totalActualSpending, currency)}</p>
              <p className="text-xs text-foreground/50">Estimated: {formatCurrency(data.summary.totalEstimatedBudget, currency)}</p>
            </div>
            <div className="rounded-lg border border-rose-300 bg-rose-50 p-4 dark:border-rose-900/60 dark:bg-rose-900/20">
              <p className="text-xs text-foreground/50">Simulated ({Number(simulatedGuestsValue) || 0} guests)</p>
              <p className="mt-1 text-lg font-semibold">{formatCurrency(simulation?.totalActual ?? 0, currency)}</p>
              <p className="text-xs text-foreground/50">Estimated: {formatCurrency(simulation?.totalEstimated ?? 0, currency)}</p>
            </div>
          </div>

          <p className={`text-sm font-medium ${delta > 0 ? "text-red-500" : delta < 0 ? "text-emerald-600" : "text-foreground/60"}`}>
            {delta === 0
              ? "No change from current actual spending."
              : `${delta > 0 ? "+" : ""}${formatCurrency(delta, currency)} vs current actual spending.`}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
