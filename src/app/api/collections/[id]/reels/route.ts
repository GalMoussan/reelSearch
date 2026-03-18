import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { addReelToCollectionSchema } from "@/lib/validators"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: collectionId } = await params

    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    })

    if (!collection || collection.userId !== session.user.id) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    const body = await request.json()
    const result = addReelToCollectionSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      )
    }

    // Idempotent upsert
    const collectionReel = await prisma.collectionReel.upsert({
      where: {
        collectionId_reelId: {
          collectionId,
          reelId: result.data.reelId,
        },
      },
      update: {},
      create: {
        collectionId,
        reelId: result.data.reelId,
      },
    })

    return NextResponse.json({ data: collectionReel }, { status: 201 })
  } catch (error) {
    console.error("POST /api/collections/[id]/reels error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: collectionId } = await params

    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    })

    if (!collection || collection.userId !== session.user.id) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    const { searchParams } = request.nextUrl
    const reelId = searchParams.get("reelId")

    if (!reelId) {
      return NextResponse.json({ error: "reelId is required" }, { status: 400 })
    }

    await prisma.collectionReel.deleteMany({
      where: { collectionId, reelId },
    })

    return NextResponse.json({ data: { collectionId, reelId } })
  } catch (error) {
    console.error("DELETE /api/collections/[id]/reels error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
