import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T042 — Supabase Storage Client', () => {
  it('should have supabase.ts in src/lib/', () => {
    const supabasePath = resolve(ROOT, 'src/lib/supabase.ts')
    expect(existsSync(supabasePath)).toBe(true)
  })

  it('should export an uploadFile function', () => {
    const content = readFileSync(resolve(ROOT, 'src/lib/supabase.ts'), 'utf-8')
    expect(content).toMatch(/export\s+(async\s+)?function\s+uploadFile|export\s+const\s+uploadFile/)
  })

  it('should create a Supabase client', () => {
    const content = readFileSync(resolve(ROOT, 'src/lib/supabase.ts'), 'utf-8')
    expect(content).toMatch(/createClient/i)
  })
})
