import { Card, CardContent } from "@/components/ui/card";

interface Props {
  caloriesEaten: number;
  calorieGoal: number;
  protein: { value: number; goal: number };
  carbs: { value: number; goal: number };
  fat: { value: number; goal: number };
}

function MacroBar({ label, value, goal, colorVar }: { label: string; value: number; goal: number; colorVar: string }) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {Math.round(value)} / {Math.round(goal)}g
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: `var(${colorVar})` }}
        />
      </div>
    </div>
  );
}

export function CalorieSummary({ caloriesEaten, calorieGoal, protein, carbs, fat }: Props) {
  const remaining = calorieGoal - caloriesEaten;
  const pct = calorieGoal > 0 ? Math.min(100, Math.round((caloriesEaten / calorieGoal) * 100)) : 0;
  const over = remaining < 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex size-64 items-center justify-center">
          <svg viewBox="0 0 100 100" className="size-64 -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={over ? "var(--destructive)" : "var(--chart-1)"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-bold tracking-tight">
              {Math.abs(Math.round(remaining)).toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">{over ? "kcal over" : "kcal left"}</span>
          </div>
        </div>

        <div className="grid w-full grid-cols-3 divide-x divide-border border-t border-border pt-4 text-center">
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-bold">{Math.round(caloriesEaten).toLocaleString()}</span>
            <span className="text-xs tracking-wide text-muted-foreground uppercase">Eaten</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs tracking-wide text-muted-foreground uppercase">Goals</span>
            <span className="text-sm font-semibold text-primary">
              {Math.round(calorieGoal).toLocaleString()} kcal
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-bold">
              {Math.max(0, Math.round(remaining)).toLocaleString()}
            </span>
            <span className="text-xs tracking-wide text-muted-foreground uppercase">Remaining</span>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <h3 className="font-semibold">Macronutrients</h3>
          <div className="flex flex-col gap-3">
            <MacroBar label="Protein" value={protein.value} goal={protein.goal} colorVar="--chart-2" />
            <MacroBar label="Carbs" value={carbs.value} goal={carbs.goal} colorVar="--chart-3" />
            <MacroBar label="Fat" value={fat.value} goal={fat.goal} colorVar="--chart-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
