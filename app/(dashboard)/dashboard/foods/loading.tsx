import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FoodsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-9 w-24" />

      <Skeleton className="h-10 w-full rounded-full" />

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-5 shrink-0 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-1.5 h-3 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
