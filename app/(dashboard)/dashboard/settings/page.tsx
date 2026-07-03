import { getProfile } from "@/lib/data/profile";
import { getWeightLogs } from "@/lib/data/weight";
import { ProfileHeader } from "@/components/settings/ProfileHeader";
import { PreferencesCard } from "@/components/settings/PreferencesCard";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const { userId, email, profile } = await getProfile();
  const weightLogs = await getWeightLogs(userId, 1);
  const currentWeightKg = weightLogs.at(-1)?.weight_kg ?? null;

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader profile={profile} email={email} currentWeightKg={currentWeightKg} />
      <PreferencesCard />
      <SettingsForm profile={profile} currentWeightKg={currentWeightKg} />
    </div>
  );
}
