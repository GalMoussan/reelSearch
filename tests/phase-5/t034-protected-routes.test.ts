import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T034 — Protected Routes Middleware', () => {
  it('should have middleware.ts at project root', () => {
    const middlewarePath = resolve(ROOT, 'src/middleware.ts')
    expect(existsSync(middlewarePath)).toBe(true)
  })

  it('should check for a session token cookie', () => {
    const content = readFileSync(resolve(ROOT, 'src/middleware.ts'), 'utf-8')
    // NextAuth uses session-token cookie for auth checks
    expect(content).toMatch(/session[_-]?token/i)
  })

  it('should redirect unauthenticated users to /login', () => {
    const content = readFileSync(resolve(ROOT, 'src/middleware.ts'), 'utf-8')
    expect(content).toMatch(/\/login/)
  })

  it('should exclude _next/static from the matcher config', () => {
    const content = readFileSync(resolve(ROOT, 'src/middleware.ts'), 'utf-8')
    expect(content).toMatch(/_next\/static/)
  })
})
