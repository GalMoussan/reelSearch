import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import type { Context } from "telegraf"
import type { Message } from "telegraf/types"
import { execText } from "../lib/exec"
import { prisma } from "../lib/prisma"
import { addReelJob } from "../lib/queue"
import { isValidReelUrl } from "../lib/validators"
import { getAllowedUserId } from "./auth"
import { trackPendingNotification } from "./notifications"

const TEMP_BASE = "/tmp/reelsearch"
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

// Extract the first URL from a text message
function extractUrl(text: string): string | null {
  const urlRegex = /https?:\/\/[^\s]+/i
  const match = text.match(urlRegex)
  return match ? match[0] : null
}

export async function handleUrl(ctx: Context, text: string): Promise<void> {
  const userId = getAllowedUserId(ctx.from!.id)
  if (!userId) {
    await ctx.reply("Unauthorized. Your Telegram ID is not in the allowlist.")
    return
  }

  const url = extractUrl(text)
  if (!url) {
    await ctx.reply("No URL found in your message.")
    return
  }

  if (!isValidReelUrl(url)) {
    await ctx.reply(
      "Unsupported URL. Send a link from Instagram, Facebook, YouTube, X, or Reddit."
    )
    return
  }

  // Check for duplicate
  const existing = await prisma.reel.findUnique({ where: { url } })
  if (existing) {
    const status = existing.status === "DONE" ? "already processed" : `status: ${existing.status}`
    await ctx.reply(`This URL is already in your library (${status}).`)
    return
  }

  const reel = await prisma.reel.create({
    data: {
      url,
      status: "PENDING",
      addedById: userId,
    },
  })

  await addReelJob(reel.id)
  trackPendingNotification(reel.id, ctx.chat!.id)
  await ctx.reply(`Queued for processing.`)
}

export async function handleVideoUpload(ctx: Context): Promise<void> {
  const userId = getAllowedUserId(ctx.from!.id)
  if (!userId) {
    await ctx.reply("Unauthorized. Your Telegram ID is not in the allowlist.")
    return
  }

  const message = ctx.message as Message.VideoMessage | Message.DocumentMessage

  // Get file info from video or document
  const file = "video" in message
    ? message.video
    : "document" in message
      ? message.document
      : null

  if (!file) {
    await ctx.reply("Could not read the uploaded file.")
    return
  }

  // Validate file type for documents
  if ("document" in message && message.document) {
    const mimeType = message.document.mime_type ?? ""
    if (!mimeType.startsWith("video/")) {
      await ctx.reply("Please send a video file (MP4).")
      return
    }
  }

  // Validate file size
  if (file.file_size && file.file_size > MAX_FILE_SIZE) {
    await ctx.reply(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.`)
    return
  }

  await ctx.reply("Downloading your video...")

  // Generate a unique ID for this reel
  const reel = await prisma.reel.create({
    data: {
      url: `telegram://upload/${Date.now()}`,
      status: "PENDING",
      addedById: userId,
    },
  })

  // Update URL with actual reel ID for uniqueness
  await prisma.reel.update({
    where: { id: reel.id },
    data: { url: `telegram://upload/${reel.id}` },
  })

  const tempDir = path.join(TEMP_BASE, reel.id)
  await mkdir(tempDir, { recursive: true })

  const videoPath = path.join(tempDir, "video.mp4")
  const audioPath = path.join(tempDir, "audio.mp3")

  try {
    // Download file from Telegram
    const fileLink = await ctx.telegram.getFileLink(file.file_id)
    const response = await fetch(fileLink.href)

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    await writeFile(videoPath, buffer)

    // Extract audio with ffmpeg
    await execText("ffmpeg", [
      "-i", videoPath,
      "-vn",
      "-acodec", "libmp3lame",
      "-q:a", "4",
      "-y",
      audioPath,
    ], 30_000)

    // Verify files exist
    if (!existsSync(videoPath) || !existsSync(audioPath)) {
      throw new Error("Failed to stage video/audio files")
    }

    await addReelJob(reel.id)
    trackPendingNotification(reel.id, ctx.chat!.id)
    await ctx.reply("Processing your upload...")
  } catch (error) {
    // Clean up on failure
    await prisma.reel.update({
      where: { id: reel.id },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Upload processing failed",
      },
    })
    await ctx.reply(
      `Failed to process upload: ${error instanceof Error ? error.message : "unknown error"}`
    )
  }
}
