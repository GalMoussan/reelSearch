import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateCollectionSchema } from "@/lib/validators"

async function getOwnedCollection(id: string, userId: string) {
  const collection = await prisma.collection.findUnique({
    where: { id },
    include: {
      _count: { select: { reels: true } },
      reels: {
        include: {
          reel: {
            include: {
              tags: true,
              addedBy: { select: { id: true, name: true, image: true } },
            },
          },
        },
        orderBy: { addedAt: "desc" },
      },
    },
  })

  if (!collection || collection.userId !== userId) {
    return null
  }

  return collection
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const collection = await getOwnedCollection(id, session.user.id)

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        color: collection.color,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
        reelCount: collection._count.reels,
        reels: collection.reels.map((cr: (typeof collection.reels)[number]) => cr.reel),
      },
    })
  } catch (error) {
    console.error("GET /api/collections/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.collection.findUnique({ where: { id } })

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    const body = await request.json()
    const result = updateCollectionSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      )
    }

    const updated = await prisma.collection.update({
      where: { id },
      data: result.data,
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error("PATCH /api/collections/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.collection.findUnique({ where: { id } })

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    await prisma.collection.delete({ where: { id } })

    return NextResponse.json({ data: { id } })
  } catch (error) {
    console.error("DELETE /api/collections/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
