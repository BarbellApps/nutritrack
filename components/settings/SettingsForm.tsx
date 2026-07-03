"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProfile } from "@/lib/actions/profile";
import { estimateTDEE, kgToLb, lbToKg } from "@/lib/utils/nutrition";
import type { ActivityLevel, Profile } from "@/types";

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (little exercise)",
  light: "Light (1-3 days/week)",
  moderate: "Moderate (3-5 days/week)",
  active: "Active (6-7 days/week)",
  very_active: "Very active (physical job / 2x/day)",
};

export function SettingsForm({ profile, currentWeightKg }: { profile: Profile; currentWeightKg: number | null }) {
  const [unit, setUnit] = useState(profile.weight_unit);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activity_level);
  const [heightCm, setHeightCm] = useState(profile.height_cm ?? 170);
  const [age, setAge] = useState(30);
  const [calorieGoal, setCalorieGoal] = useState(profile.daily_calorie_goal);
  const [proteinGoal, setProteinGoal] = useState(profile.daily_protein_goal_g);
  const [carbsGoal, setCarbsGoal] = useState(profile.daily_carbs_goal_g);
  const [fatGoal, setFatGoal] = useState(profile.daily_fat_goal_g);
  const [waterGoal, setWaterGoal] = useState(profile.daily_water_goal_ml);
  const [goalWeight, setGoalWeight] = useState(
    profile.goal_weight_kg ? (unit === "lb" ? kgToLb(profile.goal_weight_kg) : profile.goal_weight_kg) : ""
  );
  const [pending, startTransition] = useTransition();

  function estimateGoal() {
    if (!currentWeightKg) {
      toast.error("Log your weight first to estimate a goal");
      return;
    }
    const tdee = estimateTDEE(currentWeightKg, heightCm, age, activityLevel);
    setCalorieGoal(tdee);
    setProteinGoal(Math.round((currentWeightKg * 2) * 10) / 10);
    setFatGoal(Math.round(((tdee * 0.25) / 9) * 10) / 10);
    setCarbsGoal(Math.round(((tdee - (currentWeightKg * 2 * 4) - (tdee * 0.25)) / 4) * 10) / 10);
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await updateProfile({
          dailyCalorieGoal: calorieGoal,
          dailyProteinGoalG: proteinGoal,
          dailyCarbsGoalG: carbsGoal,
          dailyFatGoalG: fatGoal,
          dailyWaterGoalMl: waterGoal,
          weightUnit: unit,
          heightCm,
          goalWeightKg: goalWeight ? (unit === "lb" ? lbToKg(Number(goalWeight)) : Number(goalWeight)) : null,
          activityLevel,
        });
        toast.success("Settings saved");
      } catch {
        toast.error("Couldn't save settings");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Units</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as "kg" | "lb")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                <SelectItem value="lb">Pounds (lb)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" value={age} onChange={(e) => setAge(Number(e.target.value) || 0)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goalWeight">Goal weight ({unit})</Label>
            <Input
              id="goalWeight"
              type="number"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label>Activity level</Label>
            <Select value={activityLevel} onValueChange={(v) => setActivityLevel(v as ActivityLevel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Daily goals</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={estimateGoal}>
            Estimate for me
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="calorieGoal">Calories</Label>
            <Input
              id="calorieGoal"
              type="number"
              value={calorieGoal}
              onChange={(e) => setCalorieGoal(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="waterGoal">Water (ml)</Label>
            <Input
              id="waterGoal"
              type="number"
              value={waterGoal}
              onChange={(e) => setWaterGoal(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proteinGoal">Protein (g)</Label>
            <Input
              id="proteinGoal"
              type="number"
              value={proteinGoal}
              onChange={(e) => setProteinGoal(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="carbsGoal">Carbs (g)</Label>
            <Input
              id="carbsGoal"
              type="number"
              value={carbsGoal}
              onChange={(e) => setCarbsGoal(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fatGoal">Fat (g)</Label>
            <Input
              id="fatGoal"
              type="number"
              value={fatGoal}
              onChange={(e) => setFatGoal(Number(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={pending} className="self-end">
        Save changes
      </Button>
    </div>
  );
}
