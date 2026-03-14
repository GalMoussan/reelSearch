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
  language?: string
  dateFrom?: string
  dateTo?: string
  status?: string
  onReelClick?: (reelId: string) => void
  onClearFilters?: () => void
}

export function ReelGrid({ tags, q, language, dateFrom, dateTo, status, onReelClick, onClearFilters }: ReelGridProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useReels({ tags, q, language, dateFrom, dateTo, status })

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
    onReelClick?.(reelId)
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

  const hasFilters = Boolean(tags?.length || q || language || dateFrom || dateTo || status)

  const total = data?.pages[0]?.meta?.total ?? 0
  const highlightTerms = q ? q.split(/\s+/).filter(Boolean) : []

  if (allReels.length === 0) {
    const emptyVariant = q ? "search" : hasFilters ? "filtered" : "initial"
    return (
      <EmptyState
        variant={emptyVariant}
        searchQuery={q}
        onClearFilters={hasFilters ? onClearFilters : undefined}
      />
    )
  }

  return (
    <div>
      {/* Result count */}
      {hasFilters && (
        <p className="mb-3 text-sm text-muted-foreground">
          {total} {total === 1 ? "result" : "results"}
          {q ? ` for "${q}"` : ""}
        </p>
      )}

      <div
        className={cn(
          "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        )}
      >
        {allReels.map((reel) => (
          <ReelCard
            key={reel.id}
            reel={reel}
            onClick={handleReelClick}
            highlightTerms={highlightTerms}
          />
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
