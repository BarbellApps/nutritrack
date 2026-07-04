"use server";

import { createClient } from "@/lib/supabase/server";
import { lookupBarcode as offLookupBarcode, searchOFF } from "@/lib/off/client";
import { revalidatePath } from "next/cache";
import type { Food } from "@/types";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function searchFoods(query: string): Promise<Food[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const { supabase, userId } = await requireUserId();

  const { data: local } = await supabase
    .from("foods")
    .select("*")
    .or(`user_id.eq.${userId},user_id.is.null`)
    .ilike("name", `%${trimmed}%`)
    .order("is_custom", { ascending: false })
    .limit(20);

  const localFoods = (local ?? []) as Food[];
  if (localFoods.length >= 10) return localFoods;

  // Fall back to Open Food Facts for anything the local library lacks,
  // caching results so future searches stay fast and offline-friendly.
  const offResults = await searchOFF(trimmed, 15).catch(() => []);
  const knownBarcodes = new Set(localFoods.map((f) => f.barcode).filter(Boolean));
  const fresh = offResults.filter((p) => !knownBarcodes.has(p.barcode));

  if (fresh.length > 0) {
    const { data: inserted } = await supabase
      .from("foods")
      .upsert(
        fresh.map((p) => ({
          user_id: null,
          name: p.name,
          brand: p.brand,
          barcode: p.barcode,
          serving_size: p.serving_size,
          serving_unit: p.serving_unit,
          calories: p.calories,
          protein_g: p.protein_g,
          carbs_g: p.carbs_g,
          fat_g: p.fat_g,
          fiber_g: p.fiber_g,
          sugar_g: p.sugar_g,
          sodium_mg: p.sodium_mg,
          image_url: p.image_url,
          ingredients_text: p.ingredients_text,
          is_custom: false,
          source: "off" as const,
        })),
        { onConflict: "barcode", ignoreDuplicates: true }
      )
      .select("*");

    return [...localFoods, ...((inserted ?? []) as Food[])];
  }

  return localFoods;
}

export async function lookupBarcode(barcode: string): Promise<Food | null> {
  const { supabase } = await requireUserId();

  const { data: existing } = await supabase
    .from("foods")
    .select("*")
    .eq("barcode", barcode)
    .limit(1)
    .maybeSingle();

  if (existing) return existing as Food;

  const product = await offLookupBarcode(barcode);
  if (!product) return null;

  const { data: inserted } = await supabase
    .from("foods")
    .insert({
      user_id: null,
      name: product.name,
      brand: product.brand,
      barcode: product.barcode,
      serving_size: product.serving_size,
      serving_unit: product.serving_unit,
      calories: product.calories,
      protein_g: product.protein_g,
      carbs_g: product.carbs_g,
      fat_g: product.fat_g,
      fiber_g: product.fiber_g,
      sugar_g: product.sugar_g,
      sodium_mg: product.sodium_mg,
      image_url: product.image_url,
      ingredients_text: product.ingredients_text,
      is_custom: false,
      source: "off",
    })
    .select("*")
    .single();

  return (inserted as Food) ?? null;
}

export interface CustomFoodInput {
  name: string;
  brand?: string;
  barcode?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
}

export async function createCustomFood(input: CustomFoodInput): Promise<Food> {
  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("foods")
    .insert({
      user_id: userId,
      name: input.name,
      brand: input.brand || null,
      barcode: input.barcode || null,
      serving_size: input.servingSize,
      serving_unit: input.servingUnit,
      calories: input.calories,
      protein_g: input.proteinG,
      carbs_g: input.carbsG,
      fat_g: input.fatG,
      fiber_g: input.fiberG ?? null,
      sugar_g: input.sugarG ?? null,
      sodium_mg: input.sodiumMg ?? null,
      is_custom: true,
      source: "user",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/foods");
  return data as Food;
}

export async function deleteCustomFood(id: string) {
  const { supabase, userId } = await requireUserId();
  await supabase.from("foods").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/dashboard/foods");
}
