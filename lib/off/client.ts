// Text search is biased to the user's market so local products surface first
// (Open Food Facts started in France, so its global/`world` results skew
// heavily French). Barcode lookups stay global — scanning a specific product
// in hand should resolve no matter where it was added. Override the market
// with NEXT_PUBLIC_OFF_COUNTRY (an OFF country subdomain code, e.g. "nl",
// "de", "be", "world").
const OFF_COUNTRY = process.env.NEXT_PUBLIC_OFF_COUNTRY || "nl";
const OFF_SEARCH_BASE = `https://${OFF_COUNTRY}.openfoodfacts.org`;
const OFF_WORLD_BASE = "https://world.openfoodfacts.org";

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

  // Some products (instant coffee, dry soup, ...) only publish nutriments for
  // the *prepared* form, not as-sold — fall back to those rather than
  // reporting a bogus 0.
  const per100 = (key: string): number | undefined => {
    const v = n[`${key}_100g`] ?? n[`${key}_prepared_100g`];
    return typeof v === "number" ? v : undefined;
  };

  const kcal = per100("energy-kcal");
  const protein = per100("proteins");
  const carbs = per100("carbohydrates");
  const fat = per100("fat");
  // No nutrition data at all → useless noise in a calorie tracker.
  if (kcal === undefined && protein === undefined && carbs === undefined && fat === undefined) {
    return null;
  }

  const servingGrams = parseServingGrams(p);
  // Nutriments from OFF are per 100g; scale to the serving size we report.
  const factor = servingGrams / 100;
  const fiber = per100("fiber");
  const sugars = per100("sugars");
  const sodium = per100("sodium");

  return {
    barcode,
    name: p.product_name,
    brand: p.brands?.split(",")[0]?.trim() || null,
    serving_size: servingGrams,
    serving_unit: "g",
    calories: Math.round((kcal ?? 0) * factor),
    protein_g: Math.round((protein ?? 0) * factor * 10) / 10,
    carbs_g: Math.round((carbs ?? 0) * factor * 10) / 10,
    fat_g: Math.round((fat ?? 0) * factor * 10) / 10,
    fiber_g: fiber !== undefined ? Math.round(fiber * factor * 10) / 10 : null,
    sugar_g: sugars !== undefined ? Math.round(sugars * factor * 10) / 10 : null,
    sodium_mg: sodium !== undefined ? Math.round(sodium * factor * 1000) : null,
    image_url: p.image_front_url || p.image_url || null,
    ingredients_text: p.ingredients_text_en || p.ingredients_text || null,
  };
}

const PRODUCT_FIELDS =
  "product_name,brands,serving_quantity,serving_size,nutriments,image_front_url,image_url,ingredients_text,ingredients_text_en";

export async function lookupBarcode(barcode: string): Promise<OFFProduct | null> {
  const res = await fetch(
    `${OFF_WORLD_BASE}/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${PRODUCT_FIELDS}`,
    {
      headers: { "User-Agent": "NutriTrack - nutritrack.app" },
      signal: AbortSignal.timeout(8000),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  return toProduct(barcode, data.product);
}

export async function searchOFF(query: string, limit = 15): Promise<OFFProduct[]> {
  const res = await fetch(
    `${OFF_SEARCH_BASE}/cgi/search.pl?search_terms=${encodeURIComponent(
      query
    )}&search_simple=1&action=process&json=1&page_size=${limit}&fields=code,${PRODUCT_FIELDS}`,
    {
      headers: { "User-Agent": "NutriTrack - nutritrack.app" },
      signal: AbortSignal.timeout(8000),
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  const products: (OFFApiProduct & { code: string })[] = data.products ?? [];
  return products
    .map((p) => toProduct(p.code, p))
    .filter((p): p is OFFProduct => p !== null);
}
