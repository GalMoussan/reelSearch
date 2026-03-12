import { describe, it, expect, vi } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T013 — Tag Normalizer', () => {
  it('should export normalizeTags function from tag-normalizer.ts', () => {
    const normalizerPath = resolve(ROOT, 'src/lib/pipeline/tag-normalizer.ts')
    expect(existsSync(normalizerPath)).toBe(true)
    const content = readFileSync(normalizerPath, 'utf-8')
    expect(content).toContain('export')
    expect(content).toContain('normalizeTags')
  })

  it('should lowercase all tags', async () => {
    // TODO: Call normalizeTags with ['React', 'NextJS', 'TypeScript']
    // Verify output tags are all lowercase
    expect(true).toBe(false) // TODO: implement
  })

  it('should remove leading/trailing spaces from tags', async () => {
    // TODO: Call normalizeTags with [' react ', '  nextjs', 'typescript  ']
    // Verify output tags have no surrounding spaces
    expect(true).toBe(false) // TODO: implement
  })

  it('should upsert tags to the database', async () => {
    // TODO: Mock Prisma tag.upsert
    // Call normalizeTags and verify upsert is called for each tag
    expect(true).toBe(false) // TODO: implement
  })

  it('should connect normalized tags to the reel record', async () => {
    // TODO: Mock Prisma reel.update with tags connect
    // Verify the reel is updated with tag connections
    expect(true).toBe(false) // TODO: implement
  })
})
