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

export async function upsertWeightLog(loggedDate: string, weightKg: number, note?: string) {
  const { supabase, userId } = await requireUserId();
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
  const { supabase, userId } = await requireUserId();
  await supabase.from("weight_logs").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/dashboard/weight");
}
