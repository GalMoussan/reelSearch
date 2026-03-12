import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const srcDir = resolve(__dirname, '../../src')

describe('T031 — Reel Detail Modal', () => {
  it('should have a reel detail modal component at src/components/reel-detail-modal.tsx', () => {
    const modalPath = resolve(srcDir, 'components/reel-detail-modal.tsx')
    expect(existsSync(modalPath)).toBe(true)
  })

  it('should use Dialog component', () => {
    const modalPath = resolve(srcDir, 'components/reel-detail-modal.tsx')
    const content = readFileSync(modalPath, 'utf-8')

    expect(content).toContain('Dialog')
    expect(content).toContain('DialogContent')
    expect(content).toMatch(/import[\s\S]*Dialog/)
  })

  it('should render the full transcript', () => {
    const modalPath = resolve(srcDir, 'components/reel-detail-modal.tsx')
    const content = readFileSync(modalPath, 'utf-8')

    expect(content).toContain('transcript')
    expect(content).toContain('Transcript')
  })

  it('should render all tags (not truncated)', () => {
    const modalPath = resolve(srcDir, 'components/reel-detail-modal.tsx')
    const content = readFileSync(modalPath, 'utf-8')

    expect(content).toContain('reel.tags')
    expect(content).toContain('tags.map')
    // Should NOT have MAX_VISIBLE_TAGS truncation like ReelCard
    expect(content).not.toContain('MAX_VISIBLE_TAGS')
  })

  it('should render a link to the original Instagram URL', () => {
    const modalPath = resolve(srcDir, 'components/reel-detail-modal.tsx')
    const content = readFileSync(modalPath, 'utf-8')

    expect(content).toContain('reel.url')
    expect(content).toContain('target="_blank"')
    expect(content).toContain('View on Instagram')
  })

  it('should fetch reel detail by ID', () => {
    const modalPath = resolve(srcDir, 'components/reel-detail-modal.tsx')
    const content = readFileSync(modalPath, 'utf-8')

    expect(content).toContain('reelId')
    expect(content).toContain('/api/reels/')
    expect(content).toContain('useQuery')
  })
})
