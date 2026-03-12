import { describe, it, expect, vi } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T014 — Embedding Generation', () => {
  it('should export generateEmbedding and storeEmbedding from embedder.ts', () => {
    const embedderPath = resolve(ROOT, 'src/services/embedder.ts')
    expect(existsSync(embedderPath)).toBe(true)
    const content = readFileSync(embedderPath, 'utf-8')
    expect(content).toContain('export')
    expect(content).toContain('generateEmbedding')
    expect(content).toContain('storeEmbedding')
  })

  it('should use OpenAI embeddings API with text-embedding model', () => {
    const embedderPath = resolve(ROOT, 'src/services/embedder.ts')
    const content = readFileSync(embedderPath, 'utf-8')
    expect(content).toContain('embeddings.create')
    expect(content).toContain('text-embedding')
  })

  it('should store the vector in the database via raw SQL', () => {
    const embedderPath = resolve(ROOT, 'src/services/embedder.ts')
    const content = readFileSync(embedderPath, 'utf-8')
    expect(content).toContain('$executeRaw')
    expect(content).toContain('::vector')
    expect(content).toContain('UPDATE')
  })

  it('should export embedAndStore convenience function', () => {
    const embedderPath = resolve(ROOT, 'src/services/embedder.ts')
    const content = readFileSync(embedderPath, 'utf-8')
    expect(content).toContain('export async function embedAndStore')
  })
})
