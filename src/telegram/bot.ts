import { config } from "dotenv"
config({ path: ".env.local", override: true })

// Dynamic imports ensure modules load AFTER dotenv populates process.env.
// Static imports are hoisted before config() runs, causing Zod to cache
// TELEGRAM_BOT_TOKEN as "" before the .env.local values are available.
async function main() {
  const { Telegraf } = await import("telegraf")
  const { env } = await import("../lib/env")
  const { loadAllowedUsers, getAllowedUserId } = await import("./auth")
  const { handleUrl, handleVideoUpload } = await import("./handlers")
  const { setupNotifications } = await import("./notifications")

  const token = env.TELEGRAM_BOT_TOKEN
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN is required to run the bot")
    process.exit(1)
  }

  loadAllowedUsers()

  const bot = new Telegraf(token)

  // /start command
  bot.start(async (ctx) => {
    const userId = getAllowedUserId(ctx.from.id)
    if (!userId) {
      await ctx.reply(
        `Unauthorized. Your Telegram ID is ${ctx.from.id}. Ask the admin to add you.`
      )
      return
    }

    await ctx.reply(
      "Welcome to ReelSearch!\n\n" +
      "Send me:\n" +
      "- A reel URL (Instagram, Facebook, YouTube, X, Reddit)\n" +
      "- A video file (MP4)\n\n" +
      "I'll process it and add it to your library."
    )
  })

  // Text messages — look for URLs
  bot.on("text", async (ctx) => {
    await handleUrl(ctx, ctx.message.text)
  })

  // Video uploads
  bot.on("video", async (ctx) => {
    await handleVideoUpload(ctx)
  })

  // Document uploads (videos sent as files)
  bot.on("document", async (ctx) => {
    const mimeType = ctx.message.document.mime_type ?? ""
    if (mimeType.startsWith("video/")) {
      await handleVideoUpload(ctx)
    } else {
      await ctx.reply("Please send a video file or a reel URL.")
    }
  })

  // Setup job completion notifications
  const queueEvents = setupNotifications(bot, env.REDIS_URL)

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n[Bot] ${signal} received, shutting down...`)
    bot.stop(signal)
    await queueEvents.close()
    process.exit(0)
  }

  process.on("SIGINT", () => shutdown("SIGINT"))
  process.on("SIGTERM", () => shutdown("SIGTERM"))

  // launch() starts long-polling — does not resolve, so don't await it
  bot.launch()
  console.log("[Bot] ReelSearch Telegram bot is running")
}

main().catch((err) => {
  console.error("[Bot] Fatal error:", err)
  process.exit(1)
})
