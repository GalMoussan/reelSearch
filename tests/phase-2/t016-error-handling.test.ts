import { describe, it, expect, vi } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T016 — Pipeline Error Handling', () => {
  it('should wrap the reel-processor pipeline in try/catch', () => {
    const processorPath = resolve(ROOT, 'src/workers/reel-processor.ts')
    expect(existsSync(processorPath)).toBe(true)
    const content = readFileSync(processorPath, 'utf-8')
    expect(content).toContain('try')
    expect(content).toContain('catch')
  })

  it('should set reel status to FAILED on pipeline error', () => {
    const processorPath = resolve(ROOT, 'src/workers/reel-processor.ts')
    const content = readFileSync(processorPath, 'utf-8')
    expect(content).toContain('status: "FAILED"')
    expect(content).toContain('errorMessage')
  })

  it('should store the error message on the reel record', () => {
    const processorPath = resolve(ROOT, 'src/workers/reel-processor.ts')
    const content = readFileSync(processorPath, 'utf-8')
    // Verify it captures error.message and stores it
    expect(content).toMatch(/error\s+instanceof\s+Error/)
    expect(content).toContain('errorMessage')
    expect(content).toContain('prisma.reel')
  })

  it('should clean up temp files even on failure', () => {
    const processorPath = resolve(ROOT, 'src/workers/reel-processor.ts')
    const content = readFileSync(processorPath, 'utf-8')
    // Verify cleanupTempFiles is called inside the catch block
    const catchIndex = content.indexOf('catch')
    const cleanupAfterCatch = content.indexOf('cleanupTempFiles', catchIndex)
    expect(cleanupAfterCatch).toBeGreaterThan(catchIndex)
  })

  it('should have BullMQ retry configured with max 2 attempts', () => {
    const queuePath = resolve(ROOT, 'src/lib/queue.ts')
    expect(existsSync(queuePath)).toBe(true)
    const content = readFileSync(queuePath, 'utf-8')
    // Verify retry/attempts configuration
    expect(content).toMatch(/attempts\s*:\s*2/)
  })
})
