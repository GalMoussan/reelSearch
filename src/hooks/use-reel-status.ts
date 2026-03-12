"use client"
import { useQuery } from "@tanstack/react-query"

export function useReelStatus(reelId: string | null) {
  return useQuery({
    queryKey: ["reel-status", reelId],
    queryFn: async () => {
      const res = await fetch(`/api/reels/${reelId}`)
      if (!res.ok) throw new Error("Failed to fetch reel status")
      const json = await res.json()
      return json.data
    },
    enabled: !!reelId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === "DONE" || status === "FAILED") return false
      return 2000 // Poll every 2 seconds
    },
  })
}
