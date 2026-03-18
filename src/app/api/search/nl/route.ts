import { NextRequest, NextResponse } from "next/server"

import { requireAuth } from "@/lib/auth-utils"
import { rateLimit } from "@/lib/rate-limit"
import { naturalLanguageSearch } from "@/services/nl-search"

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    const { allowed } = await rateLimit(`rl:search-nl:${session.user.id}`, 20, 60)
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 },
      )
    }

    const body = await request.json()

    const { query } = body as { query?: string }

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "query is required and must be a non-empty string" },
        { status: 400 },
      )
    }

    const result = await naturalLanguageSearch(query.trim())

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("POST /api/search/nl error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
