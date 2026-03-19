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
        collections: {
          where: { collection: { userId: session.user.id } },
          include: {
            collection: { select: { id: true, name: true, color: true } },
          },
        },
      },
    })

    if (!reel) {
      return NextResponse.json(
        { error: "Reel not found" },
        { status: 404 },
      )
    }

    // Record view (fire and forget)
    prisma.reelView
      .upsert({
        where: {
          reelId_userId: {
            reelId: id,
            userId: session.user.id,
          },
        },
        update: { viewedAt: new Date() },
        create: {
          reelId: id,
          userId: session.user.id,
        },
      })
      .catch((err: unknown) => console.error("Failed to record view:", err))

    // Fetch user's note
    const note = await prisma.reelNote.findUnique({
      where: {
        reelId_userId: {
          reelId: id,
          userId: session.user.id,
        },
      },
    })

    return NextResponse.json({
      data: {
        ...reel,
        collections: reel.collections.map((cr: (typeof reel.collections)[number]) => cr.collection),
        note: note?.content ?? null,
      },
    })
  } catch (error) {
    console.error(`GET /api/reels/[id] error:`, error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

export async function DELETE(
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
      select: { addedById: true },
    })

    if (!reel) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (reel.addedById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.reel.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`DELETE /api/reels/[id] error:`, error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
