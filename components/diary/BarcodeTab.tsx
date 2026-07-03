"use client";

import { useState, useTransition } from "react";
import { PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lookupBarcode, createCustomFood } from "@/lib/actions/foods";
import { BarcodeScanner } from "./BarcodeScanner";
import type { Food } from "@/types";

type Phase = "scanning" | "looking-up" | "not-found" | "manual-form";

export function BarcodeTab({ onFound }: { onFound: (food: Food) => void }) {
  const [phase, setPhase] = useState<Phase>("scanning");
  const [code, setCode] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDetected(detected: string) {
    setCode(detected);
    setPhase("looking-up");
    startTransition(async () => {
      const food = await lookupBarcode(detected).catch(() => null);
      if (food) onFound(food);
      else setPhase("not-found");
    });
  }

  function handleManualSave(formData: FormData) {
    startTransition(async () => {
      try {
        const food = await createCustomFood({
          name: String(formData.get("name")),
          barcode: code ?? undefined,
          servingSize: Number(formData.get("servingSize")) || 100,
          servingUnit: String(formData.get("servingUnit") || "g"),
          calories: Number(formData.get("calories")) || 0,
          proteinG: Number(formData.get("proteinG")) || 0,
          carbsG: Number(formData.get("carbsG")) || 0,
          fatG: Number(formData.get("fatG")) || 0,
        });
        toast.success("Saved — you'll get instant results scanning this again");
        onFound(food);
      } catch {
        toast.error("Couldn't save that food");
      }
    });
  }

  if (phase === "scanning" || phase === "looking-up") {
    return (
      <div>
        <BarcodeScanner onDetected={handleDetected} />
        {phase === "looking-up" && (
          <p className="mt-2 text-center text-xs text-muted-foreground">Looking up…</p>
        )}
      </div>
    );
  }

  if (phase === "not-found") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-10 text-center">
        <PackageSearch className="size-8 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">No product found</p>
          <p className="text-xs text-muted-foreground">
            Barcode {code} isn&apos;t in the food database yet.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPhase("scanning")}>
            Scan again
          </Button>
          <Button onClick={() => setPhase("manual-form")}>Add manually</Button>
        </div>
      </div>
    );
  }

  return (
    <form action={handleManualSave} className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Barcode {code} — saved with these details so scanning it again is instant.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bcName">Name</Label>
        <Input id="bcName" name="name" required autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bcServingSize">Serving size</Label>
          <Input id="bcServingSize" name="servingSize" type="number" defaultValue={100} min={0} step={0.1} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bcServingUnit">Unit</Label>
          <Input id="bcServingUnit" name="servingUnit" defaultValue="g" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bcCalories">Cal</Label>
          <Input id="bcCalories" name="calories" type="number" min={0} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bcProtein">Prot</Label>
          <Input id="bcProtein" name="proteinG" type="number" min={0} step={0.1} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bcCarbs">Carb</Label>
          <Input id="bcCarbs" name="carbsG" type="number" min={0} step={0.1} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bcFat">Fat</Label>
          <Input id="bcFat" name="fatG" type="number" min={0} step={0.1} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => setPhase("not-found")}>
          Back
        </Button>
        <Button type="submit" disabled={pending}>
          Save &amp; add
        </Button>
      </div>
    </form>
  );
}
