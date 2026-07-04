const OFF_BASE = "https://world.openfoodfacts.org";

export interface OFFProduct {
  barcode: string;
  name: string;
  brand: string | null;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
  image_url: string | null;
  ingredients_text: string | null;
}

interface OFFApiProduct {
  product_name?: string;
  brands?: string;
  serving_quantity?: number;
  serving_size?: string;
  nutriments?: Record<string, number>;
  image_front_url?: string;
  image_url?: string;
  ingredients_text?: string;
  ingredients_text_en?: string;
}

function parseServingGrams(p: OFFApiProduct): number {
  if (p.serving_quantity && p.serving_quantity > 0) return p.serving_quantity;
  const match = p.serving_size?.match(/([\d.]+)\s*g/i);
  if (match) return parseFloat(match[1]);
  return 100;
}

function toProduct(barcode: string, p: OFFApiProduct): OFFProduct | null {
  if (!p.product_name) return null;
  const n = p.nutriments ?? {};
  const servingGrams = parseServingGrams(p);
  // Nutriments from OFF are per 100g; scale to the serving size we report.
  const factor = servingGrams / 100;

  return {
    barcode,
    name: p.product_name,
    brand: p.brands?.split(",")[0]?.trim() || null,
    serving_size: servingGrams,
    serving_unit: "g",
    calories: Math.round((n["energy-kcal_100g"] ?? 0) * factor),
    protein_g: Math.round((n["proteins_100g"] ?? 0) * factor * 10) / 10,
    carbs_g: Math.round((n["carbohydrates_100g"] ?? 0) * factor * 10) / 10,
    fat_g: Math.round((n["fat_100g"] ?? 0) * factor * 10) / 10,
    fiber_g: n["fiber_100g"] != null ? Math.round(n["fiber_100g"] * factor * 10) / 10 : null,
    sugar_g: n["sugars_100g"] != null ? Math.round(n["sugars_100g"] * factor * 10) / 10 : null,
    sodium_mg: n["sodium_100g"] != null ? Math.round(n["sodium_100g"] * factor * 1000) : null,
    image_url: p.image_front_url || p.image_url || null,
    ingredients_text: p.ingredients_text_en || p.ingredients_text || null,
  };
}

const PRODUCT_FIELDS =
  "product_name,brands,serving_quantity,serving_size,nutriments,image_front_url,image_url,ingredients_text,ingredients_text_en";

export async function lookupBarcode(barcode: string): Promise<OFFProduct | null> {
  const res = await fetch(
    `${OFF_BASE}/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${PRODUCT_FIELDS}`,
    { headers: { "User-Agent": "NutriTrack - nutritrack.app" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  return toProduct(barcode, data.product);
}

export async function searchOFF(query: string, limit = 15): Promise<OFFProduct[]> {
  const res = await fetch(
    `${OFF_BASE}/cgi/search.pl?search_terms=${encodeURIComponent(
      query
    )}&search_simple=1&action=process&json=1&page_size=${limit}&fields=code,${PRODUCT_FIELDS}`,
    { headers: { "User-Agent": "NutriTrack - nutritrack.app" } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  const products: (OFFApiProduct & { code: string })[] = data.products ?? [];
  return products
    .map((p) => toProduct(p.code, p))
    .filter((p): p is OFFProduct => p !== null);
}
