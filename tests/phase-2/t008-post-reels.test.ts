import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all external dependencies BEFORE importing the route
vi.mock('@/lib/prisma', () => ({
  prisma: {
    reel: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock('@/lib/queue', () => ({
  addReelJob: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 9 }),
}))

vi.mock('@/lib/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    user: { id: 'user-123', name: 'Test', email: 'test@test.com' },
  }),
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {
    providers: [],
  },
}))

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: { id: 'user-123', name: 'Test', email: 'test@test.com' },
  }),
}))

import { POST } from '@/app/api/reels/route'
import { prisma } from '@/lib/prisma'
import { addReelJob } from '@/lib/queue'
import { requireAuth } from '@/lib/auth-utils'
import { NextRequest } from 'next/server'

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/reels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('T008 — POST /api/reels Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: 'user-123', name: 'Test', email: 'test@test.com' },
      expires: '2099-01-01',
    })
    vi.mocked(prisma.reel.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.reel.create).mockResolvedValue({
      id: 'reel-abc',
      url: 'https://www.instagram.com/reel/abc123/',
      status: 'PENDING',
      addedById: 'user-123',
      title: null,
      summary: null,
      transcript: null,
      language: null,
      thumbnailUrl: null,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)
  })

  it('should return 201 with a valid Instagram URL', async () => {
    const req = makeRequest({ url: 'https://www.instagram.com/reel/abc123/' })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.reel).toBeDefined()
    expect(body.reel.id).toBe('reel-abc')
  })

  it('should return 400 with an invalid URL', async () => {
    const req = makeRequest({ url: 'not-a-url' })
    const res = await POST(req)

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it('should handle duplicate URLs gracefully', async () => {
    vi.mocked(prisma.reel.findUnique).mockResolvedValue({
      id: 'existing-reel',
      url: 'https://www.instagram.com/reel/abc123/',
      status: 'DONE',
    } as any)

    const req = makeRequest({ url: 'https://www.instagram.com/reel/abc123/' })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.reel.id).toBe('existing-reel')
    // Should NOT create a new reel
    expect(prisma.reel.create).not.toHaveBeenCalled()
  })

  it('should create a reel record with PENDING status', async () => {
    const req = makeRequest({ url: 'https://www.instagram.com/reel/abc123/' })
    await POST(req)

    expect(prisma.reel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'PENDING',
          addedById: 'user-123',
        }),
      })
    )
  })

  it('should enqueue a BullMQ processing job', async () => {
    const req = makeRequest({ url: 'https://www.instagram.com/reel/abc123/' })
    await POST(req)

    expect(addReelJob).toHaveBeenCalledWith('reel-abc')
  })
})
