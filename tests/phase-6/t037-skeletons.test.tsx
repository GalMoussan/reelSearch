import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T037 — Skeleton Loading States', () => {
  it('should have reel-card-skeleton component', () => {
    const skeletonPath = resolve(ROOT, 'src/components/reel-card-skeleton.tsx')
    expect(existsSync(skeletonPath)).toBe(true)
  })

  it('should import ReelCardSkeleton in reel-grid', () => {
    const content = readFileSync(resolve(ROOT, 'src/components/reel-grid.tsx'), 'utf-8')
    expect(content).toMatch(/ReelCardSkeleton/)
  })
})
