import { createClient } from "@/lib/supabase/server";
import type { Favorite, Food, Recipe } from "@/types";

export async function getCustomFoods(userId: string): Promise<Food[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("foods")
    .select("*")
    .eq("user_id", userId)
    .eq("is_custom", true)
    .order("created_at", { ascending: false });

  return (data ?? []) as Food[];
}

export async function getRecipes(userId: string): Promise<Recipe[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []) as Recipe[];
}

export async function getFavorites(userId: string): Promise<Favorite[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("*, food:foods(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []) as Favorite[];
}
