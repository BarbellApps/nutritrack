"use client";

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { kgToLb } from "@/lib/utils/nutrition";
import type { WeightUnit } from "@/types";

export function WeightChart({
  data,
  unit,
}: {
  data: { logged_date: string; weight_kg: number }[];
  unit: WeightUnit;
}) {
  const chartData = data.map((d) => ({
    label: format(parseISO(d.logged_date), "MMM d"),
    weight: unit === "lb" ? kgToLb(d.weight_kg) : d.weight_kg,
  }));

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-medium">Weight trend</h3>
      </CardHeader>
      <CardContent className="h-56 pt-0">
        {chartData.length < 2 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Log weight on a few more days to see your trend.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={36}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) => [`${value} ${unit}`, "Weight"]}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
