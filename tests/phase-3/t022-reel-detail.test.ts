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
    reel: {
      findUnique: vi.fn(),
    },
    reelView: {
      upsert: vi.fn().mockResolvedValue({}),
    },
    reelNote: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
  },
}))

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { GET } from '@/app/api/reels/[id]/route'

const mockGetServerSession = vi.mocked(getServerSession)
const mockFindUnique = vi.mocked(prisma.reel.findUnique)

function makeRequest() {
  return new Request('http://localhost/api/reels/reel-123') as any
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

describe('T022 — GET /api/reels/[id] (Reel Detail)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { id: 'u1', name: 'Test' } })
  })

  it('should return a reel with all tags', async () => {
    const mockReel = {
      id: 'reel-123',
      url: 'https://instagram.com/reel/abc',
      title: 'Test Reel',
      summary: 'A summary',
      transcript: 'Full transcript here',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      status: 'DONE',
      createdAt: new Date().toISOString(),
      tags: [
        { id: 't1', name: 'fitness' },
        { id: 't2', name: 'health' },
      ],
      addedBy: { id: 'u1', name: 'Test', image: null },
      collections: [],
    }
    mockFindUnique.mockResolvedValue(mockReel as any)

    const response = await GET(makeRequest(), makeParams('reel-123'))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toHaveProperty('data')
    expect(json.data.tags).toEqual([
      { id: 't1', name: 'fitness' },
      { id: 't2', name: 'health' },
    ])
  })

  it('should return the transcript in the response', async () => {
    const mockReel = {
      id: 'reel-123',
      url: 'https://instagram.com/reel/abc',
      title: 'Test',
      summary: null,
      transcript: 'This is the full transcript of the reel video',
      thumbnailUrl: null,
      status: 'DONE',
      tags: [],
      addedBy: { id: 'u1', name: 'Test', image: null },
      collections: [],
    }
    mockFindUnique.mockResolvedValue(mockReel as any)

    const response = await GET(makeRequest(), makeParams('reel-123'))
    const json = await response.json()

    expect(json.data.transcript).toBe('This is the full transcript of the reel video')
  })

  it('should return 404 for a nonexistent reel', async () => {
    mockFindUnique.mockResolvedValue(null)

    const response = await GET(makeRequest(), makeParams('nonexistent-id'))
    const json = await response.json()

    expect(response.status).toBe(404)
    expect(json).toHaveProperty('error')
    expect(json.error).toBe('Reel not found')
  })

  it('should return 401 for unauthenticated requests', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const response = await GET(makeRequest(), makeParams('reel-123'))

    expect(response.status).toBe(401)
  })
})
