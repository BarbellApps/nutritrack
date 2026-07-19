import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DiaryLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="size-8 rounded-full" />
      </div>

      <div className="flex flex-col gap-3">
        <Card>
          <CardContent className="flex items-center gap-6">
            <Skeleton className="size-33 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} size="sm">
              <CardContent className="flex flex-col gap-3">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <Skeleton className="size-10 shrink-0 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-4 w-16" />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-3 pt-6">
              <Skeleton className="size-10 shrink-0 rounded-xl" />
              <div className="flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-1.5 h-3 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
