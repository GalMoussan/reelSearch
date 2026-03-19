import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET() {
  const results: Record<string, string> = {}

  // Test Prisma / TCP connection
  try {
    await prisma.$queryRaw`SELECT 1`
    results.prisma = "ok"
  } catch (error) {
    results.prisma = String(error).slice(0, 200)
  }

  // Test Supabase JS / HTTPS connection
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { error } = await supabase.from("User").select("id").limit(1)
    results.supabase = error ? error.message : "ok"
  } catch (error) {
    results.supabase = String(error).slice(0, 200)
  }

  results.region = process.env.VERCEL_REGION ?? "unknown"
  results.dbUrl = (process.env.DATABASE_URL ?? "").replace(/:([^:@]+)@/, ":****@")

  return NextResponse.json(results)
}
