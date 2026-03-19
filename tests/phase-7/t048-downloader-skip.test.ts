import { describe, it, expect, vi, beforeEach } from "vitest"
import { existsSync } from "fs"

vi.mock("fs", async () => {
  const actual = await vi.importActual("fs")
  return { ...actual, existsSync: vi.fn() }
})

vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn(),
  readdir: vi.fn(),
}))

vi.mock("@/lib/exec", () => ({
  execText: vi.fn().mockResolvedValue(""),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: { reel: { update: vi.fn() } },
}))

vi.mock("@/lib/supabase", () => ({
  uploadFile: vi.fn().mockResolvedValue("https://example.com/thumb.jpg"),
}))

import { downloadReel } from "@/services/downloader"
import { execText } from "@/lib/exec"

describe("downloadReel skip-download", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("skips yt-dlp when files are pre-staged", async () => {
    vi.mocked(existsSync).mockReturnValue(true)

    const result = await downloadReel("test-reel-id", "telegram://upload/test-reel-id")

    expect(result.videoPath).toContain("test-reel-id/video.mp4")
    expect(result.audioPath).toContain("test-reel-id/audio.mp3")
    expect(result.thumbnailUrl).toBe("")
    expect(execText).not.toHaveBeenCalled()
  })

  it("calls yt-dlp when files are not pre-staged", async () => {
    vi.mocked(existsSync).mockReturnValue(false)
    const { readdir } = await import("fs/promises")
    vi.mocked(readdir as any).mockResolvedValue(["video.mp4"])

    await downloadReel("test-reel-id", "https://www.instagram.com/reel/abc/").catch(() => {})

    expect(execText).toHaveBeenCalled()
  })
})
