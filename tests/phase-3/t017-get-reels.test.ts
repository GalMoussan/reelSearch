import { describe, it, expect } from 'vitest'

describe('T017 — GET /api/reels', () => {
  it('should return a paginated list of reels', () => {
    // TODO: call GET /api/reels and verify pagination shape (data, total, page, limit)
    expect(true).toBe(false)
  })

  it('should support tag filter via query param', () => {
    // TODO: call GET /api/reels?tag=fitness and verify only matching reels returned
    expect(true).toBe(false)
  })

  it('should support keyword search via q param', () => {
    // TODO: call GET /api/reels?q=recipe and verify results match keyword
    expect(true).toBe(false)
  })

  it('should return reels with tags included', () => {
    // TODO: verify each reel in response has a tags array with { id, name }
    expect(true).toBe(false)
  })
})
