import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

// Mock auth options
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

// Mock the search service
vi.mock('@/services/search', () => ({
  semanticSearch: vi.fn(),
}))

import { getServerSession } from 'next-auth'
import { semanticSearch } from '@/services/search'
import { POST } from '@/app/api/search/semantic/route'

const mockGetServerSession = vi.mocked(getServerSession)
const mockSemanticSearch = vi.mocked(semanticSearch)

function makePostRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/search/semantic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any
}

describe('T020 — Semantic Search API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { id: 'u1', name: 'Test' } })
  })

  it('should accept query text via POST /api/search/semantic', async () => {
    mockSemanticSearch.mockResolvedValue([])

    const response = await POST(makePostRequest({ query: 'healthy meals' }))

    expect(response.status).toBe(200)
  })

  it('should embed query and find similar reels by vector distance', async () => {
    const mockResults = [
      { id: 'r1', url: 'http://example.com', title: 'Healthy Eating', summary: null, thumbnailUrl: null, rank: 0, similarity: 0.92 },
    ]
    mockSemanticSearch.mockResolvedValue(mockResults)

    const response = await POST(makePostRequest({ query: 'healthy meals' }))
    const json = await response.json()

    expect(mockSemanticSearch).toHaveBeenCalledWith('healthy meals', { limit: 10 })
    expect(json.data).toEqual(mockResults)
  })

  it('should return ranked results with similarity scores', async () => {
    const mockResults = [
      { id: 'r1', url: 'http://a.com', title: 'A', summary: null, thumbnailUrl: null, rank: 0, similarity: 0.95 },
      { id: 'r2', url: 'http://b.com', title: 'B', summary: null, thumbnailUrl: null, rank: 0, similarity: 0.80 },
    ]
    mockSemanticSearch.mockResolvedValue(mockResults)

    const response = await POST(makePostRequest({ query: 'healthy meals' }))
    const json = await response.json()

    expect(json.data).toHaveLength(2)
    expect(json.data[0].similarity).toBeGreaterThan(json.data[1].similarity)
  })

  it('should return 400 for missing query', async () => {
    const response = await POST(makePostRequest({}))

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json).toHaveProperty('error')
  })

  it('should return 401 for unauthenticated requests', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const response = await POST(makePostRequest({ query: 'test' }))

    expect(response.status).toBe(401)
  })
})
