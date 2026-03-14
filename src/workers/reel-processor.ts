import "dotenv/config"
import { config } from "dotenv"
config({ path: ".env.local", override: true })

import { Worker, Job } from "bullmq"
import { prisma } from "../lib/prisma"
import { downloadReel } from "../services/downloader"
import { transcribe } from "../services/transcriber"
import { extractFrames } from "../services/frame-sampler"
import { analyzeReel } from "../services/analyzer"
import { normalizeTags } from "../services/tag-normalizer"
import { embedAndStore } from "../services/embedder"
import { cleanupTempFiles } from "../services/cleanup"

const connection = {
  url: process.env.REDIS_URL!,
  maxRetriesPerRequest: null,
}

interface ReelJobData {
  reelId: string
}

async function processReel(job: Job<ReelJobData>) {
  const { reelId } = job.data
  const startTime = Date.now()

  try {
    // 1. Get reel from DB and update to PROCESSING
    const reel = await prisma.reel.update({
      where: { id: reelId },
      data: { status: "PROCESSING" },
    })

    console.log(`[Worker] Processing reel: ${reelId} (${reel.url})`)

    // 2. Download video, audio, thumbnail
    const { videoPath, audioPath } = await downloadReel(reelId, reel.url)
    await job.updateProgress(20)

    // 3. Transcribe audio and extract frames IN PARALLEL
    const [transcription, frames] = await Promise.all([
      transcribe(audioPath),
      extractFrames(videoPath),
    ])
    await job.updateProgress(50)

    // 4. Analyze with Claude Vision
    const analysis = await analyzeReel(frames, transcription.text)
    await job.updateProgress(70)

    // 5. Normalize tags + store metadata, and generate embeddings IN PARALLEL
    await Promise.all([
      normalizeTags(reelId, analysis.tags, {
        title: analysis.title,
        summary: analysis.summary,
        transcript: transcription.text,
        language: analysis.language,
      }),
      embedAndStore(
        reelId,
        [analysis.title, analysis.summary, transcription.text?.slice(0, 2000)]
          .filter(Boolean)
          .join("\n"),
      ),
    ])
    await job.updateProgress(90)

    // 6. Cleanup and mark done
    await cleanupTempFiles(reelId)
    await prisma.reel.update({
      where: { id: reelId },
      data: { status: "DONE" },
    })
    await job.updateProgress(100)

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`[Worker] Reel ${reelId} completed in ${duration}s`)
  } catch (error) {
    // Mark reel as FAILED with error message
    const errorMessage =
      error instanceof Error ? error.message : String(error)
    console.error(`[Worker] Reel ${reelId} failed:`, errorMessage)

    await prisma.reel
      .update({
        where: { id: reelId },
        data: {
          status: "FAILED",
          errorMessage,
        },
      })
      .catch((dbErr) => {
        console.error(`[Worker] Failed to update reel status:`, dbErr)
      })

    // Cleanup temp files even on failure
    await cleanupTempFiles(reelId)

    throw error // Re-throw so BullMQ handles retries
  }
}

const worker = new Worker("reel-processing", processReel, {
  connection,
  concurrency: 2,
})

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed for reel: ${job.data.reelId}`)
})

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message)
})

worker.on("error", (err) => {
  console.error("[Worker] Error:", err.message)
})

async function shutdown() {
  console.log("[Worker] Shutting down...")
  await worker.close()
  process.exit(0)
}

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)

console.log("[Worker] Started, waiting for jobs...")
