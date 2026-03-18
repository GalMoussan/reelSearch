"use client"

import { useState, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ReelForm } from "@/components/reel-form"
import { ReelGrid } from "@/components/reel-grid"
import { SearchBar } from "@/components/search-bar"
import { TagFilterBar } from "@/components/tag-filter-bar"
import { FilterBar, type FilterBarValues } from "@/components/filter-bar"
import { NLSearch } from "@/components/nl-search"
import { ProcessingStatus } from "@/components/processing-status"
import { ReelDetailModal } from "@/components/reel-detail-modal"
import { CollectionSidebar } from "@/components/collections/collection-sidebar"
import { CollectionSheet } from "@/components/collections/collection-sheet"
import { RediscoverSection } from "@/components/rediscover-section"

interface HomePageProps {
  initialReels?: {
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

export default function HomePage({ initialReels }: HomePageProps) {
  // Filter state
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterBarValues>({})
  const [isNLMode, setIsNLMode] = useState(false)

  // Collections
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null)

  // Processing status after submission
  const [lastSubmittedReelId, setLastSubmittedReelId] = useState<string | null>(null)

  // Detail modal
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const handleReelSubmitted = useCallback((reelId: string) => {
    setLastSubmittedReelId(reelId)
    queryClient.invalidateQueries({ queryKey: ["reels"] })
  }, [queryClient])

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
  }, [])

  const handleTagsChange = useCallback((tags: string[]) => {
    setSelectedTags(tags)
  }, [])

  const handleFiltersChange = useCallback((values: FilterBarValues) => {
    setFilters(values)
  }, [])

  const handleClearFilters = useCallback(() => {
    setSelectedTags([])
    setSearchQuery("")
    setFilters({})
  }, [])

  const handleSelectCollection = useCallback((id: string | null) => {
    setActiveCollectionId(id)
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Desktop sidebar */}
      <div className="hidden md:block shrink-0">
        <CollectionSidebar
          activeCollectionId={activeCollectionId}
          onSelectCollection={handleSelectCollection}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-8 pb-24 px-4 max-w-6xl mx-auto">
          {/* Hero + Submission */}
          <section className="flex flex-col items-center gap-4 pt-16 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Save &amp; Search Instagram Reels
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Paste a reel URL to save it. We&apos;ll transcribe, summarize, and make
              it searchable so you can find it later.
            </p>
            <ReelForm onSubmitted={handleReelSubmitted} />
            <ProcessingStatus reelId={lastSubmittedReelId} />
          </section>

          {/* Mobile collection trigger */}
          <div className="md:hidden">
            <CollectionSheet
              activeCollectionId={activeCollectionId}
              onSelectCollection={handleSelectCollection}
            />
          </div>

          {/* Search & Filters */}
          <section className="w-full space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {isNLMode ? (
                <div className="flex-1">
                  <NLSearch onModeChange={setIsNLMode} />
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <SearchBar
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onTagSelect={(tag) => {
                        if (!selectedTags.includes(tag)) {
                          setSelectedTags([...selectedTags, tag])
                        }
                      }}
                      placeholder="Search reels..."
                    />
                  </div>
                  <NLSearch onModeChange={setIsNLMode} />
                </>
              )}
            </div>

            {!isNLMode && (
              <>
                <TagFilterBar
                  selectedTags={selectedTags}
                  onTagsChange={handleTagsChange}
                />
                <FilterBar values={filters} onChange={handleFiltersChange} />
              </>
            )}
          </section>

          {/* Rediscover section - only in keyword mode */}
          {!isNLMode && (
            <RediscoverSection
              recentQuery={searchQuery || undefined}
              onReelClick={setSelectedReelId}
            />
          )}

          {/* Reel Grid */}
          {!isNLMode && (
            <section className="w-full">
              <ReelGrid
                tags={selectedTags.length > 0 ? selectedTags : undefined}
                q={searchQuery || undefined}
                language={filters.language}
                dateFrom={filters.dateFrom}
                dateTo={filters.dateTo}
                status={filters.status}
                collectionId={activeCollectionId ?? undefined}
                onReelClick={setSelectedReelId}
                onClearFilters={handleClearFilters}
                initialData={initialReels}
              />
            </section>
          )}

          {/* Detail Modal */}
          <ReelDetailModal
            reelId={selectedReelId}
            onClose={() => setSelectedReelId(null)}
          />
        </div>
      </div>
    </div>
  )
}
