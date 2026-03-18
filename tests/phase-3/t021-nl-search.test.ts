import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

// Mock auth options
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

// Mock auth utils
vi.mock('@/lib/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    user: { id: 'user-123', name: 'Test', email: 'test@test.com' },
    expires: '2099-01-01',
  }),
}))

// Mock rate limiter
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 19 }),
}))

// Mock the NL search service
vi.mock('@/services/nl-search', () => ({
  naturalLanguageSearch: vi.fn(),
}))

import { requireAuth } from '@/lib/auth-utils'
import { naturalLanguageSearch } from '@/services/nl-search'
import { POST } from '@/app/api/search/nl/route'

const mockRequireAuth = vi.mocked(requireAuth)
const mockNLSearch = vi.mocked(naturalLanguageSearch)

function makePostRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/search/nl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any
}

describe('T021 — Natural Language Search API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({
      user: { id: 'u1', name: 'Test', email: 'test@test.com' },
      expires: '2099-01-01',
    })
  })

  it('should accept a natural language query via POST /api/search/nl', async () => {
    mockNLSearch.mockResolvedValue({
      data: [],
      reasoning: 'No results found',
      searchPlan: { keywords: ['cooking', 'pasta'], tags: [], semanticQuery: 'cooking pasta', reasoning: 'test' },
    })

    const response = await POST(makePostRequest({ query: 'find reels about cooking pasta' }))

    expect(response.status).toBe(200)
  })

  it('should call naturalLanguageSearch to interpret the query', async () => {
    mockNLSearch.mockResolvedValue({
      data: [],
      reasoning: 'Searched for cooking pasta reels',
      searchPlan: { keywords: ['cooking'], tags: [], semanticQuery: '', reasoning: '' },
    })

    await POST(makePostRequest({ query: 'find reels about cooking pasta' }))

    expect(mockNLSearch).toHaveBeenCalledWith('find reels about cooking pasta')
  })

  it('should return ranked reels with reasoning', async () => {
    const mockResult = {
      data: [
        { id: 'r1', url: 'http://example.com', title: 'Pasta Recipe', summary: null, thumbnailUrl: null, rank: 1.5 },
      ],
      reasoning: 'Found pasta-related reels via keyword and semantic search',
      searchPlan: {
        keywords: ['pasta', 'recipe'],
        tags: ['cooking'],
        semanticQuery: 'how to cook pasta',
        reasoning: 'User wants cooking content about pasta',
      },
    }
    mockNLSearch.mockResolvedValue(mockResult)

    const response = await POST(makePostRequest({ query: 'find reels about cooking pasta' }))
    const json = await response.json()

    expect(json).toHaveProperty('data')
    expect(json).toHaveProperty('reasoning')
    expect(json.reasoning).toBe('Found pasta-related reels via keyword and semantic search')
    expect(json.data).toHaveLength(1)
  })

  it('should return 400 for empty query', async () => {
    const response = await POST(makePostRequest({ query: '' }))

    expect(response.status).toBe(400)
  })

  it('should return 401 for unauthenticated requests', async () => {
    mockRequireAuth.mockRejectedValue(new Error('Unauthorized'))

    const response = await POST(makePostRequest({ query: 'test' }))

    expect(response.status).toBe(401)
  })
})
