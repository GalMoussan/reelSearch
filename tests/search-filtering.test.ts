import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ── Mocks ──────────────────────────────────────────────────────────────

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

vi.mock('@/lib/auth-utils', () => ({
  requireAuth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    reel: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/queue', () => ({
  addReelJob: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 9 }),
}))

vi.mock('@/lib/validators', () => ({
  reelUrlSchema: { safeParse: vi.fn() },
}))

vi.mock('@/services/search', () => ({
  fullTextSearch: vi.fn(),
  semanticSearch: vi.fn(),
}))

vi.mock('@/services/embedder', () => ({
  isEmbeddingEnabled: vi.fn(() => false),
  generateEmbedding: vi.fn(),
}))

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { fullTextSearch } from '@/services/search'
import { GET } from '@/app/api/reels/route'

const mockGetServerSession = vi.mocked(getServerSession)
const mockFindMany = vi.mocked(prisma.reel.findMany)
const mockCount = vi.mocked(prisma.reel.count)
const mockFullTextSearch = vi.mocked(fullTextSearch)

function makeRequest(url: string) {
  return new NextRequest(new URL(url))
}

// ── Test data ──────────────────────────────────────────────────────────

const REELS = {
  cookingHealthy: {
    id: 'r1',
    title: 'Healthy Cooking Tips',
    summary: 'Learn how to make delicious healthy meals at home',
    thumbnailUrl: 'https://example.com/r1.jpg',
    status: 'DONE',
    createdAt: '2026-03-10T00:00:00Z',
    tags: [
      { id: 't1', name: 'cooking' },
      { id: 't2', name: 'healthy' },
      { id: 't3', name: 'recipe' },
    ],
    addedBy: { id: 'u1', name: 'Test', image: null },
  },
  fitnessYoga: {
    id: 'r2',
    title: 'Morning Yoga Routine',
    summary: 'A 10-minute yoga routine to start your day right',
    thumbnailUrl: 'https://example.com/r2.jpg',
    status: 'DONE',
    createdAt: '2026-03-11T00:00:00Z',
    tags: [
      { id: 't4', name: 'fitness' },
      { id: 't5', name: 'yoga' },
      { id: 't6', name: 'healthy' },
    ],
    addedBy: { id: 'u1', name: 'Test', image: null },
  },
  cookingPasta: {
    id: 'r3',
    title: 'Pasta Masterclass',
    summary: 'Italian chef shows how to make fresh pasta from scratch',
    thumbnailUrl: 'https://example.com/r3.jpg',
    status: 'DONE',
    createdAt: '2026-03-12T00:00:00Z',
    tags: [
      { id: 't1', name: 'cooking' },
      { id: 't7', name: 'pasta' },
      { id: 't8', name: 'italian' },
    ],
    addedBy: { id: 'u1', name: 'Test', image: null },
  },
  dancingRain: {
    id: 'r4',
    title: 'Dancing in the Rain',
    summary: 'Street performer does an amazing dance in the rain',
    thumbnailUrl: 'https://example.com/r4.jpg',
    status: 'DONE',
    createdAt: '2026-03-13T00:00:00Z',
    tags: [
      { id: 't9', name: 'dancing' },
      { id: 't10', name: 'street' },
      { id: 't11', name: 'rain' },
    ],
    addedBy: { id: 'u1', name: 'Test', image: null },
  },
}

// ── Helper ─────────────────────────────────────────────────────────────

/**
 * Simulates Prisma filtering on the in-memory REELS dataset.
 * Inspects the `where.AND` conditions to apply tag and text filters.
 */
