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

  return useInfiniteQuery<ReelsResponse>({
    queryKey: ["reels", { tags, q, language, dateFrom, dateTo, status, collectionId }],
    ...(initialData ? {
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
  })
}
