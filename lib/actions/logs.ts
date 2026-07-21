"use server";

import { requireUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MealType } from "@/types";

export interface AddFoodLogInput {
  foodId?: string | null;
  foodName: string;
  mealType: MealType;
  loggedDate: string;
  servings: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  photoUrl?: string | null;
  scanGroupId?: string | null;
}

export async function addFoodLog(input: AddFoodLogInput) {
  const { supabase, userId } = await requireUser();

  const { error } = await supabase.from("food_logs").insert({
    user_id: userId,
    food_id: input.foodId ?? null,
    food_name: input.foodName,
    meal_type: input.mealType,
    logged_date: input.loggedDate,
    servings: input.servings,
    calories: input.calories,
    protein_g: input.proteinG,
    carbs_g: input.carbsG,
    fat_g: input.fatG,
    photo_url: input.photoUrl ?? null,
    scan_group_id: input.scanGroupId ?? null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function deleteFoodLog(id: string) {
  const { supabase, userId } = await requireUser();
  await supabase.from("food_logs").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/dashboard");
}
