"use server";

import { requireUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertWeightLog(loggedDate: string, weightKg: number, note?: string) {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("weight_logs")
    .upsert(
      { user_id: userId, logged_date: loggedDate, weight_kg: weightKg, note: note ?? null },
      { onConflict: "user_id,logged_date" }
    );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/weight");
}

export async function deleteWeightLog(id: string) {
  const { supabase, userId } = await requireUser();
  await supabase.from("weight_logs").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/dashboard/weight");
}
