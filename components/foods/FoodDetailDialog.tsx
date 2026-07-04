"use client";

import { UtensilsCrossed } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface FoodDetailIngredient {
  name: string;
  detail?: string;
}

export interface FoodDetailData {
  name: string;
  brand?: string | null;
  imageUrl?: string | null;
  servingLabel?: string | null;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number | null;
  sugarG?: number | null;
  sodiumMg?: number | null;
  ingredientsText?: string | null;
  ingredientsList?: FoodDetailIngredient[];
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-lg bg-muted px-2 py-2.5">
      <span className="text-sm font-bold">{value}</span>
      <span className="text-[10px] tracking-wide text-muted-foreground uppercase">{label}</span>
    </div>
  );
}

export function FoodDetailDialog({
  data,
  children,
}: {
  data: FoodDetailData;
  children: React.ReactNode;
}) {
  const hasSecondary = data.fiberG != null || data.sugarG != null || data.sodiumMg != null;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{data.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {data.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.imageUrl}
              alt={data.name}
              className="aspect-video w-full rounded-lg border border-border object-cover"
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <UtensilsCrossed className="size-8" />
            </div>
          )}

          {(data.brand || data.servingLabel) && (
            <div className="flex flex-col gap-0.5">
              {data.brand && <p className="text-sm font-medium">{data.brand}</p>}
              {data.servingLabel && (
                <p className="text-xs text-muted-foreground">{data.servingLabel}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-4 gap-2">
            <Stat label="Cal" value={Math.round(data.calories).toLocaleString()} />
            <Stat label="Protein" value={`${Math.round(data.proteinG)}g`} />
            <Stat label="Carbs" value={`${Math.round(data.carbsG)}g`} />
            <Stat label="Fat" value={`${Math.round(data.fatG)}g`} />
          </div>

          {hasSecondary && (
            <div className="flex justify-around text-xs text-muted-foreground">
              {data.fiberG != null && <span>Fiber {Math.round(data.fiberG)}g</span>}
              {data.sugarG != null && <span>Sugar {Math.round(data.sugarG)}g</span>}
              {data.sodiumMg != null && <span>Sodium {Math.round(data.sodiumMg)}mg</span>}
            </div>
          )}

          {data.ingredientsList && data.ingredientsList.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <h4 className="text-sm font-semibold">Ingredients</h4>
              <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
                {data.ingredientsList.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="min-w-0 truncate">{ing.name}</span>
                    {ing.detail && (
                      <span className="shrink-0 text-xs text-muted-foreground">{ing.detail}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.ingredientsText && (
            <div className="flex flex-col gap-1.5">
              <h4 className="text-sm font-semibold">Ingredients</h4>
              <p className="text-sm text-muted-foreground">{data.ingredientsText}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
