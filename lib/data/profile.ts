import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

const DEFAULT_PROFILE_FIELDS = {
  daily_calorie_goal: 2000,
  daily_protein_goal_g: 120,
  daily_carbs_goal_g: 225,
  daily_fat_goal_g: 65,
  daily_water_goal_ml: 2000,
  weight_unit: "kg" as const,
  height_cm: null,
  goal_weight_kg: null,
  activity_level: "moderate" as const,
};

/** Returns the current user's profile row, creating a fallback default if the signup trigger hasn't run yet. */
export async function getProfile(): Promise<{ userId: string; email: string; profile: Profile }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return { userId: user.id, email: user.email ?? "", profile: existing as Profile };

  const { data: created } = await supabase
    .from("profiles")
    .insert({ id: user.id, email: user.email ?? "", ...DEFAULT_PROFILE_FIELDS })
    .select("*")
    .single();

  return {
    userId: user.id,
    email: user.email ?? "",
    profile: (created ?? {
      id: user.id,
      email: user.email ?? "",
      full_name: null,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...DEFAULT_PROFILE_FIELDS,
    }) as Profile,
  };
}
