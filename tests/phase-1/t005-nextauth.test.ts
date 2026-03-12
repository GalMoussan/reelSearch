import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T005 — NextAuth Setup', () => {
  it('should export authOptions with Google provider from auth.ts', () => {
    const authPath = resolve(ROOT, 'src/lib/auth.ts')
    expect(existsSync(authPath)).toBe(true)
    const content = readFileSync(authPath, 'utf-8')
    expect(content).toContain('authOptions')
    expect(content).toContain('Google')
    expect(content).toContain('export')
  })

  it('should export GET and POST handlers from [...nextauth]/route.ts', () => {
    const routePath = resolve(ROOT, 'src/app/api/auth/[...nextauth]/route.ts')
    expect(existsSync(routePath)).toBe(true)
    const content = readFileSync(routePath, 'utf-8')
    expect(content).toMatch(/export\s*\{[^}]*GET/)
    expect(content).toMatch(/export\s*\{[^}]*POST/)
  })

  it('should export getServerSession helper from auth-utils.ts', () => {
    const utilsPath = resolve(ROOT, 'src/lib/auth-utils.ts')
    expect(existsSync(utilsPath)).toBe(true)
    const content = readFileSync(utilsPath, 'utf-8')
    expect(content).toContain('getServerSession')
    expect(content).toContain('export')
  })
})
