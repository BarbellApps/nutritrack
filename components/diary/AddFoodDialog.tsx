"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Loader2, Search, Barcode, Star, BookOpen, ChefHat, Camera } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchFoods, lookupBarcode } from "@/lib/actions/foods";
import { addFoodLog } from "@/lib/actions/logs";
import { logRecipeAsMeal } from "@/lib/actions/recipes";
import { scaleNutrition } from "@/lib/utils/nutrition";
import { BarcodeScanner } from "./BarcodeScanner";
import { PhotoScanTab } from "./PhotoScanTab";
import { ServingPicker } from "./ServingPicker";
import type { Favorite, Food, MealType, Recipe } from "@/types";

interface Props {
  mealType: MealType;
  loggedDate: string;
  favorites: Favorite[];
  customFoods: Food[];
  recipes: Recipe[];
}

function FoodRow({ food, onSelect }: { food: Food; onSelect: (f: Food) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(food)}
      className="flex w-full items-center justify-between gap-3 rounded-md border border-transparent px-3 py-2.5 text-left hover:border-border hover:bg-accent/40"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{food.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {food.brand ? `${food.brand} · ` : ""}
          {food.serving_size}
          {food.serving_unit} · {Math.round(food.calories)} kcal
        </p>
      </div>
      <Plus className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

export function AddFoodDialog({ mealType, loggedDate, favorites, customFoods, recipes }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Food | null>(null);
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

  function reset() {
    setSelected(null);
    setQuery("");
    setResults([]);
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
        setOpen(false);
        reset();
      } catch {
        toast.error("Couldn't add food");
      }
    });
  }

  function handleAddRecipe(recipe: Recipe, servings: number) {
    startTransition(async () => {
      try {
        await logRecipeAsMeal(recipe.id, mealType, loggedDate, servings);
        toast.success(`Added ${recipe.name}`);
        setOpen(false);
      } catch {
        toast.error("Couldn't add recipe");
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
        <Button variant="ghost" size="sm" className="gap-1.5 text-primary">
          <Plus className="size-4" />
          Add food
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="capitalize">Add to {mealType}</DialogTitle>
        </DialogHeader>

        {selected ? (
          <ServingPicker
            food={selected}
            onCancel={() => setSelected(null)}
            onConfirm={(servings) => handleAdd(selected, servings)}
          />
        ) : (
          <Tabs defaultValue="search">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="search">
                <Search className="size-4" />
              </TabsTrigger>
              <TabsTrigger value="barcode">
                <Barcode className="size-4" />
              </TabsTrigger>
              <TabsTrigger value="photo">
                <Camera className="size-4" />
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Star className="size-4" />
              </TabsTrigger>
              <TabsTrigger value="recipes">
                <ChefHat className="size-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="flex flex-col gap-2">
              <Input
                autoFocus
                placeholder="Search foods…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
                {searching && (
                  <div className="flex justify-center py-6 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" />
                  </div>
                )}
                {!searching && query.trim().length >= 2 && visibleResults.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">No foods found.</p>
                )}
                {visibleResults.map((f) => (
                  <FoodRow key={f.id} food={f} onSelect={setSelected} />
                ))}
                {customFoods.length > 0 && query.trim().length < 2 && (
                  <>
                    <p className="px-3 pt-2 text-xs font-medium text-muted-foreground">
                      Your foods
                    </p>
                    {customFoods.slice(0, 6).map((f) => (
                      <FoodRow key={f.id} food={f} onSelect={setSelected} />
                    ))}
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="barcode">
              <BarcodeScanner
                onDetected={(code) => {
                  startTransition(async () => {
                    const food = await lookupBarcode(code).catch(() => null);
                    if (food) setSelected(food);
                    else toast.error("Product not found for that barcode");
                  });
                }}
              />
              {pending && (
                <p className="mt-2 text-center text-xs text-muted-foreground">Looking up…</p>
              )}
            </TabsContent>

            <TabsContent value="photo">
              <PhotoScanTab
                mealType={mealType}
                loggedDate={loggedDate}
                onLogged={() => {
                  setOpen(false);
                  reset();
                }}
              />
            </TabsContent>

            <TabsContent value="favorites" className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
              {favorites.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Star foods to see them here.
                </p>
              )}
              {favorites
                .filter((fav) => fav.food)
                .map((fav) => (
                  <FoodRow key={fav.id} food={fav.food as Food} onSelect={setSelected} />
                ))}
            </TabsContent>

            <TabsContent value="recipes" className="flex max-h-80 flex-col gap-1 overflow-y-auto">
              {recipes.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  <BookOpen className="mx-auto mb-2 size-5" />
                  No recipes yet — create one under Foods.
                </p>
              )}
              {recipes.map((r) => (
                <RecipeRow key={r.id} recipe={r} onAdd={handleAddRecipe} />
              ))}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RecipeRow({ recipe, onAdd }: { recipe: Recipe; onAdd: (r: Recipe, servings: number) => void }) {
  const [servings, setServings] = useState(1);
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left hover:bg-accent/40"
      >
        <div>
          <p className="text-sm font-medium">{recipe.name}</p>
          <p className="text-xs text-muted-foreground">
            {Math.round(recipe.total_calories / recipe.servings)} kcal / serving ·{" "}
            {recipe.servings} servings
          </p>
        </div>
        <Plus className="size-4 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5">
      <span className="flex-1 truncate text-sm font-medium">{recipe.name}</span>
      <Input
        type="number"
        min={0.25}
        step={0.25}
        value={servings}
        onChange={(e) => setServings(Number(e.target.value) || 0)}
        className="w-20"
      />
      <Button size="sm" onClick={() => onAdd(recipe, servings)}>
        Add
      </Button>
    </div>
  );
}
