import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {Math.round(value)} / {Math.round(goal)}g
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
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
    <Card>
      <CardContent className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-center">
        <div className="relative mx-auto flex size-36 shrink-0 items-center justify-center">
          <svg viewBox="0 0 100 100" className="size-36 -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={over ? "var(--destructive)" : "var(--primary)"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={cn("font-mono text-2xl font-semibold", over && "text-destructive")}>
              {Math.abs(Math.round(remaining))}
            </span>
            <span className="text-xs text-muted-foreground">{over ? "over" : "left"}</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Eaten</span>
            <span className="font-mono font-medium">{Math.round(caloriesEaten)} kcal</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Goal</span>
            <span className="font-mono font-medium">{Math.round(calorieGoal)} kcal</span>
          </div>
          <div className="mt-1 flex flex-col gap-3">
            <MacroBar label="Protein" value={protein.value} goal={protein.goal} colorVar="--chart-2" />
            <MacroBar label="Carbs" value={carbs.value} goal={carbs.goal} colorVar="--chart-3" />
            <MacroBar label="Fat" value={fat.value} goal={fat.goal} colorVar="--chart-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
