import { NextRequest, NextResponse } from "next/server"

import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { addReelJob } from "@/lib/queue"
import { reelUrlsSchema } from "@/lib/validators"

interface BulkResult {
  submitted: Array<{ id: string; url: string }>
  duplicates: Array<{ id: string; url: string }>
  errors: string[]
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    const body = await request.json()
    const parsed = reelUrlsSchema.safeParse(body.urls)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid URLs" },
        { status: 400 },
      )
    }

    const urls = parsed.data
    const result: BulkResult = { submitted: [], duplicates: [], errors: [] }

    for (const url of urls) {
      try {
        const existing = await prisma.reel.findUnique({ where: { url } })
        if (existing) {
          result.duplicates.push({ id: existing.id, url })
          continue
        }

        const reel = await prisma.reel.create({
          data: { url, status: "PENDING", addedById: userId },
        })

        await addReelJob(reel.id)
        result.submitted.push({ id: reel.id, url })
      } catch (err) {
        result.errors.push(
          `${url}: ${err instanceof Error ? err.message : "Unknown error"}`,
        )
      }
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("POST /api/reels/bulk error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
