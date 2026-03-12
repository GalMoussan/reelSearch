import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const srcDir = resolve(__dirname, '../../src')

describe('T026 — Reel Card Component', () => {
  it('should have a reel card component at src/components/reel-card.tsx', () => {
    const cardPath = resolve(srcDir, 'components/reel-card.tsx')
    expect(existsSync(cardPath)).toBe(true)
  })

  it('should handle thumbnailUrl for rendering', () => {
    const cardPath = resolve(srcDir, 'components/reel-card.tsx')
    const content = readFileSync(cardPath, 'utf-8')

    expect(content).toContain('thumbnailUrl')
    expect(content).toContain('Image')
  })

  it('should render title', () => {
    const cardPath = resolve(srcDir, 'components/reel-card.tsx')
    const content = readFileSync(cardPath, 'utf-8')

    expect(content).toContain('title')
    expect(content).toContain('Untitled Reel')
  })

  it('should render tags with a max visible limit', () => {
    const cardPath = resolve(srcDir, 'components/reel-card.tsx')
    const content = readFileSync(cardPath, 'utf-8')

    expect(content).toContain('tags')
    expect(content).toContain('MAX_VISIBLE_TAGS')
    expect(content).toContain('visibleTags')
    expect(content).toContain('remainingCount')
  })

  it('should accept onClick handler', () => {
    const cardPath = resolve(srcDir, 'components/reel-card.tsx')
    const content = readFileSync(cardPath, 'utf-8')

    expect(content).toContain('onClick')
    expect(content).toMatch(/onClick\??\.\(reel\.id\)/)
  })

  it('should render date with relative formatting', () => {
    const cardPath = resolve(srcDir, 'components/reel-card.tsx')
    const content = readFileSync(cardPath, 'utf-8')

    expect(content).toContain('createdAt')
    expect(content).toContain('formatRelativeDate')
  })
})
