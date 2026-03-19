import { NextRequest, NextResponse } from "next/server"

import { requireAuth } from "@/lib/auth-utils"
import { rateLimit } from "@/lib/rate-limit"
import { semanticSearchSchema } from "@/lib/validators"
import { semanticSearch } from "@/services/search"

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    const { allowed } = await rateLimit(`rl:search-semantic:${session.user.id}`, 30, 60)
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 },
      )
    }

    const body = await request.json()

    const parsed = semanticSearchSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join("; ")
      return NextResponse.json(
        { error: message },
        { status: 400 },
      )
    }

    const { query, limit } = parsed.data

    const results = await semanticSearch(query, {
      limit,
    })

    return NextResponse.json({ data: results })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("POST /api/search/semantic error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
