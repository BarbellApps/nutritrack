"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteFoodButton({ action }: { action: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await action();
          } catch {
            toast.error("Couldn't delete");
          }
        })
      }
    >
      <Trash2 className="size-4 text-muted-foreground" />
    </Button>
  );
}
