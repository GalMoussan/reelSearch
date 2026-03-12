import { rm } from "fs/promises"
import { join } from "path"
import { prisma } from "../lib/prisma"

const TEMP_DIR = "/tmp/reelsearch"

export async function cleanupTempFiles(reelId: string): Promise<void> {
  const dir = join(TEMP_DIR, reelId)
  try {
    await rm(dir, { recursive: true, force: true })
    console.log(`[Cleanup] Removed temp files for reel: ${reelId}`)
  } catch (error) {
    console.warn(`[Cleanup] Failed to remove temp files for reel ${reelId}:`, error)
  }
}

export async function markReelDone(reelId: string): Promise<void> {
  await prisma.reel.update({
    where: { id: reelId },
    data: { status: "DONE" },
  })
}
