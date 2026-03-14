import { execFile } from "child_process"
import { mkdir, readFile, readdir } from "fs/promises"
import path from "path"
import { prisma } from "@/lib/prisma"
import { uploadFile } from "@/lib/supabase"

export type DownloadResult = {
  videoPath: string
  audioPath: string
  thumbnailUrl: string
}

const TEMP_BASE = "/tmp/reelsearch"

function exec(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(command, args, { timeout: 120_000 }, (error, stdout, stderr) => {
      if (error) {
        reject(
          new Error(
            `yt-dlp failed: ${error.message}\nstderr: ${stderr}\nstdout: ${stdout}`
          )
        )
        return
      }
      resolve(stdout)
    })
  })
}

export async function downloadReel(
  reelId: string,
  url: string
): Promise<DownloadResult> {
  const tempDir = path.join(TEMP_BASE, reelId)
  await mkdir(tempDir, { recursive: true })

  const videoPath = path.join(tempDir, "video.mp4")
  const audioPath = path.join(tempDir, "audio.mp3")
  const thumbBase = path.join(tempDir, "thumb")

  // Download video
  await exec("yt-dlp", [
    "-o",
    videoPath,
    "--format",
    "best[ext=mp4]",
    url,
  ])

  // Download audio
  await exec("yt-dlp", [
    "-o",
    audioPath,
    "--extract-audio",
    "--audio-format",
    "mp3",
    url,
  ])

  // Download thumbnail
  await exec("yt-dlp", [
    "--write-thumbnail",
    "--skip-download",
    "-o",
    thumbBase,
    url,
  ])

  // Find the thumbnail file (yt-dlp may produce .jpg, .webp, .png, etc.)
  const files = await readdir(tempDir)
  const thumbFile = files.find(
    (f) => f.startsWith("thumb.") && f !== "thumb"
  )

  if (!thumbFile) {
    throw new Error(`Thumbnail not found in ${tempDir} after yt-dlp download`)
  }

  const thumbPath = path.join(tempDir, thumbFile)
  const thumbBuffer = await readFile(thumbPath)
  const thumbExt = path.extname(thumbFile).slice(1)
  const contentType = `image/${thumbExt === "jpg" ? "jpeg" : thumbExt}`

  // Upload thumbnail to Supabase Storage (non-fatal)
  let thumbnailUrl = ""
  try {
    thumbnailUrl = await uploadFile(
      "thumbnails",
      `${reelId}/thumb.${thumbExt}`,
      thumbBuffer,
      contentType
    )

    await prisma.reel.update({
      where: { id: reelId },
      data: { thumbnailUrl },
    })
  } catch (err) {
    console.warn(`[Downloader] Thumbnail upload failed for ${reelId}, continuing:`, err instanceof Error ? err.message : err)
  }

  return { videoPath, audioPath, thumbnailUrl }
}
