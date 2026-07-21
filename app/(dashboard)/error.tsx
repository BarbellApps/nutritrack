"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <div>
        <p className="text-lg font-semibold">Something went wrong</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {error.digest ? `Error ${error.digest} — ` : ""}
          That page hit a snag. Your data is safe — try again.
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
