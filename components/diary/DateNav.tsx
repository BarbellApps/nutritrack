"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { displayDate, shiftDate, todayStr } from "@/lib/utils/date";

export function DateNav({ date, basePath = "/dashboard" }: { date: string; basePath?: string }) {
  const prev = shiftDate(date, -1);
  const next = shiftDate(date, 1);
  const isToday = date === todayStr();

  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="icon" asChild>
        <Link href={`${basePath}?date=${prev}`} aria-label="Previous day">
          <ChevronLeft className="size-4" />
        </Link>
      </Button>
      <div className="flex flex-col items-center">
        <span className="text-xl font-bold tracking-tight">{displayDate(date)}</span>
        {!isToday && (
          <Link href={basePath} className="text-xs text-primary underline underline-offset-4">
            Back to today
          </Link>
        )}
      </div>
      <Button variant="ghost" size="icon" asChild>
        <Link href={`${basePath}?date=${next}`} aria-label="Next day">
          <ChevronRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
