"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActivityLevel, WeightUnit } from "@/types";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export interface UpdateProfileInput {
  fullName?: string;
  dailyCalorieGoal?: number;
  dailyProteinGoalG?: number;
  dailyCarbsGoalG?: number;
  dailyFatGoalG?: number;
  dailyWaterGoalMl?: number;
  weightUnit?: WeightUnit;
  heightCm?: number | null;
  goalWeightKg?: number | null;
  activityLevel?: ActivityLevel;
}

export async function updateProfile(input: UpdateProfileInput) {
  const { supabase, userId } = await requireUserId();

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.fullName !== undefined) patch.full_name = input.fullName;
  if (input.dailyCalorieGoal !== undefined) patch.daily_calorie_goal = input.dailyCalorieGoal;
  if (input.dailyProteinGoalG !== undefined) patch.daily_protein_goal_g = input.dailyProteinGoalG;
  if (input.dailyCarbsGoalG !== undefined) patch.daily_carbs_goal_g = input.dailyCarbsGoalG;
  if (input.dailyFatGoalG !== undefined) patch.daily_fat_goal_g = input.dailyFatGoalG;
  if (input.dailyWaterGoalMl !== undefined) patch.daily_water_goal_ml = input.dailyWaterGoalMl;
  if (input.weightUnit !== undefined) patch.weight_unit = input.weightUnit;
  if (input.heightCm !== undefined) patch.height_cm = input.heightCm;
  if (input.goalWeightKg !== undefined) patch.goal_weight_kg = input.goalWeightKg;
  if (input.activityLevel !== undefined) patch.activity_level = input.activityLevel;

  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}
