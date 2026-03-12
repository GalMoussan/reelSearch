import { describe, it, expect, vi } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

// Mock prisma before importing
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    tag: { upsert: vi.fn() },
    reel: { update: vi.fn() },
  },
}))

import { normalizeTag } from '@/services/tag-normalizer'

const ROOT = resolve(__dirname, '../..')

describe('T013 — Tag Normalizer', () => {
  it('should export normalizeTag and normalizeTags from tag-normalizer.ts', () => {
    const normalizerPath = resolve(ROOT, 'src/services/tag-normalizer.ts')
    expect(existsSync(normalizerPath)).toBe(true)
    const content = readFileSync(normalizerPath, 'utf-8')
    expect(content).toContain('export')
    expect(content).toContain('normalizeTag')
    expect(content).toContain('normalizeTags')
  })

  it('should lowercase all tags', () => {
    expect(normalizeTag('React')).toBe('react')
    expect(normalizeTag('NextJS')).toBe('nextjs')
    expect(normalizeTag('TypeScript')).toBe('typescript')
  })

  it('should trim whitespace from tags', () => {
    expect(normalizeTag(' react ')).toBe('react')
    expect(normalizeTag('  nextjs')).toBe('nextjs')
    expect(normalizeTag('typescript  ')).toBe('typescript')
  })

  it('should remove leading # from tags', () => {
    expect(normalizeTag('#react')).toBe('react')
    expect(normalizeTag('#NextJS')).toBe('nextjs')
  })

  it('should remove spaces for compound words', () => {
    expect(normalizeTag('street fight')).toBe('streetfight')
    expect(normalizeTag('baby cat')).toBe('babycat')
    expect(normalizeTag('drunk man')).toBe('drunkman')
  })

  it('should handle combined transformations', () => {
    // trim + lowercase + remove # + remove spaces
    expect(normalizeTag(' #Street Fight ')).toBe('streetfight')
    expect(normalizeTag('  #Baby Cat  ')).toBe('babycat')
  })

  it('should strip special characters except Hebrew and alphanumeric', () => {
    expect(normalizeTag('hello!')).toBe('hello')
    expect(normalizeTag('tag@name')).toBe('tagname')
    expect(normalizeTag('a.b.c')).toBe('abc')
  })
})
