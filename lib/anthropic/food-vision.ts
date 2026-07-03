import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createAnthropicClient } from "./client";

const FoodItemSchema = z.object({
  name: z.string().describe("Short name of the food or dish"),
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

Identify each separately-eaten food or dish visible in the photo — items a person would log as distinct entries. For each one, estimate a realistic serving size using visual cues (plate size, utensils, typical restaurant/home portions) and provide calories, protein, carbs, and fat for that entire estimated portion.

If a dish is made of multiple components (e.g. a burger's bun, patty, and cheese, or a mixed stir-fry), combine them into ONE item with nutrition for the whole thing — do not also list any of those components as their own separate item. Every gram of food in the photo should be counted exactly once across the returned items.

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
