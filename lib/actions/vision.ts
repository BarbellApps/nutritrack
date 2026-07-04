"use server";

import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

// Uses the service-role client because the "food-photos" storage bucket has
// no per-object RLS policy (it can only be created via the Storage REST API
// here, not fine-grained SQL policies) — object writes must bypass RLS.
export async function uploadFoodScanPhoto(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<string> {
  const userId = await requireUserId();
  const admin = createAdminClient();
  const ext = mediaType.split("/")[1];
  const path = `${userId}/${Date.now()}-${randomUUID()}.${ext}`;
  const buffer = Buffer.from(base64Image, "base64");

  const { error } = await admin.storage.from("food-photos").upload(path, buffer, {
    contentType: mediaType,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = admin.storage.from("food-photos").getPublicUrl(path);
  return data.publicUrl;
}
