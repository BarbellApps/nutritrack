"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addFoodLog } from "@/lib/actions/logs";
import { createCustomFood } from "@/lib/actions/foods";
import type { MealType } from "@/types";

export function ManualEntryTab({
  mealType,
  loggedDate,
  onLogged,
}: {
  mealType: MealType;
  loggedDate: string;
  onLogged: () => void;
}) {
  const [saveToLibrary, setSaveToLibrary] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const name = String(formData.get("name") || "").trim();
    const calories = Number(formData.get("calories")) || 0;
    const proteinG = Number(formData.get("proteinG")) || 0;
    const carbsG = Number(formData.get("carbsG")) || 0;
    const fatG = Number(formData.get("fatG")) || 0;
    if (!name) return;

    startTransition(async () => {
      try {
        await addFoodLog({
          foodId: null,
          foodName: name,
          mealType,
          loggedDate,
          servings: 1,
          calories,
          proteinG,
          carbsG,
          fatG,
        });
        // Optionally keep it in the user's library for one-tap re-logging.
        if (saveToLibrary) {
          await createCustomFood({
            name,
            servingSize: 1,
            servingUnit: "serving",
            calories,
            proteinG,
            carbsG,
            fatG,
          }).catch(() => null);
        }
        toast.success(`Added ${name}`);
        onLogged();
      } catch {
        toast.error("Couldn't add that food");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Enter the nutrition for one serving — it&apos;s logged straight to your{" "}
        {mealType}.
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="meName">Name</Label>
        <Input id="meName" name="name" placeholder="e.g. Homemade soup" required autoFocus />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="meCalories">Cal</Label>
          <Input id="meCalories" name="calories" type="number" min={0} inputMode="numeric" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="meProtein">Prot</Label>
          <Input id="meProtein" name="proteinG" type="number" min={0} step={0.1} inputMode="decimal" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="meCarbs">Carb</Label>
          <Input id="meCarbs" name="carbsG" type="number" min={0} step={0.1} inputMode="decimal" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="meFat">Fat</Label>
          <Input id="meFat" name="fatG" type="number" min={0} step={0.1} inputMode="decimal" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={saveToLibrary}
          onChange={(e) => setSaveToLibrary(e.target.checked)}
          className="size-4 accent-primary"
        />
        Also save to My Foods for quick re-logging
      </label>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          Add to {mealType}
        </Button>
      </div>
    </form>
  );
}
