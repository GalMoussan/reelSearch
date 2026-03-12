import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

// Mock auth options
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    tag: {
      findMany: vi.fn(),
    },
  },
}))

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { GET } from '@/app/api/tags/route'

const mockGetServerSession = vi.mocked(getServerSession)
const mockFindMany = vi.mocked(prisma.tag.findMany)

describe('T019 — Tag Cloud API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { id: 'u1', name: 'Test' } })
  })

  it('should return tags with reel count via GET /api/tags', async () => {
    const mockTags = [
      { id: 't1', name: 'fitness', _count: { reels: 10 } },
      { id: 't2', name: 'cooking', _count: { reels: 5 } },
      { id: 't3', name: 'travel', _count: { reels: 3 } },
    ]
    mockFindMany.mockResolvedValue(mockTags as any)

    const response = await GET()
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toHaveProperty('data')
    expect(json.data).toEqual([
      { id: 't1', name: 'fitness', count: 10 },
      { id: 't2', name: 'cooking', count: 5 },
      { id: 't3', name: 'travel', count: 3 },
    ])
  })

  it('should return tags sorted by count descending', async () => {
    const mockTags = [
      { id: 't1', name: 'fitness', _count: { reels: 20 } },
      { id: 't2', name: 'cooking', _count: { reels: 15 } },
      { id: 't3', name: 'travel', _count: { reels: 5 } },
    ]
    mockFindMany.mockResolvedValue(mockTags as any)

    const response = await GET()
    const json = await response.json()

    const counts = json.data.map((t: any) => t.count)
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i - 1]).toBeGreaterThanOrEqual(counts[i])
    }

    // Verify findMany was called with orderBy count desc
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { reels: { _count: 'desc' } },
      }),
    )
  })
})
