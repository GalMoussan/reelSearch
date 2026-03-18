import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { reelNoteSchema } from "@/lib/validators"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: reelId } = await params

    const note = await prisma.reelNote.findUnique({
      where: {
        reelId_userId: {
          reelId,
          userId: session.user.id,
        },
      },
    })

    return NextResponse.json({ data: note })
  } catch (error) {
    console.error("GET /api/reels/[id]/notes error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: reelId } = await params
    const body = await request.json()
    const result = reelNoteSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      )
    }

    const note = await prisma.reelNote.upsert({
      where: {
        reelId_userId: {
          reelId,
          userId: session.user.id,
        },
      },
      update: { content: result.data.content },
      create: {
        reelId,
        userId: session.user.id,
        content: result.data.content,
      },
    })

    return NextResponse.json({ data: note })
  } catch (error) {
    console.error("PUT /api/reels/[id]/notes error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
