"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Droplets, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { addWater, deleteWaterLog } from "@/lib/actions/water";
import type { WaterLog } from "@/types";

const QUICK_AMOUNTS = [200, 250, 330, 500];

export function WaterTracker({
  date,
  logs,
  goalMl,
}: {
  date: string;
  logs: WaterLog[];
  goalMl: number;
}) {
  const [custom, setCustom] = useState(300);
  const [pending, startTransition] = useTransition();
  const total = logs.reduce((sum, l) => sum + l.amount_ml, 0);
  const pct = goalMl > 0 ? Math.min(100, Math.round((total / goalMl) * 100)) : 0;

  function add(amount: number) {
    if (amount <= 0) return;
    startTransition(async () => {
      try {
        await addWater(date, amount);
      } catch {
        toast.error("Couldn't log water");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <div className="relative flex size-32 items-center justify-center">
            <svg viewBox="0 0 100 100" className="size-32 -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="var(--chart-5)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <Droplets className="mb-1 size-5 text-[color:var(--chart-5)]" />
              <span className="font-mono text-xl font-semibold">{(total / 1000).toFixed(2)}L</span>
              <span className="text-xs text-muted-foreground">of {(goalMl / 1000).toFixed(1)}L</span>
            </div>
          </div>

          <div className="grid w-full grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((amt) => (
              <Button key={amt} variant="outline" disabled={pending} onClick={() => add(amt)}>
                +{amt}
              </Button>
            ))}
          </div>

          <div className="flex w-full items-center gap-2">
            <Input
              type="number"
              min={1}
              value={custom}
              onChange={(e) => setCustom(Number(e.target.value) || 0)}
              className="flex-1"
            />
            <Button disabled={pending} onClick={() => add(custom)}>
              <Plus className="size-4" />
              Add ml
            </Button>
          </div>
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-1 pt-6">
            {logs
              .slice()
              .reverse()
              .map((log) => (
                <div key={log.id} className="flex items-center justify-between py-1 text-sm">
                  <span className="text-muted-foreground">
                    {new Date(log.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="font-mono">{log.amount_ml}ml</span>
                  <button
                    type="button"
                    className="text-muted-foreground/60 hover:text-destructive"
                    onClick={() => startTransition(() => deleteWaterLog(log.id))}
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
