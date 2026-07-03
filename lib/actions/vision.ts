"use server";

import { createClient } from "@/lib/supabase/server";
import { analyzeFoodPhoto, type FoodPhotoAnalysis } from "@/lib/anthropic/food-vision";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function analyzeFoodPhotoAction(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<FoodPhotoAnalysis> {
  await requireUserId();
  return analyzeFoodPhoto(base64Image, mediaType);
}
