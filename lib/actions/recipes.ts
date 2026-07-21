"use server";

import { requireUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { RecipeIngredient } from "@/types";

export interface CreateRecipeInput {
  name: string;
  servings: number;
  ingredients: RecipeIngredient[];
}

export async function createRecipe(input: CreateRecipeInput) {
  const { supabase, userId } = await requireUser();

  const totals = input.ingredients.reduce(
    (acc, i) => ({
      calories: acc.calories + i.calories,
      protein_g: acc.protein_g + i.protein_g,
      carbs_g: acc.carbs_g + i.carbs_g,
      fat_g: acc.fat_g + i.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  const { error } = await supabase.from("recipes").insert({
    user_id: userId,
    name: input.name,
    servings: input.servings,
    ingredients: input.ingredients,
    total_calories: totals.calories,
    total_protein_g: totals.protein_g,
    total_carbs_g: totals.carbs_g,
    total_fat_g: totals.fat_g,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/foods");
}

export async function deleteRecipe(id: string) {
  const { supabase, userId } = await requireUser();
  await supabase.from("recipes").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/dashboard/foods");
}

export async function logRecipeAsMeal(
  recipeId: string,
  mealType: "breakfast" | "lunch" | "dinner" | "snack",
  loggedDate: string,
  servings: number
) {
  const { supabase, userId } = await requireUser();
  const { data: recipe } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .eq("user_id", userId)
    .single();

  if (!recipe) throw new Error("Recipe not found");

  const perServing = servings / recipe.servings;
  const { error } = await supabase.from("food_logs").insert({
    user_id: userId,
    food_id: null,
    food_name: recipe.name,
    meal_type: mealType,
    logged_date: loggedDate,
    servings,
    calories: Math.round(recipe.total_calories * perServing),
    protein_g: Math.round(recipe.total_protein_g * perServing * 10) / 10,
    carbs_g: Math.round(recipe.total_carbs_g * perServing * 10) / 10,
    fat_g: Math.round(recipe.total_fat_g * perServing * 10) / 10,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
