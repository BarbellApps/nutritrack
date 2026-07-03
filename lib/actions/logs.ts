"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MealType } from "@/types";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

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
}

export async function addFoodLog(input: AddFoodLogInput) {
  const { supabase, userId } = await requireUserId();

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
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function deleteFoodLog(id: string) {
  const { supabase, userId } = await requireUserId();
  await supabase.from("food_logs").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/dashboard");
}
