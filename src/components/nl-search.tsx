"use client"

import { useState, type FormEvent } from "react"
import { useMutation } from "@tanstack/react-query"
import { Sparkles, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ReelCard } from "@/components/reel-card"

interface ReelTag {
  id: string
  name: string
}

interface Reel {
  id: string
  title: string | null
  summary: string | null
  thumbnailUrl: string | null
  status: string
  createdAt: string
  tags: ReelTag[]
  addedBy?: { name: string | null; image: string | null }
}

interface SearchResponse {
  data: Reel[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

interface NLSearchProps {
  onModeChange?: (isNLMode: boolean) => void
}

async function performSearch(query: string): Promise<SearchResponse> {
  const params = new URLSearchParams()
  params.set("q", query)
  params.set("limit", "50")

  const res = await fetch(`/api/reels?${params}`)
  if (!res.ok) {
    throw new Error("Search request failed")
  }
  return res.json()
}

export function NLSearch({ onModeChange }: NLSearchProps) {
  const [isNLMode, setIsNLMode] = useState(true)
  const [query, setQuery] = useState("")

  const mutation = useMutation({
    mutationFn: performSearch,
  })

  function handleModeChange(nlMode: boolean) {
    setIsNLMode(nlMode)
    onModeChange?.(nlMode)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    mutation.mutate(trimmed)
  }

  if (!isNLMode) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleModeChange(true)}
        className="gap-1.5"
      >
        <Sparkles className="h-3.5 w-3.5" />
        AI Search
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleModeChange(false)}
          className="gap-1.5"
        >
          <Search className="h-3.5 w-3.5" />
          Keyword
        </Button>
        <Button
          size="sm"
          className="gap-1.5 bg-violet-600 text-white hover:bg-violet-700"
          onClick={() => handleModeChange(true)}
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Search
        </Button>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your reels naturally..."
          className="border-violet-300 focus-visible:ring-violet-500"
          disabled={mutation.isPending}
        />
        <Button
          type="submit"
          disabled={mutation.isPending || !query.trim()}
          className="shrink-0 bg-violet-600 text-white hover:bg-violet-700"
        >
          {mutation.isPending ? "Searching..." : "Search"}
        </Button>
      </form>

      {/* Error State */}
      {mutation.isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            Search failed. Please try again.
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {mutation.data && (
        <div className="space-y-4">
          <Badge variant="secondary" className="text-xs">
            {mutation.data.meta.total} result{mutation.data.meta.total !== 1 ? "s" : ""}
          </Badge>

          {mutation.data.data.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mutation.data.data.map((reel) => (
                <ReelCard key={reel.id} reel={reel} />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              No reels found. Try different words.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
