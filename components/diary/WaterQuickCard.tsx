import Link from "next/link";
import { Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function WaterQuickCard({ amountMl, goalMl }: { amountMl: number; goalMl: number }) {
  const pct = goalMl > 0 ? Math.min(100, Math.round((amountMl / goalMl) * 100)) : 0;

  return (
    <Link href="/dashboard/water">
      <Card className="transition-colors hover:bg-accent/30">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklch,var(--chart-5)_18%,transparent)] text-[color:var(--chart-5)]">
            <Droplets className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Water</p>
            <p className="font-mono text-xs text-muted-foreground">
              {(amountMl / 1000).toFixed(2)}L / {(goalMl / 1000).toFixed(1)}L
            </p>
          </div>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[color:var(--chart-5)]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
