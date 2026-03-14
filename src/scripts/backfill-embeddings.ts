import "dotenv/config"
import { config } from "dotenv"
config({ path: ".env.local", override: true })

import { prisma } from "../lib/prisma"
import { embedAndStore, isEmbeddingEnabled } from "../services/embedder"

const BATCH_SIZE = 10
const DELAY_MS = 1200 // ~50 per minute rate limit

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  if (!isEmbeddingEnabled()) {
    console.error("OPENAI_API_KEY is not set. Cannot backfill embeddings.")
    process.exit(1)
  }

  const reels = await prisma.$queryRaw<Array<{ id: string; title: string | null; summary: string | null; transcript: string | null }>>`
    SELECT id, title, summary, transcript
    FROM "Reel"
    WHERE embedding IS NULL AND status = 'DONE'
    ORDER BY "createdAt" DESC
  `

  console.log(`[Backfill] Found ${reels.length} reels without embeddings`)

  let success = 0
  let failed = 0

  for (let i = 0; i < reels.length; i++) {
    const reel = reels[i]
    const text = [reel.title, reel.summary, reel.transcript?.slice(0, 2000)]
      .filter(Boolean)
      .join("\n")

    if (!text.trim()) {
      console.log(`[Backfill] Skipping ${reel.id} — no text content`)
      continue
    }

    try {
      await embedAndStore(reel.id, text)
      success++
      console.log(`[Backfill] ${i + 1}/${reels.length} — ${reel.id} done`)
    } catch (err) {
      failed++
      console.error(
        `[Backfill] ${i + 1}/${reels.length} — ${reel.id} failed:`,
        err instanceof Error ? err.message : err,
      )
    }

    // Rate limit: pause between batches
    if ((i + 1) % BATCH_SIZE === 0 && i + 1 < reels.length) {
      console.log(`[Backfill] Pausing for rate limit...`)
      await sleep(DELAY_MS)
    }
  }

  console.log(`[Backfill] Complete: ${success} succeeded, ${failed} failed`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error("[Backfill] Fatal error:", err)
  process.exit(1)
})
