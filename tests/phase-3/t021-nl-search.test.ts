import { describe, it, expect } from 'vitest'

describe('T021 — Natural Language Search API', () => {
  it('should accept a natural language query via POST /api/search/nl', () => {
    // TODO: call POST /api/search/nl with { query: 'find reels about cooking pasta' } and verify 200
    expect(true).toBe(false)
  })

  it('should call Claude to interpret the query', () => {
    // TODO: mock Claude API and verify it is called to parse intent from the NL query
    expect(true).toBe(false)
  })

  it('should return ranked reels with reasoning', () => {
    // TODO: verify response contains { reels: [...], reasoning: string }
    expect(true).toBe(false)
  })
})
