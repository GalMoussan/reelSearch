import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
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
