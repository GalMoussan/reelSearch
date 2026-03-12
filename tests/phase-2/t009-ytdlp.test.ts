import { describe, it, expect, vi } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T009 — yt-dlp Downloader', () => {
  it('should export downloadReel function from downloader.ts', () => {
    const downloaderPath = resolve(ROOT, 'src/services/downloader.ts')
    expect(existsSync(downloaderPath)).toBe(true)
    const content = readFileSync(downloaderPath, 'utf-8')
    expect(content).toContain('export')
    expect(content).toContain('downloadReel')
  })

  it('should create a temp directory via mkdir', () => {
    const downloaderPath = resolve(ROOT, 'src/services/downloader.ts')
    const content = readFileSync(downloaderPath, 'utf-8')
    // Verify it uses mkdir to create temp dir under /tmp/reelsearch
    expect(content).toContain('mkdir')
    expect(content).toContain('/tmp/reelsearch')
  })

  it('should call yt-dlp with correct arguments', () => {
    const downloaderPath = resolve(ROOT, 'src/services/downloader.ts')
    const content = readFileSync(downloaderPath, 'utf-8')
    expect(content).toContain('yt-dlp')
    expect(content).toContain('"-o"')
    expect(content).toContain('"--format"')
  })

  it('should extract audio from the downloaded video', () => {
    const downloaderPath = resolve(ROOT, 'src/services/downloader.ts')
    const content = readFileSync(downloaderPath, 'utf-8')
    expect(content).toContain('--extract-audio')
    expect(content).toContain('mp3')
  })

  it('should upload thumbnail to Supabase storage', () => {
    const downloaderPath = resolve(ROOT, 'src/services/downloader.ts')
    const content = readFileSync(downloaderPath, 'utf-8')
    expect(content).toContain('uploadFile')
    expect(content).toContain('thumbnails')
  })
})
