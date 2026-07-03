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

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <h3 className="font-medium">{MEAL_LABELS[mealType]}</h3>
          {totalCalories > 0 && (
            <p className="font-mono text-xs text-muted-foreground">
              {Math.round(totalCalories)} kcal
            </p>
          )}
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
                <span className="font-mono text-xs text-muted-foreground">
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
