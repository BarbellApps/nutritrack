import { Coffee, Sandwich, Soup, Cookie } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AddFoodDialog } from "./AddFoodDialog";
import { DeleteLogButton } from "./DeleteLogButton";
import type { Favorite, Food, FoodLog, MealType, Recipe } from "@/types";

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

const MEAL_ICONS: Record<MealType, typeof Coffee> = {
  breakfast: Coffee,
  lunch: Sandwich,
  dinner: Soup,
  snack: Cookie,
};

interface Props {
  mealType: MealType;
  logs: FoodLog[];
  loggedDate: string;
  favorites: Favorite[];
  customFoods: Food[];
  recipes: Recipe[];
}

export function MealSection({ mealType, logs, loggedDate, favorites, customFoods, recipes }: Props) {
  const totalCalories = logs.reduce((sum, l) => sum + l.calories, 0);
  const Icon = MEAL_ICONS[mealType];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Icon className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold">{MEAL_LABELS[mealType]}</h3>
            <p className="text-xs text-muted-foreground">
              {totalCalories > 0 ? (
                <span className="font-medium text-primary">{Math.round(totalCalories)} kcal</span>
              ) : (
                "—"
              )}
            </p>
          </div>
        </div>
        <AddFoodDialog
          mealType={mealType}
          loggedDate={loggedDate}
          favorites={favorites}
          customFoods={customFoods}
          recipes={recipes}
        />
      </CardHeader>
      {logs.length > 0 && (
        <CardContent className="flex flex-col gap-1 pt-0">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between gap-3 py-1.5 text-sm">
              <div className="min-w-0">
                <p className="truncate">{log.food_name}</p>
                <p className="text-xs text-muted-foreground">
                  {log.servings} serving{log.servings === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-primary">
                  {Math.round(log.calories)} kcal
                </span>
                <DeleteLogButton id={log.id} />
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
