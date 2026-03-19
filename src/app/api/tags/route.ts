import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tags = await prisma.tag.findMany({
      where: { reels: { some: {} } }, // Exclude orphaned tags
      select: {
        id: true,
        name: true,
        _count: { select: { reels: true } },
      },
      orderBy: { reels: { _count: "desc" } },
    })

    const transformedTags = tags.map((tag: (typeof tags)[number]) => ({
      id: tag.id,
      name: tag.name,
      count: tag._count.reels,
    }))

    const response = NextResponse.json({ data: transformedTags })

    // Set cache headers for public tag cloud data
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300",
    )

    return response
  } catch (error) {
    console.error("GET /api/tags error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
