"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analyzeFoodPhotoAction } from "@/lib/actions/vision";
import { addFoodLog } from "@/lib/actions/logs";
import type { FoodPhotoAnalysis } from "@/lib/anthropic/food-vision";
import type { MealType } from "@/types";

interface AnalyzedItem {
  name: string;
  estimated_amount: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  included: boolean;
  multiplier: number;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoScanTab({
  mealType,
  loggedDate,
  onLogged,
}: {
  mealType: MealType;
  loggedDate: string;
  onLogged: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodPhotoAnalysis | null>(null);
  const [items, setItems] = useState<AnalyzedItem[]>([]);
  const [pending, startTransition] = useTransition();

  async function handleFile(file: File) {
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysis(null);
    setItems([]);
    setAnalyzing(true);

    try {
      const mediaType = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
      const base64 = await fileToBase64(file);
      const result = await analyzeFoodPhotoAction(base64, mediaType);
      setAnalysis(result);
      setItems(result.items.map((item) => ({ ...item, included: true, multiplier: 1 })));
    } catch {
      toast.error("Couldn't analyze that photo — try a clearer shot");
      setPreviewUrl(null);
    } finally {
      setAnalyzing(false);
    }
  }

  function reset() {
    setPreviewUrl(null);
    setAnalysis(null);
    setItems([]);
  }

  function updateItem(idx: number, patch: Partial<AnalyzedItem>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  const includedCount = items.filter((i) => i.included).length;

  function handleAddAll() {
    const toAdd = items.filter((i) => i.included);
    if (toAdd.length === 0) return;

    startTransition(async () => {
      try {
        for (const item of toAdd) {
          await addFoodLog({
            foodId: null,
            foodName: item.name,
            mealType,
            loggedDate,
            servings: item.multiplier,
            calories: Math.round(item.calories * item.multiplier),
            proteinG: Math.round(item.protein_g * item.multiplier * 10) / 10,
            carbsG: Math.round(item.carbs_g * item.multiplier * 10) / 10,
            fatG: Math.round(item.fat_g * item.multiplier * 10) / 10,
          });
        }
        toast.success(`Added ${toAdd.length} item${toAdd.length === 1 ? "" : "s"}`);
        onLogged();
      } catch {
        toast.error("Couldn't add those items");
      }
    });
  }

  if (!previewUrl) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-10 text-center">
        <Camera className="size-8 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Scan your food</p>
          <p className="text-xs text-muted-foreground">
            Take or upload a photo — AI estimates the nutrition for you
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <Button onClick={() => fileInputRef.current?.click()} className="gap-1.5">
          <Camera className="size-4" />
          Take photo
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl} alt="Food to analyze" className="aspect-square w-full object-cover" />
        <button
          type="button"
          onClick={reset}
          className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white"
          aria-label="Remove photo"
        >
          <X className="size-4" />
        </button>
      </div>

      {analyzing && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Analyzing…
        </div>
      )}

      {analysis && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2 rounded-md bg-accent/50 px-3 py-2 text-xs text-accent-foreground">
            <Sparkles className="mt-0.5 size-3.5 shrink-0" />
            <span>{analysis.notes}</span>
          </div>

          <div className="flex flex-col gap-2">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  checked={item.included}
                  onChange={(e) => updateItem(idx, { included: e.target.checked })}
                  className="size-4 accent-primary"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.estimated_amount} · {Math.round(item.calories * item.multiplier)} kcal
                  </p>
                </div>
                <Input
                  type="number"
                  min={0.25}
                  step={0.25}
                  value={item.multiplier}
                  onChange={(e) => updateItem(idx, { multiplier: Number(e.target.value) || 0 })}
                  className="w-16"
                  disabled={!item.included}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={reset}>
              Retake
            </Button>
            <Button onClick={handleAddAll} disabled={pending || includedCount === 0}>
              Add {includedCount} item{includedCount === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
