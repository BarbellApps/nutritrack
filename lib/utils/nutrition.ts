import type { ActivityLevel, FoodLog } from "@/types";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** Mifflin-St Jeor estimate. Sex assumed neutral (midpoint) since we don't collect it. */
export function estimateTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  activityLevel: ActivityLevel
): number {
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 78;
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function macroCaloriesFromGrams(protein: number, carbs: number, fat: number) {
  return protein * 4 + carbs * 4 + fat * 9;
}

export function sumMacros(logs: Pick<FoodLog, "calories" | "protein_g" | "carbs_g" | "fat_g">[]) {
  return logs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein_g: acc.protein_g + log.protein_g,
      carbs_g: acc.carbs_g + log.carbs_g,
      fat_g: acc.fat_g + log.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );
}

export function scaleNutrition(
  base: { calories: number; protein_g: number; carbs_g: number; fat_g: number },
  servings: number
) {
  return {
    calories: Math.round(base.calories * servings),
    protein_g: Math.round(base.protein_g * servings * 10) / 10,
    carbs_g: Math.round(base.carbs_g * servings * 10) / 10,
    fat_g: Math.round(base.fat_g * servings * 10) / 10,
  };
}

export function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbToKg(lb: number): number {
  return Math.round((lb / 2.20462) * 10) / 10;
}
