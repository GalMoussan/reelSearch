import { Queue } from "bullmq"
import { env } from "./env"

export const reelQueue = new Queue("reel-processing", {
  connection: {
    url: env.REDIS_URL,
    maxRetriesPerRequest: null,
  },
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
})

export async function addReelJob(reelId: string) {
  return reelQueue.add("process-reel", { reelId }, {
    jobId: `reel-${reelId}`,
  })
}
