import { getProfile } from "@/lib/data/profile";
import { getFoodLogsForDate, getWaterLogsForDate } from "@/lib/data/diary";
import { getCustomFoods, getFavorites, getRecipes } from "@/lib/data/foods";
import { sumMacros } from "@/lib/utils/nutrition";
import { todayStr } from "@/lib/utils/date";
import { DateNav } from "@/components/diary/DateNav";
import { CalorieSummary } from "@/components/diary/CalorieSummary";
import { MealSection } from "@/components/diary/MealSection";
import { WaterQuickCard } from "@/components/diary/WaterQuickCard";
import type { MealType } from "@/types";

const MEALS: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export default async function DiaryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? todayStr();

  const { userId, profile } = await getProfile();
  const [logs, waterLogs, favorites, customFoods, recipes] = await Promise.all([
    getFoodLogsForDate(userId, date),
    getWaterLogsForDate(userId, date),
    getFavorites(userId),
    getCustomFoods(userId),
    getRecipes(userId),
  ]);

  const totals = sumMacros(logs);
  const waterMl = waterLogs.reduce((sum, w) => sum + w.amount_ml, 0);

  return (
    <div className="flex flex-col gap-6">
      <DateNav date={date} />

      <CalorieSummary
        caloriesEaten={totals.calories}
        calorieGoal={profile.daily_calorie_goal}
        protein={{ value: totals.protein_g, goal: profile.daily_protein_goal_g }}
        carbs={{ value: totals.carbs_g, goal: profile.daily_carbs_goal_g }}
        fat={{ value: totals.fat_g, goal: profile.daily_fat_goal_g }}
      />

      <WaterQuickCard amountMl={waterMl} goalMl={profile.daily_water_goal_ml} />

      <div className="flex flex-col gap-4">
        {MEALS.map((meal) => (
          <MealSection
            key={meal}
            mealType={meal}
            logs={logs.filter((l) => l.meal_type === meal)}
            loggedDate={date}
            favorites={favorites}
            customFoods={customFoods}
            recipes={recipes}
          />
        ))}
      </div>
    </div>
  );
}
