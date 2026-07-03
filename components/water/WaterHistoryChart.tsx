"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

export function WaterHistoryChart({ data }: { data: { date: string; amount_ml: number }[] }) {
  const chartData = data.map((d) => ({
    label: format(parseISO(d.date), "EEE"),
    liters: Math.round((d.amount_ml / 1000) * 100) / 100,
  }));

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-medium">Last 7 days</h3>
      </CardHeader>
      <CardContent className="h-48 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} width={30} />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => [`${value}L`, "Water"]}
            />
            <Bar dataKey="liters" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
