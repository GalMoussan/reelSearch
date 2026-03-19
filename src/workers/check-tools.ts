import { execText } from "../lib/exec"

const MAX_AGE_DAYS = 90

/**
 * Parse yt-dlp version string (YYYY.MM.DD or YYYY.MM.DD.N) into a Date.
 * Returns null for unparseable input.
 */
export function parseYtdlpDate(version: string): Date | null {
  const match = version.match(/^(\d{4})\.(\d{2})\.(\d{2})/)
  if (!match) return null
  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (isNaN(date.getTime())) return null
  return date
}

export async function checkToolVersions(): Promise<void> {
  // yt-dlp
  try {
    const ytdlpVersion = await execText("yt-dlp", ["--version"], 10_000)
    const releaseDate = parseYtdlpDate(ytdlpVersion)
    if (releaseDate) {
      const ageDays = Math.floor(
        (Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24),
      )
      if (ageDays > MAX_AGE_DAYS) {
        console.warn(
          `[Worker] yt-dlp ${ytdlpVersion} is ${ageDays} days old (>${MAX_AGE_DAYS}). Run: pip install -U yt-dlp`,
        )
      } else {
        console.log(`[Worker] yt-dlp ${ytdlpVersion} (${ageDays}d old)`)
      }
    } else {
      console.log(`[Worker] yt-dlp version: ${ytdlpVersion}`)
    }
  } catch {
    console.warn("[Worker] yt-dlp not found — video downloads will fail")
  }

  // ffmpeg
  try {
    const ffmpegOut = await execText("ffmpeg", ["-version"], 10_000)
    const firstLine = ffmpegOut.split("\n")[0]
    console.log(`[Worker] ${firstLine}`)
  } catch {
    console.warn("[Worker] ffmpeg not found — frame extraction will fail")
  }
}
