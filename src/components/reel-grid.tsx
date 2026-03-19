"use client"

import { useEffect, useRef } from "react"
import { useReels } from "@/hooks/use-reels"
import { ReelCard } from "@/components/reel-card"
import ReelCardSkeleton from "@/components/reel-card-skeleton"
import { EmptyState } from "@/components/empty-state"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface ReelGridProps {
  tags?: string[]
  q?: string
  language?: string
  dateFrom?: string
  dateTo?: string
  status?: string
  collectionId?: string
  onReelClick?: (reelId: string) => void
  onClearFilters?: () => void
  initialData?: {
    data: Array<{
      id: string
      title: string | null
      summary: string | null
      thumbnailUrl: string | null
      status: string
      errorMessage?: string | null
      createdAt: string
      tags: Array<{ id: string; name: string }>
      addedBy?: { name: string | null; image: string | null }
    }>
    meta: { page: number; limit: number; total: number; totalPages: number }
  }
}

export function ReelGrid({ tags, q, language, dateFrom, dateTo, status, collectionId, onReelClick, onClearFilters, initialData }: ReelGridProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
  } = useReels({ tags, q, language, dateFrom, dateTo, status, collectionId, initialData })

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
      <div>
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading results…</span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ReelCardSkeleton key={i} />
          ))}
        </div>
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

      <div className="relative">
        {isFetching && !isLoading && !isFetchingNextPage && (
          <div className="absolute inset-0 z-10 flex items-start justify-center bg-background/60 pt-24">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading results…</span>
            </div>
          </div>
        )}

        <div
          className={cn(
            "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            isFetching && !isLoading && !isFetchingNextPage && "pointer-events-none",
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
