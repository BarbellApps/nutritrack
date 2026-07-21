"use server";

import { requireUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addWater(loggedDate: string, amountMl: number) {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("water_logs")
    .insert({ user_id: userId, logged_date: loggedDate, amount_ml: amountMl });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/water");
  revalidatePath("/dashboard");
}

export async function deleteWaterLog(id: string) {
  const { supabase, userId } = await requireUser();
  await supabase.from("water_logs").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/dashboard/water");
  revalidatePath("/dashboard");
}
