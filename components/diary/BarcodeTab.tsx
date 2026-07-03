"use client";

import { useRef, useState, useTransition } from "react";
import { PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lookupBarcode, createCustomFood } from "@/lib/actions/foods";
import { BarcodeScanner } from "./BarcodeScanner";
import type { Food } from "@/types";

// A held-up barcode gets decoded many times a second while it's in frame, so
// track in-flight/recently-missed codes to avoid re-querying (and re-toasting)
// on every frame. The camera stays mounted through a miss — a single
// misread frame should never require the user to explicitly restart scanning.
export function BarcodeTab({ onFound }: { onFound: (food: Food) => void }) {
  const [manualEntry, setManualEntry] = useState(false);
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);
  const [pending, startTransition] = useTransition();
  const inFlight = useRef<Set<string>>(new Set());
  const recentMisses = useRef<Map<string, number>>(new Map());

  function handleDetected(detected: string) {
    if (inFlight.current.has(detected)) return;
    const missedAt = recentMisses.current.get(detected);
    if (missedAt && Date.now() - missedAt < 4000) return;

    inFlight.current.add(detected);
    setLooking(true);
    startTransition(async () => {
      const food = await lookupBarcode(detected).catch(() => null);
      inFlight.current.delete(detected);
      setLooking(false);
      if (food) {
        onFound(food);
      } else {
        recentMisses.current.set(detected, Date.now());
        setNotFoundCode(detected);
        toast.error("Product not found for that barcode");
      }
    });
  }

  function handleManualSave(formData: FormData) {
    startTransition(async () => {
      try {
        const food = await createCustomFood({
          name: String(formData.get("name")),
          barcode: notFoundCode ?? undefined,
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

  if (!manualEntry) {
    return (
      <div className="flex flex-col gap-2">
        <BarcodeScanner onDetected={handleDetected} />
        {looking && (
          <p className="text-center text-xs text-muted-foreground">Looking up…</p>
        )}
        {!looking && notFoundCode && (
          <div className="flex items-center justify-between gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs">
            <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
              <PackageSearch className="size-3.5 shrink-0" />
              <span className="truncate">{notFoundCode} not found — keep scanning, or</span>
            </span>
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => setManualEntry(true)}
            >
              Add manually
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form action={handleManualSave} className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        {notFoundCode
          ? `Barcode ${notFoundCode} — saved with these details so scanning it again is instant.`
          : "Add this food manually."}
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
        <Button type="button" variant="ghost" onClick={() => setManualEntry(false)}>
          Back
        </Button>
        <Button type="submit" disabled={pending}>
          Save &amp; add
        </Button>
      </div>
    </form>
  );
}
