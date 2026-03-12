import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T004 — pgvector Extension', () => {
  it('should have schema.prisma containing vector(1536) field', () => {
    const schemaPath = resolve(ROOT, 'prisma/schema.prisma')
    expect(existsSync(schemaPath)).toBe(true)
    const content = readFileSync(schemaPath, 'utf-8')
    expect(content).toContain('vector(1536)')
  })

  it('should have a migration file that enables the pgvector extension', () => {
    const migrationsDir = resolve(ROOT, 'prisma/migrations')
    expect(existsSync(migrationsDir)).toBe(true)

    const migrations = readdirSync(migrationsDir, { recursive: true })
      .map(String)
      .filter((f) => f.endsWith('.sql'))

    expect(migrations.length).toBeGreaterThan(0)

    const hasVectorExtension = migrations.some((file) => {
      const content = readFileSync(resolve(migrationsDir, file), 'utf-8')
      return content.includes('vector') && content.includes('CREATE EXTENSION')
    })

    expect(hasVectorExtension).toBe(true)
  })
})
