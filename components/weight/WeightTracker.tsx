"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { upsertWeightLog, deleteWeightLog } from "@/lib/actions/weight";
import { kgToLb, lbToKg } from "@/lib/utils/nutrition";
import { todayStr } from "@/lib/utils/date";
import type { WeightLog, WeightUnit } from "@/types";

export function WeightTracker({
  logs,
  unit,
  goalWeightKg,
}: {
  logs: WeightLog[];
  unit: WeightUnit;
  goalWeightKg: number | null;
}) {
  const [value, setValue] = useState<string>(() => {
    const latest = logs.at(-1);
    if (!latest) return "";
    return String(unit === "lb" ? kgToLb(latest.weight_kg) : latest.weight_kg);
  });
  const [pending, startTransition] = useTransition();

  const latest = logs.at(-1);
  const previous = logs.at(-2);
  const displayLatest = latest ? (unit === "lb" ? kgToLb(latest.weight_kg) : latest.weight_kg) : null;
  const delta =
    latest && previous
      ? (unit === "lb" ? kgToLb(latest.weight_kg) : latest.weight_kg) -
        (unit === "lb" ? kgToLb(previous.weight_kg) : previous.weight_kg)
      : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(value);
    if (!parsed || parsed <= 0) return;
    const weightKg = unit === "lb" ? lbToKg(parsed) : parsed;

    startTransition(async () => {
      try {
        await upsertWeightLog(todayStr(), weightKg);
        toast.success("Weight logged");
      } catch {
        toast.error("Couldn't save weight");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Current</p>
              <p className="font-mono text-3xl font-semibold">
                {displayLatest !== null ? `${displayLatest} ${unit}` : "—"}
              </p>
              {delta !== null && (
                <p
                  className={
                    delta === 0
                      ? "text-xs text-muted-foreground"
                      : delta < 0
                        ? "text-xs text-[color:var(--chart-5)]"
                        : "text-xs text-destructive"
                  }
                >
                  {delta > 0 ? "+" : ""}
                  {delta.toFixed(1)} {unit} since last log
                </p>
              )}
            </div>
            {goalWeightKg && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Goal</p>
                <p className="font-mono text-lg">
                  {unit === "lb" ? kgToLb(goalWeightKg) : goalWeightKg} {unit}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="weight">Log today&apos;s weight ({unit})</Label>
              <Input
                id="weight"
                type="number"
                step={0.1}
                min={1}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={pending}>
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-1 pt-6">
            {logs
              .slice()
              .reverse()
              .slice(0, 10)
              .map((log) => (
                <div key={log.id} className="flex items-center justify-between py-1 text-sm">
                  <span className="text-muted-foreground">{log.logged_date}</span>
                  <span className="font-mono">
                    {unit === "lb" ? kgToLb(log.weight_kg) : log.weight_kg} {unit}
                  </span>
                  <button
                    type="button"
                    className="text-muted-foreground/60 hover:text-destructive"
                    onClick={() => startTransition(() => deleteWeightLog(log.id))}
                  >
                    Remove
                  </button>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
