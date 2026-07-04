import { Card, CardContent } from "@/components/ui/card";

interface Props {
  caloriesEaten: number;
  calorieGoal: number;
  protein: { value: number; goal: number };
  carbs: { value: number; goal: number };
  fat: { value: number; goal: number };
}

interface Ring {
  label: string;
  value: number;
  goal: number;
  unit: string;
  colorVar: string;
  radius: number;
}

function ringPct(value: number, goal: number) {
  return goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
}

function RingsCard({ rings }: { rings: Ring[] }) {
  const size = 132;
  const stroke = 11;
  const center = size / 2;

  return (
    <Card>
      <CardContent className="flex items-center gap-6">
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90 shrink-0">
          {rings.map((ring) => {
            const circumference = 2 * Math.PI * ring.radius;
            const pct = ringPct(ring.value, ring.goal);
            return (
              <g key={ring.label}>
                <circle
                  cx={center}
                  cy={center}
                  r={ring.radius}
                  fill="none"
                  stroke="var(--muted)"
                  strokeWidth={stroke}
                />
                <circle
                  cx={center}
                  cy={center}
                  r={ring.radius}
                  fill="none"
                  stroke={`var(${ring.colorVar})`}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - pct / 100)}
                />
              </g>
            );
          })}
        </svg>
        <div className="flex flex-1 flex-col gap-2.5">
          {rings.map((ring) => (
            <div key={ring.label} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-medium">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: `var(${ring.colorVar})` }}
                />
                {ring.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(ring.value)}
                {ring.unit} / {Math.round(ring.goal)}
                {ring.unit}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({
  label,
  value,
  unit,
  subtitle,
  pct,
  colorVar,
}: {
  label: string;
  value: number;
  unit: string;
  subtitle: string;
  pct: number;
  colorVar: string;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight">{Math.round(value).toLocaleString()}</span>
          <span className="text-sm font-medium text-muted-foreground">{unit}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: `var(${colorVar})` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function CalorieSummary({ caloriesEaten, calorieGoal, protein, carbs, fat }: Props) {
  const remaining = calorieGoal - caloriesEaten;
  const over = remaining < 0;

  const rings: Ring[] = [
    { label: "Calories", value: caloriesEaten, goal: calorieGoal, unit: "", colorVar: "--chart-1", radius: 58 },
    { label: "Protein", value: protein.value, goal: protein.goal, unit: "g", colorVar: "--chart-2", radius: 45 },
    { label: "Carbs", value: carbs.value, goal: carbs.goal, unit: "g", colorVar: "--chart-3", radius: 32 },
  ];

  return (
    <div className="flex flex-col gap-3">
      <RingsCard rings={rings} />

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Calories"
          value={Math.abs(remaining)}
          unit={over ? "over" : "left"}
          subtitle={`${Math.round(caloriesEaten).toLocaleString()} of ${Math.round(calorieGoal).toLocaleString()} kcal`}
          pct={ringPct(caloriesEaten, calorieGoal)}
          colorVar="--chart-1"
        />
        <StatCard
          label="Protein"
          value={protein.value}
          unit="g"
          subtitle={`of ${Math.round(protein.goal)}g goal`}
          pct={ringPct(protein.value, protein.goal)}
          colorVar="--chart-2"
        />
        <StatCard
          label="Carbs"
          value={carbs.value}
          unit="g"
          subtitle={`of ${Math.round(carbs.goal)}g goal`}
          pct={ringPct(carbs.value, carbs.goal)}
          colorVar="--chart-3"
        />
        <StatCard
          label="Fat"
          value={fat.value}
          unit="g"
          subtitle={`of ${Math.round(fat.goal)}g goal`}
          pct={ringPct(fat.value, fat.goal)}
          colorVar="--chart-4"
        />
      </div>
    </div>
  );
}