function simulatePrismaFilter(args: any) {
  const allReels = Object.values(REELS)

  // Tag search leg: { where: { tags: { some: { name: { in: [...] } } } }, select: { id: true } }
  if (args?.select?.id && args?.where?.tags?.some?.name?.in) {
    const tagNames: string[] = args.where.tags.some.name.in
    return allReels
      .filter((reel) => reel.tags.some((t) => tagNames.includes(t.name)))
      .map((reel) => ({ id: reel.id }))
  }

  const conditions: any[] = args?.where?.AND ?? []

  return allReels.filter((reel) =>
    conditions.every((cond: any) => {
      // Tag condition: { tags: { some: { name: 'tagname' } } }
      if (cond.tags?.some?.name && typeof cond.tags.some.name === 'string') {
        return reel.tags.some((t) => t.name === cond.tags.some.name)
      }
      // ID-in condition: { id: { in: [...] } }
      if (cond.id?.in) {
        return cond.id.in.includes(reel.id)
      }
      // ILIKE fallback: { OR: [{ title: ... }, { summary: ... }, ...] }
      if (cond.OR) {
        return cond.OR.some((orCond: any) => {
          const field = Object.keys(orCond)[0] as keyof typeof reel
          const value = reel[field]
          if (typeof value === 'string' && orCond[field]?.contains) {
            return value.toLowerCase().includes(orCond[field].contains.toLowerCase())
          }
          return false
        })
      }
      return true
    }),
  )
}

// ── Tests ──────────────────────────────────────────────────────────────

describe('Tag filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { id: 'u1', name: 'Test' } })
    mockFullTextSearch.mockResolvedValue([])

    // Wire mocks to simulate real filtering
    mockFindMany.mockImplementation(((args: any) => {
      return Promise.resolve(simulatePrismaFilter(args))
    }) as any)
    mockCount.mockImplementation(((args: any) => {
      return Promise.resolve(simulatePrismaFilter(args).length)
    }) as any)
  })

  it('selecting a single tag returns only reels that have that tag', async () => {
    const response = await GET(makeRequest('http://localhost/api/reels?tags=cooking'))
    const json = await response.json()

    expect(response.status).toBe(200)
    // Only r1 (cookingHealthy) and r3 (cookingPasta) have the "cooking" tag
    expect(json.data).toHaveLength(2)
    const ids = json.data.map((r: any) => r.id)
    expect(ids).toContain(REELS.cookingHealthy.id)
    expect(ids).toContain(REELS.cookingPasta.id)
    expect(ids).not.toContain(REELS.fitnessYoga.id)
    expect(ids).not.toContain(REELS.dancingRain.id)

    // Every returned reel must have the "cooking" tag
    for (const reel of json.data) {
      const tagNames = reel.tags.map((t: any) => t.name)
      expect(tagNames).toContain('cooking')
    }
  })

  it('selecting multiple tags uses AND logic — returns only reels with ALL tags', async () => {
    const response = await GET(makeRequest('http://localhost/api/reels?tags=cooking,healthy'))
    const json = await response.json()

    expect(response.status).toBe(200)
    // Only r1 (cookingHealthy) has BOTH "cooking" AND "healthy"
    // r2 (fitnessYoga) has "healthy" but not "cooking"
    // r3 (cookingPasta) has "cooking" but not "healthy"
    expect(json.data).toHaveLength(1)
    expect(json.data[0].id).toBe(REELS.cookingHealthy.id)

    const tagNames = json.data[0].tags.map((t: any) => t.name)
    expect(tagNames).toContain('cooking')
    expect(tagNames).toContain('healthy')
  })

  it('selecting a tag that no reel has returns empty results', async () => {
    const response = await GET(makeRequest('http://localhost/api/reels?tags=nonexistenttag'))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.data).toHaveLength(0)
    expect(json.meta.total).toBe(0)
  })

  it('each returned reel has the selected tag among its tags', async () => {
    const response = await GET(makeRequest('http://localhost/api/reels?tags=healthy'))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.data.length).toBeGreaterThan(0)

    for (const reel of json.data) {
      const tagNames = reel.tags.map((t: any) => t.name)
      expect(tagNames).toContain('healthy')
    }
  })

  it('generates one AND condition per tag (not a single OR condition)', async () => {
    await GET(makeRequest('http://localhost/api/reels?tags=cooking,italian'))

    // Verify findMany was called with separate conditions for each tag
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: expect.arrayContaining([
            { tags: { some: { name: 'cooking' } } },
            { tags: { some: { name: 'italian' } } },
          ]),
        },
      }),
    )
  })
})

