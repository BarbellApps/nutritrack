import { getProfile } from "@/lib/data/profile";
import { getWaterLogsForDate, getWaterHistory } from "@/lib/data/diary";
import { todayStr } from "@/lib/utils/date";
import { DateNav } from "@/components/diary/DateNav";
import { WaterTracker } from "@/components/water/WaterTracker";
import { WaterHistoryChart } from "@/components/water/WaterHistoryChart";

export default async function WaterPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? todayStr();

  const { userId, profile } = await getProfile();
  const [logs, history] = await Promise.all([
    getWaterLogsForDate(userId, date),
    getWaterHistory(userId, 7),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <DateNav date={date} basePath="/dashboard/water" />
      <WaterTracker date={date} logs={logs} goalMl={profile.daily_water_goal_ml} />
      <WaterHistoryChart data={history} />
    </div>
  );
}
