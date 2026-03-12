import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T003 — Prisma Schema & Models', () => {
  const schemaPath = resolve(ROOT, 'prisma/schema.prisma')

  it('should have schema.prisma containing Reel model', () => {
    expect(existsSync(schemaPath)).toBe(true)
    const content = readFileSync(schemaPath, 'utf-8')
    expect(content).toMatch(/model\s+Reel\s*\{/)
  })

  it('should have schema.prisma containing Tag model', () => {
    const content = readFileSync(schemaPath, 'utf-8')
    expect(content).toMatch(/model\s+Tag\s*\{/)
  })

  it('should have schema.prisma containing User model', () => {
    const content = readFileSync(schemaPath, 'utf-8')
    expect(content).toMatch(/model\s+User\s*\{/)
  })

  it('should have schema.prisma containing ReelStatus enum', () => {
    const content = readFileSync(schemaPath, 'utf-8')
    expect(content).toMatch(/enum\s+ReelStatus\s*\{/)
  })

  it('should export Prisma singleton from prisma.ts', async () => {
    const prismaPath = resolve(ROOT, 'src/lib/prisma.ts')
    expect(existsSync(prismaPath)).toBe(true)
    const content = readFileSync(prismaPath, 'utf-8')
    expect(content).toContain('export')
    expect(content).toContain('PrismaClient')
  })
})