describe('Text search filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { id: 'u1', name: 'Test' } })

    // Wire mocks to simulate real filtering
    mockFindMany.mockImplementation(((args: any) => {
      return Promise.resolve(simulatePrismaFilter(args))
    }) as any)
    mockCount.mockImplementation(((args: any) => {
      return Promise.resolve(simulatePrismaFilter(args).length)
    }) as any)
  })

  it('searching a string returns reels matching by tag name', async () => {
    // FTS returns nothing, but tag search finds r3 (has "pasta" tag)
    mockFullTextSearch.mockResolvedValue([])

    const response = await GET(makeRequest('http://localhost/api/reels?q=pasta'))
    const json = await response.json()

    expect(response.status).toBe(200)
    // "pasta" matches r3 via tag search
    expect(json.data.length).toBeGreaterThan(0)
    expect(json.data[0].id).toBe(REELS.cookingPasta.id)
  })

  it('searching returns reels ranked by FTS when full-text search finds matches', async () => {
    // FTS returns r1 and r3 (both have "cooking" content)
    mockFullTextSearch.mockResolvedValue([
      { id: 'r1', url: '', title: '', summary: '', thumbnailUrl: '', rank: 2.0 },
      { id: 'r3', url: '', title: '', summary: '', thumbnailUrl: '', rank: 1.5 },
    ])

    // First call: tag search (returns r1, r3 which have "cooking" tag)
    // Second call: main query (fetch reels by ranked IDs)
    mockFindMany
      .mockImplementationOnce(((args: any) => Promise.resolve(simulatePrismaFilter(args))) as any)
      .mockResolvedValueOnce([
        REELS.cookingHealthy,
        REELS.cookingPasta,
      ] as any)

    const response = await GET(makeRequest('http://localhost/api/reels?q=cooking'))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.data).toHaveLength(2)

    // r1 should be first (higher combined RRF score from FTS + tags)
    expect(json.data[0].id).toBe('r1')
    expect(json.data[1].id).toBe('r3')
  })

  it('searching "yoga" does not return cooking or dancing reels', async () => {
    mockFullTextSearch.mockResolvedValue([])

    const response = await GET(makeRequest('http://localhost/api/reels?q=yoga'))
    const json = await response.json()

    expect(response.status).toBe(200)

    // Tag search finds r2 (has "yoga" tag), so RRF path is used
    const ids = json.data.map((r: any) => r.id)
    expect(ids).toContain(REELS.fitnessYoga.id)
    expect(ids).not.toContain(REELS.cookingHealthy.id)
    expect(ids).not.toContain(REELS.cookingPasta.id)
    expect(ids).not.toContain(REELS.dancingRain.id)
  })

  it('searching a string that exists in no reel returns empty results', async () => {
    mockFullTextSearch.mockResolvedValue([])

    const response = await GET(makeRequest('http://localhost/api/reels?q=xyznonexistent'))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.data).toHaveLength(0)
    expect(json.meta.total).toBe(0)
  })

  it('search combined with tag filter narrows results further', async () => {
    mockFullTextSearch.mockResolvedValue([])

    // Searching "healthy" with tag "cooking" should only return r1
    // Tag search finds r1 and r2 (both have "healthy" tag), cooking tag filter narrows to r1
    const response = await GET(makeRequest('http://localhost/api/reels?q=healthy&tags=cooking'))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.data).toHaveLength(1)
    expect(json.data[0].id).toBe(REELS.cookingHealthy.id)

    // Must have "cooking" tag
    const tagNames = json.data[0].tags.map((t: any) => t.name)
    expect(tagNames).toContain('cooking')
  })
})
