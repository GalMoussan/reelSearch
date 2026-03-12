import { execFile } from "child_process"

type ExecResult = {
  stdout: Buffer
  stderr: string
}

function execBuffer(
  command: string,
  args: string[],
  timeoutMs = 30_000
): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    const proc = execFile(
      command,
      args,
      { timeout: timeoutMs, encoding: "buffer", maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new Error(
              `${command} failed: ${error.message}\nstderr: ${stderr?.toString() ?? ""}`
            )
          )
          return
        }
        resolve({
          stdout: stdout as Buffer,
          stderr: stderr?.toString() ?? "",
        })
      }
    )
  })
}

function execText(
  command: string,
  args: string[],
  timeoutMs = 15_000
): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      command,
      args,
      { timeout: timeoutMs },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new Error(
              `${command} failed: ${error.message}\nstderr: ${stderr}`
            )
          )
          return
        }
        resolve(stdout.trim())
      }
    )
  })
}

async function getVideoDuration(videoPath: string): Promise<number> {
  const output = await execText("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    videoPath,
  ])

  const duration = parseFloat(output)

  if (isNaN(duration) || duration <= 0) {
    throw new Error(
      `ffprobe returned invalid duration "${output}" for ${videoPath}`
    )
  }

  return duration
}

function calculateTimestamps(duration: number, count: number): number[] {
  if (count <= 0) {
    return []
  }

  if (count === 1) {
    return [duration / 2]
  }

  // Evenly space frames within the video, avoiding the very start and end
  // For 5 frames in 30s: segment = 30/5 = 6, timestamps = 3, 9, 15, 21, 27
  const segment = duration / count
  const timestamps: number[] = []

  for (let i = 0; i < count; i++) {
    timestamps.push(segment * i + segment / 2)
  }

  return timestamps
}

function determineFrameCount(duration: number, requestedCount: number): number {
  if (duration < 1) {
    return 1
  }

  if (duration < 5) {
    // For short videos, scale proportionally: 1 frame per second, minimum 1
    return Math.max(1, Math.floor(duration))
  }

  return requestedCount
}

async function extractFrameAtTimestamp(
  videoPath: string,
  timestamp: number
): Promise<string> {
  const { stdout } = await execBuffer("ffmpeg", [
    "-ss",
    timestamp.toFixed(3),
    "-i",
    videoPath,
    "-frames:v",
    "1",
    "-f",
    "image2pipe",
    "-vcodec",
    "mjpeg",
    "-",
  ])

  if (stdout.length === 0) {
    throw new Error(
      `ffmpeg produced empty output for frame at ${timestamp}s in ${videoPath}`
    )
  }

  return stdout.toString("base64")
}

export async function extractFrames(
  videoPath: string,
  count = 5
): Promise<string[]> {
  if (count < 1) {
    throw new Error(`Frame count must be at least 1, got ${count}`)
  }

  const duration = await getVideoDuration(videoPath)
  const frameCount = determineFrameCount(duration, count)
  const timestamps = calculateTimestamps(duration, frameCount)

  const frames: string[] = []

  for (const timestamp of timestamps) {
    const base64Frame = await extractFrameAtTimestamp(videoPath, timestamp)
    frames.push(base64Frame)
  }

  return frames
}
