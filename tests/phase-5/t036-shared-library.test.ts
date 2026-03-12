import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T036 — Shared Library (Multi-User)', () => {
  it('should not filter reels by user in GET /api/reels', () => {
    const content = readFileSync(resolve(ROOT, 'src/app/api/reels/route.ts'), 'utf-8')
    // GET handler should fetch all reels, not filter by userId/addedBy in the where clause
    // We verify by checking the GET function exists and does NOT contain a userId filter
    expect(content).toMatch(/export\s+(async\s+)?function\s+GET/i)
    // The GET handler should not restrict by userId — it's a shared library
    const getHandlerMatch = content.match(/export\s+(async\s+)?function\s+GET[\s\S]*?(?=export\s+(async\s+)?function|$)/)
    if (getHandlerMatch) {
      const getHandler = getHandlerMatch[0]
      expect(getHandler).not.toMatch(/where[\s\S]*?userId/)
    }
  })

  it('should use getServerSession for auth check in reels route', () => {
    const content = readFileSync(resolve(ROOT, 'src/app/api/reels/route.ts'), 'utf-8')
    expect(content).toMatch(/getServerSession/i)
  })

  it('should have auth check in tags route', () => {
    const content = readFileSync(resolve(ROOT, 'src/app/api/tags/route.ts'), 'utf-8')
    expect(content).toMatch(/getServerSession|auth|session/i)
  })

  it('should have auth check in semantic search route', () => {
    const content = readFileSync(resolve(ROOT, 'src/app/api/search/semantic/route.ts'), 'utf-8')
    expect(content).toMatch(/getServerSession|auth|session/i)
  })
})
