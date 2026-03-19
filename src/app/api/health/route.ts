import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ db: "ok" })
  } catch (error) {
    return NextResponse.json({ db: "error", message: String(error) }, { status: 500 })
  }
}
