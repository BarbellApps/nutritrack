import { getProfile } from "@/lib/data/profile";
import { getWeightLogs } from "@/lib/data/weight";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const { userId, profile } = await getProfile();
  const weightLogs = await getWeightLogs(userId, 1);
  const currentWeightKg = weightLogs.at(-1)?.weight_kg ?? null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <SettingsForm profile={profile} currentWeightKg={currentWeightKg} />
    </div>
  );
}
