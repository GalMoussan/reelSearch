import { NextRequest, NextResponse } from "next/server"

import { semanticSearch } from "@/services/search"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { query, limit } = body as { query?: string; limit?: number }

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "query is required and must be a non-empty string" },
        { status: 400 },
      )
    }

    if (limit !== undefined) {
      if (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1 || limit > 50) {
        return NextResponse.json(
          { error: "limit must be an integer between 1 and 50" },
          { status: 400 },
        )
      }
    }

    const results = await semanticSearch(query.trim(), {
      limit: limit ?? 10,
    })

    return NextResponse.json({ data: results })
  } catch (error) {
    console.error("POST /api/search/semantic error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
