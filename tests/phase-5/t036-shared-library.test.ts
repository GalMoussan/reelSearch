import { describe, it, expect } from 'vitest'

describe('T036 — Shared Library (Multi-User)', () => {
  it('should store addedBy from session when creating a reel via POST /api/reels', () => {
    // TODO: call POST /api/reels with authenticated session, verify reel.addedBy matches session user
    expect(true).toBe(false)
  })

  it('should return all reels regardless of user via GET /api/reels (no user filter)', () => {
    // TODO: create reels from different users, call GET /api/reels, verify all are returned
    expect(true).toBe(false)
  })

  it('should return 401 for unauthenticated requests', () => {
    // TODO: call POST /api/reels without session, verify 401 status
    expect(true).toBe(false)
  })
})
