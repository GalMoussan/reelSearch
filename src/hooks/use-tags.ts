"use client"

import { useQuery } from "@tanstack/react-query"

export interface Tag {
  id: string
  name: string
  count: number
}

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await fetch("/api/tags")
      if (!res.ok) throw new Error("Failed to fetch tags")
      const json = await res.json()
      return json.data as Tag[]
    },
  })
}
