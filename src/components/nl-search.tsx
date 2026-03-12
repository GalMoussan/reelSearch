"use client"

import { useState, type FormEvent } from "react"
import { useMutation } from "@tanstack/react-query"
import { ChevronDown, ChevronRight, Sparkles, Search } from "lucide-react"

import { cn } from "@/lib/utils"
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

interface SearchPlan {
  keywords: string[]
  tags: string[]
  semanticQuery: string
  reasoning: string
}

interface NLSearchResponse {
  data: Reel[]
  reasoning: string
  searchPlan: SearchPlan
}

interface NLSearchProps {
  onModeChange?: (isNLMode: boolean) => void
}

async function performNLSearch(query: string): Promise<NLSearchResponse> {
  const res = await fetch("/api/search/nl", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) {
    throw new Error("AI search request failed")
  }

  return res.json()
}

function AnimatedDots() {
  return (
    <span className="inline-flex">
      <span className="animate-bounce [animation-delay:0ms]">.</span>
      <span className="animate-bounce [animation-delay:150ms]">.</span>
      <span className="animate-bounce [animation-delay:300ms]">.</span>
    </span>
  )
}

export function NLSearch({ onModeChange }: NLSearchProps) {
  const [isNLMode, setIsNLMode] = useState(true)
  const [query, setQuery] = useState("")
  const [reasoningOpen, setReasoningOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: performNLSearch,
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
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => handleModeChange(true)}
          className="gap-1.5"
        >
          <Search className="h-3.5 w-3.5" />
          Keyword
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleModeChange(true)}
          className="gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Search
        </Button>
      </div>
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
          placeholder="Ask anything about your reels..."
          className="border-violet-300 focus-visible:ring-violet-500"
          disabled={mutation.isPending}
        />
        <Button
          type="submit"
          disabled={mutation.isPending || !query.trim()}
          className="shrink-0 bg-violet-600 text-white hover:bg-violet-700"
        >
          {mutation.isPending ? (
            <span className="flex items-center gap-1">
              AI is thinking
              <AnimatedDots />
            </span>
          ) : (
            "Search with AI"
          )}
        </Button>
      </form>

      {/* Error State */}
      {mutation.isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            AI search failed. Try keyword search instead.
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {mutation.data && (
        <div className="space-y-4">
          {/* Collapsible Reasoning Panel */}
          <Card>
            <button
              type="button"
              className="flex w-full items-center gap-2 p-4 text-left text-sm font-medium hover:bg-muted/50 transition-colors rounded-lg"
              onClick={() => setReasoningOpen((prev) => !prev)}
            >
              {reasoningOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
              <Sparkles className="h-4 w-4 shrink-0 text-violet-500" />
              AI Reasoning
              <Badge variant="secondary" className="ml-auto text-xs">
                {mutation.data.data.length} result{mutation.data.data.length !== 1 ? "s" : ""}
              </Badge>
            </button>

            {reasoningOpen && (
              <CardContent className="border-t px-4 pb-4 pt-3 space-y-3">
                {/* Reasoning Text */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Reasoning</p>
                  <p className="text-sm">{mutation.data.reasoning}</p>
                </div>

                {/* Search Plan Details */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Search Plan</p>

                  {mutation.data.searchPlan.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground mr-1">Keywords:</span>
                      {mutation.data.searchPlan.keywords.map((kw) => (
                        <Badge key={kw} variant="outline" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {mutation.data.searchPlan.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground mr-1">Tags:</span>
                      {mutation.data.searchPlan.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {mutation.data.searchPlan.semanticQuery && (
                    <div>
                      <span className="text-xs text-muted-foreground">Semantic Query: </span>
                      <span className="text-xs italic">
                        {mutation.data.searchPlan.semanticQuery}
                      </span>
                    </div>
                  )}

                  {mutation.data.searchPlan.reasoning && (
                    <div>
                      <span className="text-xs text-muted-foreground">Plan Reasoning: </span>
                      <span className="text-xs">{mutation.data.searchPlan.reasoning}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Reel Cards Grid */}
          {mutation.data.data.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mutation.data.data.map((reel) => (
                <ReelCard key={reel.id} reel={reel} />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              No reels found for your query. Try rephrasing or use keyword search.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
