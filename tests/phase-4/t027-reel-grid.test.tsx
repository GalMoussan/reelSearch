import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const srcDir = resolve(__dirname, '../../src')

describe('T027 — Reel Grid', () => {
  it('should have a reel grid component at src/components/reel-grid.tsx', () => {
    const gridPath = resolve(srcDir, 'components/reel-grid.tsx')
    expect(existsSync(gridPath)).toBe(true)
  })

  it('should have a use-reels hook at src/hooks/use-reels.ts', () => {
    const hookPath = resolve(srcDir, 'hooks/use-reels.ts')
    expect(existsSync(hookPath)).toBe(true)
  })

  it('should use IntersectionObserver for infinite scroll', () => {
    const gridPath = resolve(srcDir, 'components/reel-grid.tsx')
    const content = readFileSync(gridPath, 'utf-8')

    expect(content).toContain('IntersectionObserver')
    expect(content).toContain('sentinelRef')
    expect(content).toContain('observer.observe')
  })

  it('should render ReelCard components', () => {
    const gridPath = resolve(srcDir, 'components/reel-grid.tsx')
    const content = readFileSync(gridPath, 'utf-8')

    expect(content).toContain('ReelCard')
    expect(content).toMatch(/import.*ReelCard/)
  })

  it('should show skeleton loading state', () => {
    const gridPath = resolve(srcDir, 'components/reel-grid.tsx')
    const content = readFileSync(gridPath, 'utf-8')

    expect(content).toContain('isLoading')
    expect(content).toContain('Skeleton')
  })

  it('should use useReels hook with tags and q filter params', () => {
    const gridPath = resolve(srcDir, 'components/reel-grid.tsx')
    const content = readFileSync(gridPath, 'utf-8')

    expect(content).toContain('useReels')
    expect(content).toContain('tags')
  })

  it('should support fetchNextPage for pagination', () => {
    const gridPath = resolve(srcDir, 'components/reel-grid.tsx')
    const content = readFileSync(gridPath, 'utf-8')

    expect(content).toContain('fetchNextPage')
    expect(content).toContain('hasNextPage')
  })
})
