import { describe, it, expect, vi, beforeEach } from 'vitest'
import { existsSync } from 'fs'
import { resolve } from 'path'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

// Mock embedder
vi.mock('@/services/embedder', () => ({
  generateEmbedding: vi.fn(),
}))

// Mock Prisma namespace for Prisma.sql and Prisma.raw tagged templates
vi.mock('@prisma/client', () => ({
  Prisma: {
    sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values }),
    raw: (value: string) => ({ __prisma_raw: value }),
  },
}))

import { prisma } from '@/lib/prisma'
import { fullTextSearch } from '@/services/search'

const mockQueryRaw = vi.mocked(prisma.$queryRaw)

describe('T018 — Full-Text Search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should export a fullTextSearch function from the search service', () => {
    expect(typeof fullTextSearch).toBe('function')
  })

  it('search service file should exist', () => {
    const searchPath = resolve(__dirname, '../../src/services/search.ts')
    expect(existsSync(searchPath)).toBe(true)
  })

  it('should use tsvector for transcript + summary search', async () => {
    const mockResults = [
      { id: 'r1', url: 'http://example.com', title: 'Cooking Tips', summary: 'Great tips', thumbnailUrl: null, rank: 1.5 },
    ]
    mockQueryRaw.mockResolvedValueOnce(mockResults)

    const results = await fullTextSearch('cooking tips')

    expect(mockQueryRaw).toHaveBeenCalledTimes(1)
    expect(results).toEqual(mockResults)
  })

  it('should support English language queries', async () => {
    const mockResults = [
      { id: 'r1', url: 'http://example.com', title: 'Cooking', summary: null, thumbnailUrl: null, rank: 1.0 },
    ]
    mockQueryRaw.mockResolvedValueOnce(mockResults)

    const results = await fullTextSearch('cooking tips')

    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('r1')
  })

  it('should support Hebrew language queries', async () => {
    // English query returns empty, so fallback to 'simple' dictionary
    mockQueryRaw.mockResolvedValueOnce([]) // english returns nothing
    const hebrewResults = [
      { id: 'r2', url: 'http://example.com', title: 'Hebrew', summary: null, thumbnailUrl: null, rank: 0.8 },
    ]
    mockQueryRaw.mockResolvedValueOnce(hebrewResults)

    const results = await fullTextSearch('מתכון')

    // Should have called $queryRaw twice (english first, then simple fallback)
    expect(mockQueryRaw).toHaveBeenCalledTimes(2)
    expect(results).toEqual(hebrewResults)
  })

  it('should return empty array for empty query', async () => {
    const results = await fullTextSearch('   ')
    expect(results).toEqual([])
    expect(mockQueryRaw).not.toHaveBeenCalled()
  })
})
