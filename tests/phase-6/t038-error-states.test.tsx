import { describe, it, expect } from 'vitest'

describe('T038 — Error States', () => {
  it('should show a red indicator for a failed reel', () => {
    // TODO: render reel with status=FAILED and verify red error indicator is visible
    expect(true).toBe(false)
  })

  it('should render a retry button that calls POST /api/reels/[id]/retry', () => {
    // TODO: render failed reel, click retry button, verify POST /api/reels/:id/retry is called
    expect(true).toBe(false)
  })

  it('should reset reel status to PENDING on retry', () => {
    // TODO: call POST /api/reels/:id/retry and verify response has status=PENDING
    expect(true).toBe(false)
  })
})
