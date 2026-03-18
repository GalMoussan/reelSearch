import { NextRequest, NextResponse } from "next/server"

import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { addReelJob } from "@/lib/queue"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth()

    const { allowed } = await rateLimit(`rl:reels-retry:${session.user.id}`, 5, 60)
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 },
      )
    }

    const { id } = await params

    const reel = await prisma.reel.findUnique({ where: { id } })

    if (!reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 })
    }

    if (reel.addedById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (reel.status !== "FAILED") {
      return NextResponse.json(
        { error: "Only failed reels can be retried" },
        { status: 400 },
      )
    }

    const updatedReel = await prisma.reel.update({
      where: { id },
      data: {
        status: "PENDING",
        errorMessage: null,
      },
      include: {
        tags: true,
        addedBy: { select: { id: true, name: true, image: true } },
      },
    })

    await addReelJob(reel.id)

    return NextResponse.json({ data: updatedReel })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("POST /api/reels/[id]/retry error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
