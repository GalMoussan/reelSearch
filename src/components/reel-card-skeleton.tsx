import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReelCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Thumbnail */}
      <Skeleton className="aspect-video w-full rounded-none" />

      <CardContent className="p-4">
        {/* Title — 2 lines */}
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-1.5 h-4 w-1/2" />

        {/* Summary */}
        <Skeleton className="mt-2 h-3 w-full" />
        <Skeleton className="mt-1 h-3 w-2/3" />

        {/* Tags — 3 small rects */}
        <div className="mt-2 flex gap-1">
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-10 rounded-full" />
        </div>

        {/* Footer: date + user */}
        <div className="mt-3 flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
