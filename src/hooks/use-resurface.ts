"use client"

import { useQuery } from "@tanstack/react-query"

interface ResurfaceReel {
  id: string
  url: string
  title: string | null
  summary: string | null
  thumbnailUrl: string | null
  status: string
  createdAt: string
  tags: Array<{ id: string; name: string }>
}

export function useResurface(recentQuery?: string) {
  return useQuery<ResurfaceReel[]>({
    queryKey: ["resurface", recentQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (recentQuery) params.set("recentQuery", recentQuery)

      const res = await fetch(`/api/reels/resurface?${params}`)
      if (!res.ok) throw new Error("Failed to fetch resurface reels")
      const json = await res.json()
      return json.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
