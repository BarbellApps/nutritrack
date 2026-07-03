"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { scaleNutrition } from "@/lib/utils/nutrition";
import type { Food } from "@/types";

export function ServingPicker({
  food,
  onCancel,
  onConfirm,
}: {
  food: Food;
  onCancel: () => void;
  onConfirm: (servings: number) => void;
}) {
  const [servings, setServings] = useState(1);
  const scaled = scaleNutrition(food, servings);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <div>
        <p className="font-medium">{food.name}</p>
        <p className="text-xs text-muted-foreground">
          {food.serving_size}
          {food.serving_unit} per serving
        </p>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Servings</label>
        <Input
          type="number"
          min={0.25}
          step={0.25}
          value={servings}
          onChange={(e) => setServings(Number(e.target.value) || 0)}
          className="w-24"
        />
      </div>
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Cal</p>
          <p>{scaled.calories}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Prot</p>
          <p>{scaled.protein_g}g</p>
        </div>
        <div>
          <p className="text-muted-foreground">Carb</p>
          <p>{scaled.carbs_g}g</p>
        </div>
        <div>
          <p className="text-muted-foreground">Fat</p>
          <p>{scaled.fat_g}g</p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onConfirm(servings)}>Add</Button>
      </div>
    </div>
  );
}
