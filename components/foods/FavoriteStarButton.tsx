"use client";

import { useTransition } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { addFavorite, removeFavorite } from "@/lib/actions/favorites";
import { cn } from "@/lib/utils";

export function FavoriteStarButton({ foodId, isFavorite }: { foodId: string; isFavorite: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
      onClick={() =>
        startTransition(async () => {
          try {
            if (isFavorite) await removeFavorite(foodId);
            else await addFavorite(foodId);
          } catch {
            toast.error("Couldn't update favorite");
          }
        })
      }
    >
      <Star
        className={cn(
          "size-4",
          isFavorite ? "fill-[color:var(--chart-3)] text-[color:var(--chart-3)]" : "text-muted-foreground"
        )}
      />
    </button>
  );
}
