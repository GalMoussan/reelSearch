import { NextRequest, NextResponse } from "next/server"

import { naturalLanguageSearch } from "@/services/nl-search"

export async function POST(request: NextRequest) {
  try {
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
    console.error("POST /api/search/nl error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
