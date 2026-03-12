import { NextRequest, NextResponse } from "next/server"

import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { addReelJob } from "@/lib/queue"
import { reelUrlSchema } from "@/lib/validators"

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
