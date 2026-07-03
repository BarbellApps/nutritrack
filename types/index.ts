export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type WeightUnit = "kg" | "lb";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  daily_calorie_goal: number;
  daily_protein_goal_g: number;
  daily_carbs_goal_g: number;
  daily_fat_goal_g: number;
  daily_water_goal_ml: number;
  weight_unit: WeightUnit;
  height_cm: number | null;
  goal_weight_kg: number | null;
  activity_level: ActivityLevel;
  created_at: string;
  updated_at: string;
}

export interface Food {
  id: string;
  user_id: string | null;
  name: string;
  brand: string | null;
  barcode: string | null;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
  is_custom: boolean;
  source: "user" | "off" | "system";
  created_at: string;
}

export interface FoodLog {
  id: string;
  user_id: string;
  food_id: string | null;
  food_name: string;
  meal_type: MealType;
  logged_date: string;
  servings: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  created_at: string;
  food?: Food | null;
}

export interface WaterLog {
  id: string;
  user_id: string;
  logged_date: string;
  amount_ml: number;
  created_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  logged_date: string;
  weight_kg: number;
  note: string | null;
  created_at: string;
}

export interface RecipeIngredient {
  food_id: string | null;
  name: string;
  servings: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  servings: number;
  ingredients: RecipeIngredient[];
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  food_id: string;
  created_at: string;
  food?: Food;
}

export interface DailySummary {
  date: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_ml: number;
}
