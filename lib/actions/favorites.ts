"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function addFavorite(foodId: string) {
  const { supabase, userId } = await requireUserId();
  await supabase
    .from("favorites")
    .upsert({ user_id: userId, food_id: foodId }, { onConflict: "user_id,food_id" });
  revalidatePath("/dashboard/foods");
  revalidatePath("/dashboard");
}

export async function removeFavorite(foodId: string) {
  const { supabase, userId } = await requireUserId();
  await supabase.from("favorites").delete().eq("user_id", userId).eq("food_id", foodId);
  revalidatePath("/dashboard/foods");
  revalidatePath("/dashboard");
}
