"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Loader2, X, ChefHat } from "lucide-react";
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
import { searchFoods } from "@/lib/actions/foods";
import { createRecipe } from "@/lib/actions/recipes";
import { scaleNutrition } from "@/lib/utils/nutrition";
import type { Food, RecipeIngredient } from "@/types";

export function RecipeBuilder() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [servings, setServings] = useState(1);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (query.trim().length < 2) return;
    const t = setTimeout(() => {
      setSearching(true);
      searchFoods(query)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const visibleResults = query.trim().length < 2 ? [] : results;

  function addIngredient(food: Food) {
    const scaled = scaleNutrition(food, 1);
    setIngredients((prev) => [
      ...prev,
      {
        food_id: food.id,
        name: food.name,
        servings: 1,
        calories: scaled.calories,
        protein_g: scaled.protein_g,
        carbs_g: scaled.carbs_g,
        fat_g: scaled.fat_g,
      },
    ]);
    setQuery("");
    setResults([]);
  }

  function removeIngredient(idx: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  }

  const totals = ingredients.reduce(
    (acc, i) => ({
      calories: acc.calories + i.calories,
      protein_g: acc.protein_g + i.protein_g,
      carbs_g: acc.carbs_g + i.carbs_g,
      fat_g: acc.fat_g + i.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  function reset() {
    setName("");
    setServings(1);
    setIngredients([]);
    setQuery("");
    setResults([]);
  }

  function handleSave() {
    if (!name.trim() || ingredients.length === 0) {
      toast.error("Add a name and at least one ingredient");
      return;
    }
    startTransition(async () => {
      try {
        await createRecipe({ name, servings, ingredients });
        toast.success("Recipe saved");
        setOpen(false);
        reset();
      } catch {
        toast.error("Couldn't save recipe");
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
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          New recipe
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New recipe</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="recipeName">Name</Label>
              <Input id="recipeName" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="recipeServings">Servings</Label>
              <Input
                id="recipeServings"
                type="number"
                min={1}
                step={0.5}
                value={servings}
                onChange={(e) => setServings(Number(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Add ingredients</Label>
            <Input placeholder="Search foods…" value={query} onChange={(e) => setQuery(e.target.value)} />
            {searching && (
              <div className="flex justify-center py-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
              </div>
            )}
            {visibleResults.length > 0 && (
              <div className="flex max-h-48 flex-col gap-0.5 overflow-y-auto rounded-md border border-border p-1">
                {visibleResults.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => addIngredient(f)}
                    className="flex items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-accent/40"
                  >
                    <span className="truncate">{f.name}</span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {Math.round(f.calories)} kcal
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {ingredients.length > 0 && (
            <div className="flex flex-col gap-1 rounded-md border border-border p-2">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="truncate">{ing.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {Math.round(ing.calories)} kcal
                    </span>
                    <button type="button" onClick={() => removeIngredient(idx)}>
                      <X className="size-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-2 flex items-center gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
                <ChefHat className="size-3.5" />
                Total: {Math.round(totals.calories)} kcal · {Math.round(totals.calories / servings)}{" "}
                kcal / serving
              </div>
            </div>
          )}

          <Button onClick={handleSave} disabled={pending}>
            Save recipe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
