"use client"

import { useQuery } from "@tanstack/react-query"

export function useLanguages() {
  return useQuery<string[]>({
    queryKey: ["languages"],
    queryFn: async () => {
      const res = await fetch("/api/reels/languages")
      if (!res.ok) throw new Error("Failed to fetch languages")
      const json = await res.json()
      return json.data
    },
    staleTime: 60_000,
  })
}
