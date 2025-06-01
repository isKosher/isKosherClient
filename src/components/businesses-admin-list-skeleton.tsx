import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessesAdminListSkeleton() {
  return (
    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="cursor-pointer border-sky-100 shadow-sm">
          <CardContent className="py-3">
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-3.5 w-12 rounded" />
              <Skeleton className="h-3 w-3 rounded-full" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-3 w-36 rounded" />
              <Skeleton className="h-3 w-3 rounded-full" />
            </div>
            <div className="flex gap-2 mt-3">
              <Skeleton className="h-6 w-16 rounded" />
              <Skeleton className="h-6 w-10 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
