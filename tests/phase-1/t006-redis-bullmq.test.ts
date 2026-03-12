import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T006 — Redis & BullMQ Setup', () => {
  it('should export Redis connection from redis.ts', () => {
    const redisPath = resolve(ROOT, 'src/lib/redis.ts')
    expect(existsSync(redisPath)).toBe(true)
    const content = readFileSync(redisPath, 'utf-8')
    expect(content).toContain('export')
    expect(content).toMatch(/[Rr]edis|IORedis|connection/)
  })

  it('should export reel-processing queue from queue.ts', () => {
    const queuePath = resolve(ROOT, 'src/lib/queue.ts')
    expect(existsSync(queuePath)).toBe(true)
    const content = readFileSync(queuePath, 'utf-8')
    expect(content).toContain('export')
    expect(content).toContain('Queue')
    expect(content).toMatch(/reel[-_]process/)
  })

  it('should have workers/reel-processor.ts', () => {
    const workerPath = resolve(ROOT, 'src/workers/reel-processor.ts')
    expect(existsSync(workerPath)).toBe(true)
  })
})
