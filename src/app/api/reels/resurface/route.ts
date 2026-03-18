import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { getResurfaceReels } from "@/services/resurface"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const recentQuery = request.nextUrl.searchParams.get("recentQuery") ?? undefined

    const reels = await getResurfaceReels(session.user.id, recentQuery)

    return NextResponse.json({ data: reels })
  } catch (error) {
    console.error("GET /api/reels/resurface error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
