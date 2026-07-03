import { createClient } from "@/lib/supabase/server";
import type { WeightLog } from "@/types";

export async function getWeightLogs(userId: string, limit = 90): Promise<WeightLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", userId)
    .order("logged_date", { ascending: false })
    .limit(limit);

  return ((data ?? []) as WeightLog[]).reverse();
}
