"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCustomFood } from "@/lib/actions/foods";

const FIELDS = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "brand", label: "Brand (optional)", type: "text", required: false },
] as const;

export function CustomFoodForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createCustomFood({
          name: String(formData.get("name")),
          brand: String(formData.get("brand") || ""),
          servingSize: Number(formData.get("servingSize")) || 100,
          servingUnit: String(formData.get("servingUnit") || "g"),
          calories: Number(formData.get("calories")) || 0,
          proteinG: Number(formData.get("proteinG")) || 0,
          carbsG: Number(formData.get("carbsG")) || 0,
          fatG: Number(formData.get("fatG")) || 0,
        });
        toast.success("Food saved");
        setOpen(false);
      } catch {
        toast.error("Couldn't save food");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          New food
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New custom food</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          {FIELDS.map((f) => (
            <div key={f.name} className="flex flex-col gap-1.5">
              <Label htmlFor={f.name}>{f.label}</Label>
              <Input id={f.name} name={f.name} type={f.type} required={f.required} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="servingSize">Serving size</Label>
              <Input id="servingSize" name="servingSize" type="number" defaultValue={100} min={0} step={0.1} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="servingUnit">Unit</Label>
              <Input id="servingUnit" name="servingUnit" defaultValue="g" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="calories">Calories</Label>
              <Input id="calories" name="calories" type="number" min={0} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proteinG">Protein (g)</Label>
              <Input id="proteinG" name="proteinG" type="number" min={0} step={0.1} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="carbsG">Carbs (g)</Label>
              <Input id="carbsG" name="carbsG" type="number" min={0} step={0.1} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fatG">Fat (g)</Label>
            <Input id="fatG" name="fatG" type="number" min={0} step={0.1} />
          </div>
          <Button type="submit" disabled={pending}>
            Save food
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
