import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createAnthropicClient } from "./client";

const FoodItemSchema = z.object({
  name: z.string().describe("Short name of the specific ingredient or component, e.g. \"Grilled chicken\", \"Caesar dressing\", \"Croutons\" — not the whole dish"),
  estimated_amount: z
    .string()
    .describe('Estimated portion, e.g. "1 cup", "150g", "1 medium fillet"'),
  calories: z.number().describe("Estimated calories for this portion"),
  protein_g: z.number().describe("Estimated protein in grams for this portion"),
  carbs_g: z.number().describe("Estimated carbohydrates in grams for this portion"),
  fat_g: z.number().describe("Estimated fat in grams for this portion"),
});

const FoodPhotoAnalysisSchema = z.object({
  items: z.array(FoodItemSchema).describe("Each distinct food or dish visible in the photo"),
  confidence: z.enum(["low", "medium", "high"]).describe("Overall confidence in the estimate"),
  notes: z
    .string()
    .describe("Brief caveats or assumptions made, e.g. about portion size or hidden ingredients"),
});

export type FoodPhotoAnalysis = z.infer<typeof FoodPhotoAnalysisSchema>;

const PROMPT = `You are a nutrition expert analyzing a photo of food for a calorie tracking app.

For each dish or plate visible in the photo, break it down into its individual visible ingredients or components and list EACH as its own separate item — do not lump a whole dish into one combined entry. For example: a burger becomes separate items for the bun, patty, cheese, lettuce, and sauce; a salad becomes separate items for the greens, protein, dressing, croutons, and cheese; a plate with rice, chicken, and vegetables becomes three separate items. Only merge components into a single item when they are genuinely inseparable in reality (e.g. a smoothie, a sauce fully blended into a stir-fry, or a bread's inherent crust).

If the photo contains multiple distinct dishes (e.g. a burger plus a side of fries), decompose each dish independently into its own ingredients.

For each ingredient item, estimate a realistic portion using visual cues (plate size, utensils, typical proportions for that kind of dish) and provide calories, protein, carbs, and fat for that ingredient's estimated portion.

Every gram of food visible in the photo must be counted in exactly one item — never split the same ingredient across multiple items, and never omit a visible component.

Give an overall confidence level and a one-sentence note on any assumptions you made.`;

export async function analyzeFoodPhoto(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<FoodPhotoAnalysis> {
  const client = createAnthropicClient();

  const response = await client.messages.parse({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64Image } },
          { type: "text", text: PROMPT },
        ],
      },
    ],
    output_config: {
      format: zodOutputFormat(FoodPhotoAnalysisSchema),
    },
  });

  if (!response.parsed_output) {
    throw new Error("Could not parse a nutrition estimate from that photo");
  }

  return response.parsed_output;
}
