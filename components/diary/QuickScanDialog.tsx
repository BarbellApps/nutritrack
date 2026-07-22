"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Barcode, Camera, PencilLine } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { addFoodLog } from "@/lib/actions/logs";
import { scaleNutrition } from "@/lib/utils/nutrition";
import { todayStr } from "@/lib/utils/date";
import { BarcodeTab } from "./BarcodeTab";
import { PhotoScanTab } from "./PhotoScanTab";
import { ManualEntryTab } from "./ManualEntryTab";
import { ServingPicker } from "./ServingPicker";
import type { Food, MealType } from "@/types";

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

function defaultMeal(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}

export function QuickScanDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mealType, setMealType] = useState<MealType>(defaultMeal);
  const [selected, setSelected] = useState<Food | null>(null);
  const [, startTransition] = useTransition();
  const loggedDate = todayStr();

  function reset() {
    setSelected(null);
    setMealType(defaultMeal());
  }

  // This dialog lives in the layout, so a logged entry won't show on the
  // diary page until its server component re-fetches. revalidatePath marks it
  // stale; router.refresh() forces the visible route to actually re-render.
  function closeAndRefresh() {
    setOpen(false);
    reset();
    router.refresh();
  }

  function handleAdd(food: Food, servings: number) {
    const scaled = scaleNutrition(food, servings);
    startTransition(async () => {
      try {
        await addFoodLog({
          foodId: food.id,
          foodName: food.name,
          mealType,
          loggedDate,
          servings,
          calories: scaled.calories,
          proteinG: scaled.protein_g,
          carbsG: scaled.carbs_g,
          fatG: scaled.fat_g,
        });
        toast.success(`Added ${food.name}`);
        closeAndRefresh();
      } catch {
        toast.error("Couldn't add food");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <button
          aria-label="Quick scan"
          className="flex flex-1 items-center justify-center py-1"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform active:scale-95">
            <Plus className="size-5" />
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Scan food</DialogTitle>
        </DialogHeader>

        {selected ? (
          <ServingPicker
            food={selected}
            onCancel={() => setSelected(null)}
            onConfirm={(servings) => handleAdd(selected, servings)}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex rounded-full bg-muted p-1">
              {MEAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMealType(opt.value)}
                  className={cn(
                    "flex-1 rounded-full py-1.5 text-xs font-medium transition-colors",
                    mealType === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <Tabs defaultValue="photo">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="photo" className="gap-1.5">
                  <Camera className="size-4" />
                  Photo
                </TabsTrigger>
                <TabsTrigger value="barcode" className="gap-1.5">
                  <Barcode className="size-4" />
                  Barcode
                </TabsTrigger>
                <TabsTrigger value="manual" className="gap-1.5">
                  <PencilLine className="size-4" />
                  Manual
                </TabsTrigger>
              </TabsList>

              <TabsContent value="photo">
                <PhotoScanTab
                  mealType={mealType}
                  loggedDate={loggedDate}
                  onLogged={closeAndRefresh}
                />
              </TabsContent>

              <TabsContent value="barcode">
                <BarcodeTab onFound={setSelected} />
              </TabsContent>

              <TabsContent value="manual">
                <ManualEntryTab
                  mealType={mealType}
                  loggedDate={loggedDate}
                  onLogged={closeAndRefresh}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
