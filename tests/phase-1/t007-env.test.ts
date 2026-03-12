import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'REDIS_URL',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
]

describe('T007 — Environment Configuration', () => {
  it('should have .env.example containing all 11 required vars', () => {
    const envExamplePath = resolve(ROOT, '.env.example')
    expect(existsSync(envExamplePath)).toBe(true)
    const content = readFileSync(envExamplePath, 'utf-8')

    for (const envVar of REQUIRED_ENV_VARS) {
      expect(content).toContain(envVar)
    }
  })

  it('should export Zod validation schema from env.ts', () => {
    const envPath = resolve(ROOT, 'src/lib/env.ts')
    expect(existsSync(envPath)).toBe(true)
    const content = readFileSync(envPath, 'utf-8')
    expect(content).toContain('export')
    expect(content).toContain('z.')
  })

  it('should validate all required environment variables in env.ts', () => {
    const envPath = resolve(ROOT, 'src/lib/env.ts')
    const content = readFileSync(envPath, 'utf-8')

    for (const envVar of REQUIRED_ENV_VARS) {
      expect(content).toContain(envVar)
    }
  })
})
