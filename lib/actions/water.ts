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

export async function addWater(loggedDate: string, amountMl: number) {
  const { supabase, userId } = await requireUserId();
  const { error } = await supabase
    .from("water_logs")
    .insert({ user_id: userId, logged_date: loggedDate, amount_ml: amountMl });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/water");
  revalidatePath("/dashboard");
}

export async function deleteWaterLog(id: string) {
  const { supabase, userId } = await requireUserId();
  await supabase.from("water_logs").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/dashboard/water");
  revalidatePath("/dashboard");
}
