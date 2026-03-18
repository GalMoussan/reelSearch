"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface Collection {
  id: string
  name: string
  description: string | null
  color: string | null
  createdAt: string
  updatedAt: string
  reelCount: number
}

interface CollectionWithReels extends Omit<Collection, "reelCount"> {
  reelCount: number
  reels: Array<{
    id: string
    title: string | null
    summary: string | null
    thumbnailUrl: string | null
    status: string
    createdAt: string
    tags: Array<{ id: string; name: string }>
    addedBy?: { name: string | null; image: string | null }
  }>
}

export function useCollections() {
  return useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      const res = await fetch("/api/collections")
      if (!res.ok) throw new Error("Failed to fetch collections")
      const json = await res.json()
      return json.data
    },
    staleTime: 30_000,
  })
}

export function useCollection(id: string | null) {
  return useQuery<CollectionWithReels>({
    queryKey: ["collection", id],
    queryFn: async () => {
      const res = await fetch(`/api/collections/${id}`)
      if (!res.ok) throw new Error("Failed to fetch collection")
      const json = await res.json()
      return json.data
    },
    enabled: !!id,
  })
}

export function useCreateCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; description?: string; color?: string }) => {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Failed to create collection")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] })
    },
  })
}

export function useUpdateCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: string; name?: string; description?: string | null; color?: string | null }) => {
      const res = await fetch(`/api/collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Failed to update collection")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] })
    },
  })
}

export function useDeleteCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/collections/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Failed to delete collection")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] })
      queryClient.invalidateQueries({ queryKey: ["reels"] })
    },
  })
}

export function useAddReelToCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ collectionId, reelId }: { collectionId: string; reelId: string }) => {
      const res = await fetch(`/api/collections/${collectionId}/reels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reelId }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Failed to add reel to collection")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] })
      queryClient.invalidateQueries({ queryKey: ["collection"] })
      queryClient.invalidateQueries({ queryKey: ["reel-collections"] })
    },
  })
}

export function useRemoveReelFromCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ collectionId, reelId }: { collectionId: string; reelId: string }) => {
      const res = await fetch(`/api/collections/${collectionId}/reels?reelId=${reelId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Failed to remove reel from collection")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] })
      queryClient.invalidateQueries({ queryKey: ["collection"] })
      queryClient.invalidateQueries({ queryKey: ["reel-collections"] })
    },
  })
}

export function useReelCollections(reelId: string | null) {
  return useQuery<string[]>({
    queryKey: ["reel-collections", reelId],
    queryFn: async () => {
      const res = await fetch("/api/collections")
      if (!res.ok) throw new Error("Failed to fetch collections")
      const json = await res.json()
      const collections: Collection[] = json.data

      // Fetch which collections contain this reel
      const checks = await Promise.all(
        collections.map(async (c) => {
          const res = await fetch(`/api/collections/${c.id}`)
          if (!res.ok) return null
          const detail = await res.json()
          const hasReel = detail.data.reels.some((r: { id: string }) => r.id === reelId)
          return hasReel ? c.id : null
        }),
      )

      return checks.filter((id): id is string => id !== null)
    },
    enabled: !!reelId,
    staleTime: 10_000,
  })
}
