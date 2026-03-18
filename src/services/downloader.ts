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

function exec(command: string, args: string[], timeoutMs = 120_000): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(command, args, { timeout: timeoutMs }, (error, stdout, stderr) => {
      if (error) {
        reject(
          new Error(
            `${command} failed: ${error.message}\nstderr: ${stderr}\nstdout: ${stdout}`
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

  // Single yt-dlp call: download video + thumbnail together
  await exec("yt-dlp", [
    "-o", videoPath,
    "--format", "best[ext=mp4]/best",
    "--write-thumbnail",
    "--convert-thumbnails", "jpg",
    url,
  ])

  // Extract audio locally with ffmpeg (much faster than re-downloading)
  await exec("ffmpeg", [
    "-i", videoPath,
    "-vn",
    "-acodec", "libmp3lame",
    "-q:a", "4",
    "-y",
    audioPath,
  ], 30_000)

  // Find the thumbnail file (yt-dlp writes it next to the video)
  const files = await readdir(tempDir)
  const thumbFile = files.find(
    (f) => (f.startsWith("video.") || f.startsWith("thumb.")) && /\.(jpg|jpeg|webp|png)$/i.test(f) && f !== "video.mp4"
  )

  // Upload thumbnail to Supabase Storage (non-fatal)
  let thumbnailUrl = ""
  if (thumbFile) {
    const thumbPath = path.join(tempDir, thumbFile)
    const thumbBuffer = await readFile(thumbPath)
    const thumbExt = path.extname(thumbFile).slice(1)
    const contentType = `image/${thumbExt === "jpg" ? "jpeg" : thumbExt}`

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
  } else {
    console.warn(`[Downloader] No thumbnail found for ${reelId}, continuing without`)
  }

  return { videoPath, audioPath, thumbnailUrl }
}
