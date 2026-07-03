import { getProfile } from "@/lib/data/profile";
import { getWeightLogs } from "@/lib/data/weight";
import { WeightTracker } from "@/components/weight/WeightTracker";
import { WeightChart } from "@/components/weight/WeightChart";

export default async function WeightPage() {
  const { userId, profile } = await getProfile();
  const logs = await getWeightLogs(userId, 90);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Weight</h1>
      <WeightTracker logs={logs} unit={profile.weight_unit} goalWeightKg={profile.goal_weight_kg} />
      <WeightChart data={logs} unit={profile.weight_unit} />
    </div>
  );
}
