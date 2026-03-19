"use client"

import { useInfiniteQuery } from "@tanstack/react-query"

interface ReelsMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

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
  errorMessage?: string | null
  createdAt: string
  tags: ReelTag[]
  addedBy?: { name: string | null; image: string | null }
}

interface ReelsResponse {
  data: Reel[]
  meta: ReelsMeta
}

export interface UseReelsOptions {
  tags?: string[]
  q?: string
  language?: string
  dateFrom?: string
  dateTo?: string
  status?: string
  collectionId?: string
  initialData?: ReelsResponse
}

export function useReels(options: UseReelsOptions = {}) {
  const { tags, q, language, dateFrom, dateTo, status, collectionId, initialData } = options

  // Only use SSR initialData when no filters are active — otherwise it would
  // seed the filtered query with unfiltered results until the fetch completes
  const hasFilters = Boolean(tags?.length || q || language || dateFrom || dateTo || status || collectionId)

  return useInfiniteQuery<ReelsResponse>({
    queryKey: ["reels", { tags, q, language, dateFrom, dateTo, status, collectionId }],
    ...(initialData && !hasFilters ? {
      initialData: {
        pages: [initialData],
        pageParams: [1],
      },
    } : {}),
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams()
      params.set("page", String(pageParam))
      params.set("limit", "20")
      if (tags?.length) params.set("tags", tags.join(","))
      if (q) params.set("q", q)
      if (language) params.set("language", language)
      if (dateFrom) params.set("dateFrom", dateFrom)
      if (dateTo) params.set("dateTo", dateTo)
      if (status) params.set("status", status)
      if (collectionId) params.set("collectionId", collectionId)

      const res = await fetch(`/api/reels?${params}`)
      if (!res.ok) throw new Error("Failed to fetch reels")
      return res.json()
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta
      return page < totalPages ? page + 1 : undefined
    },
    initialPageParam: 1,
    // Poll every 5s while any reel is still processing so cards update when done
    refetchInterval: (query) => {
      const pages = query.state.data?.pages
      if (!pages) return false
      const hasProcessing = pages.some((page) =>
        page.data.some((r) => r.status === "PENDING" || r.status === "PROCESSING"),
      )
      return hasProcessing ? 5000 : false
    },
  })
}
