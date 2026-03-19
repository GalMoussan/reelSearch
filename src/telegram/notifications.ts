import { QueueEvents } from "bullmq"
import type { Telegraf } from "telegraf"
import { prisma } from "../lib/prisma"

// Maps reelId → chatId for routing notifications
const pendingNotifications = new Map<string, number>()

export function trackPendingNotification(reelId: string, chatId: number): void {
  pendingNotifications.set(reelId, chatId)
}

export function setupNotifications(bot: Telegraf, redisUrl: string): QueueEvents {
  const queueEvents = new QueueEvents("reel-processing", {
    connection: { url: redisUrl, maxRetriesPerRequest: null },
  })

  queueEvents.on("completed", async ({ jobId }) => {
    const reelId = jobId?.replace("reel-", "")
    if (!reelId) return

    const chatId = pendingNotifications.get(reelId)
    if (!chatId) return
    pendingNotifications.delete(reelId)

    try {
      const reel = await prisma.reel.findUnique({
        where: { id: reelId },
        include: { tags: true },
      })

      if (!reel) return

      const title = reel.title ?? "Untitled"
      const summary = reel.summary ?? "No description available."
      const tags = reel.tags.map((t) => `#${t.name}`).join(" ")
      const message = [`*${title}*`, summary, tags].filter(Boolean).join("\n\n")
      await bot.telegram.sendMessage(chatId, message, { parse_mode: "Markdown" })
    } catch (err) {
      console.error(`[Notifications] Failed to send completion for ${reelId}:`, err)
    }
  })

  queueEvents.on("failed", async ({ jobId, failedReason }) => {
    const reelId = jobId?.replace("reel-", "")
    if (!reelId) return

    const chatId = pendingNotifications.get(reelId)
    if (!chatId) return
    pendingNotifications.delete(reelId)

    try {
      await bot.telegram.sendMessage(
        chatId,
        `Failed: ${failedReason || "unknown error"}`
      )
    } catch (err) {
      console.error(`[Notifications] Failed to send failure for ${reelId}:`, err)
    }
  })

  console.log("[Notifications] Listening for job events")
  return queueEvents
}
