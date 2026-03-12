"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Reel {
  id: string
  url: string
  title?: string
  summary?: string
  thumbnailUrl?: string
  status: string
  createdAt: string
  tags: Array<{ id: string; name: string }>
}

interface ReelsResponse {
  data: Reel[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function ReelCard({ reel }: { reel: Reel }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {reel.thumbnailUrl && (
        <div className="relative w-full h-40 bg-muted overflow-hidden">
          <img
            src={reel.thumbnailUrl}
            alt={reel.title || "Reel"}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-2 mb-2">
          {reel.title || "Untitled Reel"}
        </h3>
        {reel.summary && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {reel.summary}
          </p>
        )}
        <a
          href={reel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          View Reel →
        </a>
      </CardContent>
    </Card>
  )
}

function ReelSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="w-full h-40" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-20 mt-2" />
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="col-span-full flex items-center justify-center min-h-96">
      <div className="text-center">
        <p className="text-muted-foreground text-lg">No reels found</p>
      </div>
    </div>
  )
}

export function TagReels({ tagName }: { tagName: string }) {
  const { data, isLoading, error } = useQuery<ReelsResponse>({
    queryKey: ["reels", "tag", tagName],
    queryFn: async () => {
      const response = await fetch(
        `/api/reels?tags=${encodeURIComponent(tagName)}`
      )
      if (!response.ok) {
        throw new Error("Failed to fetch reels")
      }
      return response.json()
    },
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ReelSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="col-span-full flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-destructive">Failed to load reels</p>
        </div>
      </div>
    )
  }

  if (!data?.data || data.data.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.data.map((reel) => (
        <ReelCard key={reel.id} reel={reel} />
      ))}
    </div>
  )
}
