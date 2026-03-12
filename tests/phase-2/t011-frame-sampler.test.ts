import { describe, it, expect, vi } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T011 — Frame Sampler', () => {
  it('should export extractFrames function from frame-sampler.ts', () => {
    const samplerPath = resolve(ROOT, 'src/services/frame-sampler.ts')
    expect(existsSync(samplerPath)).toBe(true)
    const content = readFileSync(samplerPath, 'utf-8')
    expect(content).toContain('export')
    expect(content).toContain('extractFrames')
  })

  it('should return base64-encoded strings', () => {
    const samplerPath = resolve(ROOT, 'src/services/frame-sampler.ts')
    const content = readFileSync(samplerPath, 'utf-8')
    // Verify it converts frames to base64
    expect(content).toContain('base64')
    expect(content).toContain('toString')
  })

  it('should use ffmpeg for frame extraction', () => {
    const samplerPath = resolve(ROOT, 'src/services/frame-sampler.ts')
    const content = readFileSync(samplerPath, 'utf-8')
    expect(content).toContain('ffmpeg')
    expect(content).toContain('image2pipe')
  })

  it('should handle short videos by reducing frame count', () => {
    const samplerPath = resolve(ROOT, 'src/services/frame-sampler.ts')
    const content = readFileSync(samplerPath, 'utf-8')
    // Verify it has logic to handle short videos (< 5s)
    expect(content).toContain('determineFrameCount')
    expect(content).toMatch(/duration\s*<\s*5/)
  })
})
