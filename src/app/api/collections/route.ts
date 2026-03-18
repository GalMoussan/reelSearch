import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createCollectionSchema } from "@/lib/validators"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const collections = await prisma.collection.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { reels: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const data = collections.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      color: c.color,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      reelCount: c._count.reels,
    }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error("GET /api/collections error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const result = createCollectionSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      )
    }

    const collection = await prisma.collection.create({
      data: {
        ...result.data,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ data: collection }, { status: 201 })
  } catch (error) {
    console.error("POST /api/collections error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
