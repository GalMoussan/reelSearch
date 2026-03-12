"use client"

import { useEffect, useRef } from "react"
import { useReels } from "@/hooks/use-reels"
import { ReelCard } from "@/components/reel-card"
import { cn } from "@/lib/utils"

interface ReelGridProps {
  tags?: string[]
  q?: string
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="aspect-video w-full animate-pulse bg-muted" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="mt-2 flex gap-1">
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          <div className="h-4 w-10 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}

export function ReelGrid({ tags, q }: ReelGridProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useReels({ tags, q })

  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: "200px" },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  function handleReelClick(reelId: string) {
    // T031 will wire up the detail modal
    console.log("Reel clicked:", reelId)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-12 text-center text-sm text-destructive">
        {error instanceof Error
          ? error.message
          : "Something went wrong loading reels."}
      </div>
    )
  }

  const allReels = data?.pages.flatMap((page) => page.data) ?? []

  if (allReels.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No reels found. Submit a reel URL above to get started.
      </div>
    )
  }

  return (
    <div>
      <div
        className={cn(
          "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        )}
      >
        {allReels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} onClick={handleReelClick} />
        ))}
      </div>

      {/* Sentinel element for infinite scroll */}
      <div ref={sentinelRef} className="h-1" />

      {isFetchingNextPage && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Loading more...
        </p>
      )}
    </div>
  )
}
