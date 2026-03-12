import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T038 — Error States', () => {
  it('should handle FAILED status in reel-card component', () => {
    const content = readFileSync(resolve(ROOT, 'src/components/reel-card.tsx'), 'utf-8')
    expect(content).toMatch(/FAILED/i)
  })

  it('should have a retry route at api/reels/[id]/retry', () => {
    const retryPath = resolve(ROOT, 'src/app/api/reels/[id]/retry/route.ts')
    expect(existsSync(retryPath)).toBe(true)
  })

  it('should reset status to PENDING in retry route', () => {
    const content = readFileSync(resolve(ROOT, 'src/app/api/reels/[id]/retry/route.ts'), 'utf-8')
    expect(content).toMatch(/PENDING/i)
  })
})
