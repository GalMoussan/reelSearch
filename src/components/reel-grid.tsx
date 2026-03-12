"use client"

import { useEffect, useRef } from "react"
import { useReels } from "@/hooks/use-reels"
import { ReelCard } from "@/components/reel-card"
import ReelCardSkeleton from "@/components/reel-card-skeleton"
import { EmptyState } from "@/components/empty-state"
import { cn } from "@/lib/utils"

interface ReelGridProps {
  tags?: string[]
  q?: string
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
          <ReelCardSkeleton key={i} />
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

  const hasFilters = Boolean(tags?.length || q)

  if (allReels.length === 0) {
    return (
      <EmptyState
        variant={hasFilters ? "filtered" : "initial"}
        onClearFilters={hasFilters ? () => window.location.assign("/") : undefined}
      />
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
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <ReelCardSkeleton key={`next-${i}`} />
          ))}
        </div>
      )}
    </div>
  )
}
