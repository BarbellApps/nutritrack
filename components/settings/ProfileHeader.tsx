import { Card, CardContent } from "@/components/ui/card";
import { kgToLb } from "@/lib/utils/nutrition";
import type { Profile, WeightUnit } from "@/types";

function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 pt-6">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">
          {value} <span className="text-sm font-medium text-muted-foreground">{unit}</span>
        </p>
      </CardContent>
    </Card>
  );
}

export function ProfileHeader({
  profile,
  email,
  currentWeightKg,
}: {
  profile: Profile;
  email: string;
  currentWeightKg: number | null;
}) {
  const unit: WeightUnit = profile.weight_unit;
  const toUnit = (kg: number) => (unit === "lb" ? kgToLb(kg) : kg);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
          {initials(profile.full_name, email)}
        </div>
        <p className="font-semibold">{profile.full_name || email}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Current"
          value={currentWeightKg !== null ? toUnit(currentWeightKg).toString() : "—"}
          unit={unit}
        />
        <StatCard
          label="Goal"
          value={profile.goal_weight_kg !== null ? toUnit(profile.goal_weight_kg).toString() : "—"}
          unit={unit}
        />
        <StatCard label="Daily Target" value={profile.daily_calorie_goal.toString()} unit="kcal" />
      </div>
    </div>
  );
}
