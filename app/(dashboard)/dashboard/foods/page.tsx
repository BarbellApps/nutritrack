import { getProfile } from "@/lib/data/profile";
import { getCustomFoods, getFavorites, getRecipes } from "@/lib/data/foods";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomFoodForm } from "@/components/foods/CustomFoodForm";
import { RecipeBuilder } from "@/components/foods/RecipeBuilder";
import { DeleteFoodButton } from "@/components/foods/DeleteFoodButton";
import { FavoriteStarButton } from "@/components/foods/FavoriteStarButton";
import { deleteCustomFood } from "@/lib/actions/foods";
import { deleteRecipe } from "@/lib/actions/recipes";
import { removeFavorite } from "@/lib/actions/favorites";

export default async function FoodsPage() {
  const { userId } = await getProfile();
  const [customFoods, recipes, favorites] = await Promise.all([
    getCustomFoods(userId),
    getRecipes(userId),
    getFavorites(userId),
  ]);

  const favoriteFoodIds = new Set(favorites.map((f) => f.food_id));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Foods</h1>

      <Tabs defaultValue="mine">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mine">My Foods</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="mine" className="flex flex-col gap-3">
          <div className="flex justify-end">
            <CustomFoodForm />
          </div>
          {customFoods.length === 0 ? (
            <EmptyState label="No custom foods yet. Add one to reuse it anytime." />
          ) : (
            <Card>
              <CardContent className="flex flex-col gap-1 pt-6">
                {customFoods.map((food) => (
                  <div key={food.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <FavoriteStarButton foodId={food.id} isFavorite={favoriteFoodIds.has(food.id)} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{food.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {food.serving_size}
                          {food.serving_unit} · {Math.round(food.calories)} kcal
                        </p>
                      </div>
                    </div>
                    <DeleteFoodButton action={deleteCustomFood.bind(null, food.id)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recipes" className="flex flex-col gap-3">
          <div className="flex justify-end">
            <RecipeBuilder />
          </div>
          {recipes.length === 0 ? (
            <EmptyState label="No recipes yet. Build one from your foods." />
          ) : (
            <Card>
              <CardContent className="flex flex-col gap-1 pt-6">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{recipe.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(recipe.total_calories / recipe.servings)} kcal / serving ·{" "}
                        {recipe.servings} servings
                      </p>
                    </div>
                    <DeleteFoodButton action={deleteRecipe.bind(null, recipe.id)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="flex flex-col gap-3">
          {favorites.length === 0 ? (
            <EmptyState label="Star foods from My Foods to see them here." />
          ) : (
            <Card>
              <CardContent className="flex flex-col gap-1 pt-6">
                {favorites
                  .filter((fav) => fav.food)
                  .map((fav) => (
                    <div key={fav.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{fav.food?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(fav.food?.calories ?? 0)} kcal
                        </p>
                      </div>
                      <DeleteFoodButton action={removeFavorite.bind(null, fav.food_id)} />
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="py-10 text-center text-sm text-muted-foreground">{label}</CardContent>
    </Card>
  );
}
