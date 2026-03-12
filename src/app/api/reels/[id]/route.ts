import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const reel = await prisma.reel.findUnique({
      where: { id },
      include: {
        tags: true,
        addedBy: {
          select: { id: true, name: true, image: true },
        },
      },
    })

    if (!reel) {
      return NextResponse.json(
        { error: "Reel not found" },
        { status: 404 },
      )
    }

    return NextResponse.json({ data: reel })
  } catch (error) {
    console.error(`GET /api/reels/[id] error:`, error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
