"use client";

import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { useAppMutation } from "@/hooks/useAppMutation";
import { api } from "@/lib/apiClient";
import type { WeddingInfo } from "@/lib/types";

const CURRENCIES = [
  { code: "GBP", label: "British Pound (£)" },
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "AUD", label: "Australian Dollar (A$)" },
  { code: "CAD", label: "Canadian Dollar (C$)" },
];

function GeneralSettingsForm({ weddingInfo }: { weddingInfo: WeddingInfo }) {
  const [currency, setCurrency] = useState(weddingInfo.currency);
  const [weddingDate, setWeddingDate] = useState(weddingInfo.weddingDate ?? "");

  const update = useAppMutation(api.updateWeddingInfo, { successMessage: "Settings saved" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await update.mutateAsync({ currency, weddingDate: weddingDate || null });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="settings-currency">Currency</Label>
        <Select id="settings-currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="settings-date">Wedding Date</Label>
        <Input id="settings-date" type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" loading={update.isPending}>
          Save Settings
        </Button>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  const { data, isLoading, error } = useAppData();

  if (isLoading) {
    return <p className="text-sm text-foreground/50">Loading settings...</p>;
  }
  if (error || !data) {
    return <p className="text-sm text-red-500">Failed to load settings.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-foreground/50">Configure currency and wedding date for the whole app.</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardBody>
          <GeneralSettingsForm key={data.weddingInfo.updatedAt} weddingInfo={data.weddingInfo} />
        </CardBody>
      </Card>
    </div>
  );
}
