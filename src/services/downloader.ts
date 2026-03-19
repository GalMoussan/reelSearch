import { existsSync } from "fs"
import { mkdir, readFile, readdir } from "fs/promises"
import path from "path"
import { execText } from "@/lib/exec"
import { prisma } from "@/lib/prisma"
import { uploadFile } from "@/lib/supabase"

export type DownloadResult = {
  videoPath: string
  audioPath: string | null
  thumbnailUrl: string
}

const TEMP_BASE = "/tmp/reelsearch"

export async function downloadReel(
  reelId: string,
  url: string
): Promise<DownloadResult> {
  const tempDir = path.join(TEMP_BASE, reelId)
  await mkdir(tempDir, { recursive: true })

  const videoPath = path.join(tempDir, "video.mp4")
  const audioPath = path.join(tempDir, "audio.mp3")
  const thumbBase = path.join(tempDir, "thumb")

  // Skip download if files are pre-staged (e.g. Telegram upload)
  if (existsSync(videoPath) && existsSync(audioPath)) {
    console.log(`[Downloader] Files pre-staged for ${reelId}, skipping yt-dlp`)
    return { videoPath, audioPath, thumbnailUrl: "" }
  }


  // Single yt-dlp call: download video + thumbnail together
  // Use bestvideo+bestaudio with mp4 merge for sites that only offer DASH/HLS (Reddit, X)
  await execText("yt-dlp", [
    "-o", videoPath,
    "--format", "best[ext=mp4]/bestvideo+bestaudio/best",
    "--merge-output-format", "mp4",
    "--write-thumbnail",
    "--no-playlist",
    url,
  ])

  // Check if the video has an audio stream before extracting
  let resolvedAudioPath: string | null = null
  const probeOutput = await execText("ffprobe", [
    "-v", "error",
    "-select_streams", "a",
    "-show_entries", "stream=codec_type",
    "-of", "csv=p=0",
    videoPath,
  ]).catch(() => "")

  if (probeOutput.trim()) {
    // Video has audio — extract it
    await execText("ffmpeg", [
      "-i", videoPath,
      "-vn",
      "-acodec", "libmp3lame",
      "-q:a", "4",
      "-y",
      audioPath,
    ], 30_000)
    resolvedAudioPath = audioPath
  } else {
    console.log(`[Downloader] No audio stream found for ${reelId}, skipping audio extraction`)
  }

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

  return { videoPath, audioPath: resolvedAudioPath, thumbnailUrl }
}
