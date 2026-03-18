import { prisma } from "@/lib/prisma"
import { isEmbeddingEnabled } from "@/services/embedder"
import { semanticSearch } from "@/services/search"

const MAX_RESULTS = 5
const RECENT_DAYS = 30

interface ResurfaceResult {
  id: string
  url: string
  title: string | null
  summary: string | null
  thumbnailUrl: string | null
  status: string
  createdAt: Date
  tags: Array<{ id: string; name: string }>
}

export async function getResurfaceReels(
  userId: string,
  recentQuery?: string,
): Promise<ResurfaceResult[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - RECENT_DAYS)

  // Find reel IDs viewed by user in last 30 days
  const recentViews = await prisma.reelView.findMany({
    where: {
      userId,
      viewedAt: { gte: cutoff },
    },
    select: { reelId: true },
  })

  const recentlyViewedIds = new Set(recentViews.map((v) => v.reelId))

  // If we have a query and embeddings, use semantic search for ranking
  if (recentQuery && isEmbeddingEnabled()) {
    try {
      const semanticResults = await semanticSearch(recentQuery, {
        limit: 50,
        threshold: 0.25,
      })

      const candidates = semanticResults.filter(
        (r) => !recentlyViewedIds.has(r.id),
      )

      const topIds = candidates.slice(0, MAX_RESULTS).map((r) => r.id)

      if (topIds.length > 0) {
        const reels = await prisma.reel.findMany({
          where: {
            id: { in: topIds },
            status: "DONE",
          },
          include: { tags: true },
        })

        // Preserve semantic ranking order
        return topIds
          .map((id) => reels.find((r) => r.id === id))
          .filter((r): r is NonNullable<typeof r> => r != null)
      }
    } catch {
      // Fall through to default logic
    }
  }

  // Default: oldest unseen DONE reels
  const reels = await prisma.reel.findMany({
    where: {
      status: "DONE",
      ...(recentlyViewedIds.size > 0
        ? { id: { notIn: [...recentlyViewedIds] } }
        : {}),
    },
    include: { tags: true },
    orderBy: { createdAt: "asc" },
    take: MAX_RESULTS,
  })

  return reels
}
