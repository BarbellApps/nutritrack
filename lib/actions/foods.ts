"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { lookupBarcode as offLookupBarcode, searchOFF, type OFFProduct } from "@/lib/off/client";
import { revalidatePath } from "next/cache";
import type { Food } from "@/types";

function offToRow(p: OFFProduct) {
  return {
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
  };
}

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
  // No unique constraint exists on foods.barcode (shared + per-user rows
  // share the table), so this dedupes by explicit select instead of
  // ON CONFLICT — an upsert here fails outright with Postgres 42P10.
  const offResults = await searchOFF(trimmed, 15).catch(() => []);
  const knownBarcodes = new Set(localFoods.map((f) => f.barcode).filter(Boolean));
  const freshByBarcode = new Map<string, OFFProduct>();
  for (const p of offResults) {
    if (p.barcode && !knownBarcodes.has(p.barcode) && !freshByBarcode.has(p.barcode)) {
      freshByBarcode.set(p.barcode, p);
    }
  }
  if (freshByBarcode.size === 0) return localFoods;

  // Some barcodes may already be cached under a different product name
  // (localized names miss the ilike match) — reuse those rows.
  const { data: cachedRows } = await supabase
    .from("foods")
    .select("*")
    .in("barcode", [...freshByBarcode.keys()]);
  const cached = (cachedRows ?? []) as Food[];
  for (const f of cached) {
    if (f.barcode) freshByBarcode.delete(f.barcode);
  }

  let inserted: Food[] = [];
  if (freshByBarcode.size > 0) {
    const { data, error } = await supabase
      .from("foods")
      .insert([...freshByBarcode.values()].map(offToRow))
      .select("*");
    if (error) console.error("searchFoods: caching OFF results failed:", error.message);
    inserted = (data ?? []) as Food[];
  }

  return [...localFoods, ...cached, ...inserted];
}

export async function lookupBarcode(barcode: string): Promise<Food | null> {
  const { supabase } = await requireUserId();

  const { data: existing } = await supabase
    .from("foods")
    .select("*")
    .eq("barcode", barcode)
    .limit(1)
    .maybeSingle();

  if (existing) {
    const food = existing as Food;
    // Rows cached before image/ingredient capture existed lack both — refresh
    // them from OFF once. Shared rows (user_id null) can't be updated under
    // RLS by a normal user, so this goes through the service-role client.
    if (food.source === "off" && !food.image_url) {
      const product = await offLookupBarcode(barcode).catch(() => null);
      if (product?.image_url || product?.ingredients_text) {
        const admin = createAdminClient();
        const { data: updated } = await admin
          .from("foods")
          .update({
            image_url: product.image_url,
            ingredients_text: product.ingredients_text,
          })
          .eq("id", food.id)
          .select("*")
          .single();
        if (updated) return updated as Food;
      }
    }
    return food;
  }

  const product = await offLookupBarcode(barcode);
  if (!product) return null;

  const { data: inserted, error } = await supabase
    .from("foods")
    .insert(offToRow(product))
    .select("*")
    .single();
  if (error) console.error("lookupBarcode: caching OFF product failed:", error.message);

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
