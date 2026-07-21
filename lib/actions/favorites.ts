"use server";

import { requireUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addFavorite(foodId: string) {
  const { supabase, userId } = await requireUser();
  await supabase
    .from("favorites")
    .upsert({ user_id: userId, food_id: foodId }, { onConflict: "user_id,food_id" });
  revalidatePath("/dashboard/foods");
  revalidatePath("/dashboard");
}

export async function removeFavorite(foodId: string) {
  const { supabase, userId } = await requireUser();
  await supabase.from("favorites").delete().eq("user_id", userId).eq("food_id", foodId);
  revalidatePath("/dashboard/foods");
  revalidatePath("/dashboard");
}
