import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { Prisma } from "@prisma/client"

import { authOptions } from "@/lib/auth"
import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { addReelJob } from "@/lib/queue"
import { reelUrlSchema } from "@/lib/validators"
import { fullTextSearch, semanticSearch } from "@/services/search"
import { isEmbeddingEnabled } from "@/services/embedder"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = request.nextUrl

    const pageParam = searchParams.get("page") ?? "1"
    const limitParam = searchParams.get("limit") ?? "20"
    const tagsParam = searchParams.get("tags")
    const q = searchParams.get("q")
    const language = searchParams.get("language")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const status = searchParams.get("status")
    const collectionId = searchParams.get("collectionId")

    const page = parseInt(pageParam, 10)
    const limit = parseInt(limitParam, 10)

    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: "page must be an integer >= 1" },
        { status: 400 },
      )
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "limit must be an integer between 1 and 100" },
        { status: 400 },
      )
    }

    const conditions: Prisma.ReelWhereInput[] = []

    if (tagsParam) {
      const tagsArray = tagsParam
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      if (tagsArray.length > 0) {
        // AND logic: reel must have ALL selected tags
        for (const tag of tagsArray) {
          conditions.push({
            tags: { some: { name: tag } },
          })
        }
      }
    }

    if (language) {
      conditions.push({ language: { equals: language, mode: "insensitive" } })
    }

    if (dateFrom) {
      const from = new Date(dateFrom)
      if (!isNaN(from.getTime())) {
        conditions.push({ createdAt: { gte: from } })
      }
    }

    if (dateTo) {
      const to = new Date(dateTo)
      if (!isNaN(to.getTime())) {
        conditions.push({ createdAt: { lte: to } })
      }
    }

    if (status) {
      conditions.push({ status: status as "PENDING" | "PROCESSING" | "DONE" | "FAILED" })
    }

    if (collectionId) {
      conditions.push({
        collections: { some: { collectionId } },
      })
    }

    // Hybrid search: FTS + semantic when q is provided
    let rankedIds: string[] | null = null

    if (q) {
      // Run FTS (always) and semantic search (if embeddings enabled) in parallel
      const searchPromises: [
        Promise<Array<{ id: string }>>,
        Promise<Array<{ id: string }>> | null,
      ] = [
        fullTextSearch(q, { limit: 100 }),
        isEmbeddingEnabled()
          ? semanticSearch(q, { limit: 50, threshold: 0.25 }).catch(() => [])
          : null,
      ]

      const [ftsResults, semanticResults] = await Promise.all([
        searchPromises[0],
        searchPromises[1] ?? Promise.resolve([]),
      ])

      if (ftsResults.length > 0 || semanticResults.length > 0) {
        // Reciprocal Rank Fusion (RRF) to merge FTS and semantic results
        const K = 60
        const scores = new Map<string, number>()

        ftsResults.forEach((r, rank) => {
          scores.set(r.id, (scores.get(r.id) ?? 0) + 1 / (K + rank))
        })
        semanticResults.forEach((r, rank) => {
          scores.set(r.id, (scores.get(r.id) ?? 0) + 1 / (K + rank))
        })

        rankedIds = [...scores.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([id]) => id)

        conditions.push({ id: { in: rankedIds } })
      } else {
        // Both returned nothing — fall back to ILIKE
        conditions.push({
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
            { transcript: { contains: q, mode: "insensitive" } },
          ],
        })
      }
    }

    const where: Prisma.ReelWhereInput =
      conditions.length > 0 ? { AND: conditions } : {}

    const skip = (page - 1) * limit

    if (rankedIds) {
      // When hybrid search is active, paginate the ranked IDs first,
      // then fetch only that page's IDs from Prisma (preserving rank order)
      const total = rankedIds.length
      const pageIds = rankedIds.slice(skip, skip + limit)

      const reels = pageIds.length > 0
        ? await prisma.reel.findMany({
            where: { ...where, id: { in: pageIds } },
            include: {
              tags: true,
              addedBy: { select: { id: true, name: true, image: true } },
            },
          })
        : []

      // Re-sort to match the RRF rank order
      const idOrder = new Map(pageIds.map((id, idx) => [id, idx]))
      const sortedReels = reels.sort(
        (a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0),
      )

      const totalPages = Math.ceil(total / limit)
      return NextResponse.json({
        data: sortedReels,
        meta: { page, limit, total, totalPages },
      })
    }

    const [reels, total] = await Promise.all([
      prisma.reel.findMany({
        where,
        include: {
          tags: true,
          addedBy: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.reel.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: reels,
      meta: { page, limit, total, totalPages },
    })
  } catch (error) {
    console.error("GET /api/reels error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    const body = await request.json()
    const result = reelUrlSchema.safeParse(body.url)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Invalid URL" },
        { status: 400 },
      )
    }

    const url = result.data

    // Check for duplicate
    const existing = await prisma.reel.findUnique({ where: { url } })
    if (existing) {
      return NextResponse.json({ reel: existing }, { status: 200 })
    }

    const reel = await prisma.reel.create({
      data: {
        url,
        status: "PENDING",
        addedById: userId,
      },
    })

    await addReelJob(reel.id)

    return NextResponse.json({ reel }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("POST /api/reels error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
