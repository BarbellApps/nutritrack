import { createClient } from "@/lib/supabase/server";
import { shiftDate, todayStr } from "@/lib/utils/date";
import type { FoodLog, WaterLog } from "@/types";

export async function getFoodLogsForDate(userId: string, date: string): Promise<FoodLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("food_logs")
    .select("*, food:foods(*)")
    .eq("user_id", userId)
    .eq("logged_date", date)
    .order("created_at", { ascending: true });

  return (data ?? []) as FoodLog[];
}

export async function getWaterLogsForDate(userId: string, date: string): Promise<WaterLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("water_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("logged_date", date)
    .order("created_at", { ascending: true });

  return (data ?? []) as WaterLog[];
}

export async function getWaterHistory(
  userId: string,
  days = 7
): Promise<{ date: string; amount_ml: number }[]> {
  const supabase = await createClient();
  const startDate = shiftDate(todayStr(), -(days - 1));

  const { data } = await supabase
    .from("water_logs")
    .select("logged_date, amount_ml")
    .eq("user_id", userId)
    .gte("logged_date", startDate)
    .order("logged_date", { ascending: true });

  const totals = new Map<string, number>();
  for (let i = 0; i < days; i++) totals.set(shiftDate(startDate, i), 0);
  for (const row of data ?? []) {
    totals.set(row.logged_date, (totals.get(row.logged_date) ?? 0) + row.amount_ml);
  }

  return Array.from(totals.entries()).map(([date, amount_ml]) => ({ date, amount_ml }));
}
