import { describe, it, expect, vi } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T009 — yt-dlp Downloader', () => {
  it('should export downloadReel function from downloader.ts', () => {
    const downloaderPath = resolve(ROOT, 'src/lib/pipeline/downloader.ts')
    expect(existsSync(downloaderPath)).toBe(true)
    const content = readFileSync(downloaderPath, 'utf-8')
    expect(content).toContain('export')
    expect(content).toContain('downloadReel')
  })

  it('should create a temp directory for the reel', async () => {
    // TODO: Call downloadReel with a mock URL
    // Verify it creates /tmp/reelsearch/{reelId}/
    expect(true).toBe(false) // TODO: implement
  })

  it('should call yt-dlp with correct arguments', async () => {
    // TODO: Mock child_process.execFile or execa
    // Call downloadReel and verify yt-dlp is invoked with:
    //   --output, --format, and the target URL
    expect(true).toBe(false) // TODO: implement
  })

  it('should extract audio from the downloaded video', async () => {
    // TODO: Verify that audio extraction (ffmpeg -vn) is invoked
    // or yt-dlp --extract-audio flag is used
    expect(true).toBe(false) // TODO: implement
  })

  it('should upload thumbnail to Supabase storage', async () => {
    // TODO: Mock Supabase storage client
    // Verify upload is called with thumbnail buffer
    expect(true).toBe(false) // TODO: implement
  })
})
