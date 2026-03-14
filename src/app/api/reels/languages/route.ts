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

    const results = await prisma.reel.findMany({
      where: { language: { not: null } },
      select: { language: true },
      distinct: ["language"],
      orderBy: { language: "asc" },
    })

    const languages = results
      .map((r) => r.language)
      .filter((l): l is string => l !== null)

    const response = NextResponse.json({ data: languages })
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300",
    )

    return response
  } catch (error) {
    console.error("GET /api/reels/languages error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
