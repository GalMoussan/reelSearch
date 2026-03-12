import { Worker, Job } from "bullmq"

const connection = {
  url: process.env.REDIS_URL!,
  maxRetriesPerRequest: null,
}

interface ReelJobData {
  reelId: string
}

async function processReel(job: Job<ReelJobData>) {
  const { reelId } = job.data
  console.log(`[Worker] Processing reel: ${reelId}`)

  // Pipeline steps will be implemented in Phase 2:
  // 1. Download video (T009)
  // 2. Extract audio (T009)
  // 3. Transcribe (T010)
  // 4. Extract frames (T011)
  // 5. Analyze with Claude Vision (T012)
  // 6. Normalize tags (T013)
  // 7. Generate embeddings (T014)
  // 8. Cleanup temp files (T015)

  console.log(`[Worker] Reel ${reelId} processed (placeholder)`)
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

// Graceful shutdown
async function shutdown() {
  console.log("[Worker] Shutting down...")
  await worker.close()
  process.exit(0)
}

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)

console.log("[Worker] Started, waiting for jobs...")
