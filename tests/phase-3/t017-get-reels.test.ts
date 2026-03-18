import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next-auth before importing handler
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

// Mock auth options
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

// Mock auth utils
vi.mock('@/lib/auth-utils', () => ({
  requireAuth: vi.fn(),
}))

// Mock prisma
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

// Mock queue
vi.mock('@/lib/queue', () => ({
  addReelJob: vi.fn(),
}))

// Mock rate limiter
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 9 }),
}))

// Mock validators
vi.mock('@/lib/validators', () => ({
  reelUrlSchema: {
    safeParse: vi.fn(),
  },
}))

// Mock search services
vi.mock('@/services/search', () => ({
  fullTextSearch: vi.fn().mockResolvedValue([]),
  semanticSearch: vi.fn().mockResolvedValue([]),
}))

// Mock embedder
vi.mock('@/services/embedder', () => ({
  isEmbeddingEnabled: vi.fn(() => false),
  generateEmbedding: vi.fn(),
}))

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { GET } from '@/app/api/reels/route'

const mockGetServerSession = vi.mocked(getServerSession)
const mockFindMany = vi.mocked(prisma.reel.findMany)
const mockCount = vi.mocked(prisma.reel.count)

function makeRequest(url: string) {
  return new NextRequest(new URL(url))
}

describe('T017 — GET /api/reels', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { id: 'u1', name: 'Test' } })
  })

  it('should return a paginated list of reels', async () => {
    const mockReels = [
      { id: 'r1', title: 'Reel 1', tags: [{ id: 't1', name: 'fitness' }], addedBy: { id: 'u1', name: 'Test', image: null } },
    ]
    mockFindMany.mockResolvedValue(mockReels as any)
    mockCount.mockResolvedValue(1)

    const response = await GET(makeRequest('http://localhost/api/reels?page=1&limit=20'))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toHaveProperty('data')
    expect(json).toHaveProperty('meta')
    expect(json.meta).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 })
    expect(json.data).toHaveLength(1)
  })

  it('should support tag filter via query param (AND logic per tag)', async () => {
    mockFindMany.mockResolvedValue([])
    mockCount.mockResolvedValue(0)

    await GET(makeRequest('http://localhost/api/reels?tags=fitness'))

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            { tags: { some: { name: 'fitness' } } },
          ],
        },
      }),
    )
  })

  it('should support keyword search via q param (ILIKE fallback)', async () => {
    mockFindMany.mockResolvedValue([])
    mockCount.mockResolvedValue(0)

    await GET(makeRequest('http://localhost/api/reels?q=recipe'))

    // When FTS + semantic return nothing, falls back to ILIKE on title/summary/transcript
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              OR: [
                { title: { contains: 'recipe', mode: 'insensitive' } },
                { summary: { contains: 'recipe', mode: 'insensitive' } },
                { transcript: { contains: 'recipe', mode: 'insensitive' } },
              ],
            },
          ],
        },
      }),
    )
  })

  it('should return reels with tags included', async () => {
    const mockReels = [
      {
        id: 'r1',
        title: 'Reel 1',
        tags: [{ id: 't1', name: 'cooking' }, { id: 't2', name: 'recipe' }],
        addedBy: { id: 'u1', name: 'Test', image: null },
      },
    ]
    mockFindMany.mockResolvedValue(mockReels as any)
    mockCount.mockResolvedValue(1)

    const response = await GET(makeRequest('http://localhost/api/reels?page=1&limit=20'))
    const json = await response.json()

    expect(json.data[0].tags).toEqual([
      { id: 't1', name: 'cooking' },
      { id: 't2', name: 'recipe' },
    ])

    // Verify findMany was called with include.tags = true
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({ tags: true }),
      }),
    )
  })
})
