import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { addReelJob } from "@/lib/queue"
import { reelUrlSchema } from "@/lib/validators"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const pageParam = searchParams.get("page") ?? "1"
    const limitParam = searchParams.get("limit") ?? "20"
    const tagsParam = searchParams.get("tags")
    const q = searchParams.get("q")

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
        conditions.push({
          tags: { some: { name: { in: tagsArray } } },
        })
      }
    }

    if (q) {
      conditions.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { summary: { contains: q, mode: "insensitive" } },
        ],
      })
    }

    const where: Prisma.ReelWhereInput =
      conditions.length > 0 ? { AND: conditions } : {}

    const skip = (page - 1) * limit

    const [reels, total] = await Promise.all([
      prisma.reel.findMany({
        where,
        include: { tags: true },
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
