import { Coffee, Sandwich, Soup, Cookie } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AddFoodDialog } from "./AddFoodDialog";
import { DeleteLogButton } from "./DeleteLogButton";
import { FoodDetailDialog, type FoodDetailData } from "@/components/foods/FoodDetailDialog";
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

function buildLogDetail(log: FoodLog, siblings: FoodLog[]): FoodDetailData {
  const food = log.food;

  const ingredientsList =
    log.scan_group_id != null
      ? siblings
          .filter((s) => s.id !== log.id)
          .map((s) => ({ name: s.food_name, detail: `${Math.round(s.calories)} kcal` }))
      : undefined;

  return {
    name: log.food_name,
    brand: food?.brand ?? null,
    imageUrl: log.photo_url ?? food?.image_url ?? null,
    servingLabel: food
      ? `${log.servings} serving${log.servings === 1 ? "" : "s"} · ${food.serving_size}${food.serving_unit}`
      : `${log.servings} serving${log.servings === 1 ? "" : "s"}`,
    calories: log.calories,
    proteinG: log.protein_g,
    carbsG: log.carbs_g,
    fatG: log.fat_g,
    fiberG: food?.fiber_g != null ? food.fiber_g * log.servings : null,
    sugarG: food?.sugar_g != null ? food.sugar_g * log.servings : null,
    sodiumMg: food?.sodium_mg != null ? food.sodium_mg * log.servings : null,
    ingredientsText: food?.ingredients_text ?? null,
    ingredientsList,
  };
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
              <FoodDetailDialog data={buildLogDetail(log, logs)}>
                <button
                  type="button"
                  className="flex min-w-0 flex-1 flex-col items-start rounded-md text-left hover:bg-accent/40"
                >
                  <p className="w-full truncate">{log.food_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.servings} serving{log.servings === 1 ? "" : "s"}
                  </p>
                </button>
              </FoodDetailDialog>
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
