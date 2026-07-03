"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { deleteFoodLog } from "@/lib/actions/logs";
import { toast } from "sonner";

export function DeleteLogButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label="Remove"
      disabled={pending}
      className="text-muted-foreground/60 hover:text-destructive"
      onClick={() =>
        startTransition(async () => {
          try {
            await deleteFoodLog(id);
          } catch {
            toast.error("Couldn't remove entry");
          }
        })
      }
    >
      <X className="size-4" />
    </button>
  );
}
