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

export default function Home() {
  // Filter state
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterBarValues>({})
  const [isNLMode, setIsNLMode] = useState(false)

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

  return (
    <div className="flex flex-col gap-8 pb-24">
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
            onReelClick={setSelectedReelId}
            onClearFilters={handleClearFilters}
          />
        </section>
      )}

      {/* Detail Modal */}
      <ReelDetailModal
        reelId={selectedReelId}
        onClose={() => setSelectedReelId(null)}
      />
    </div>
  )
}
