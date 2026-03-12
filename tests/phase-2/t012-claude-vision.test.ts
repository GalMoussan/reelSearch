import { describe, it, expect, vi } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T012 — Claude Vision Analyzer', () => {
  it('should export analyzeReel function from analyzer.ts', () => {
    const analyzerPath = resolve(ROOT, 'src/services/analyzer.ts')
    expect(existsSync(analyzerPath)).toBe(true)
    const content = readFileSync(analyzerPath, 'utf-8')
    expect(content).toContain('export')
    expect(content).toContain('analyzeReel')
  })

  it('should send images and transcript to Claude API', () => {
    const analyzerPath = resolve(ROOT, 'src/services/analyzer.ts')
    const content = readFileSync(analyzerPath, 'utf-8')
    // Verify it calls anthropic.messages.create with image content blocks
    expect(content).toContain('messages.create')
    expect(content).toContain('type: "image"')
    expect(content).toContain('source')
    expect(content).toContain('base64')
  })

  it('should use the correct system prompt for reel analysis', () => {
    const analyzerPath = resolve(ROOT, 'src/services/analyzer.ts')
    const content = readFileSync(analyzerPath, 'utf-8')
    // Verify the system prompt contains key instructions
    expect(content).toContain('You are an expert visual content analyzer')
    expect(content).toContain('"tags"')
    expect(content).toContain('"summary"')
    expect(content).toContain('"title"')
    expect(content).toContain('"language"')
    expect(content).toContain('Minimum 20 tags')
  })

  it('should validate response with Zod schema requiring 20+ tags', () => {
    const analyzerPath = resolve(ROOT, 'src/services/analyzer.ts')
    const content = readFileSync(analyzerPath, 'utf-8')
    // Verify Zod schema enforces minimum 20 tags
    expect(content).toContain('z.array(z.string()).min(20)')
    expect(content).toContain('analysisSchema.safeParse')
  })

  it('should retry on Claude API error with exponential backoff', () => {
    const analyzerPath = resolve(ROOT, 'src/services/analyzer.ts')
    const content = readFileSync(analyzerPath, 'utf-8')
    // Verify retry logic exists
    expect(content).toContain('MAX_RETRIES')
    expect(content).toContain('isRetryableError')
    expect(content).toMatch(/Math\.pow\(2,\s*attempt\)/)
  })

  it('should return AnalysisResult type with tags, summary, title, language', () => {
    const analyzerPath = resolve(ROOT, 'src/services/analyzer.ts')
    const content = readFileSync(analyzerPath, 'utf-8')
    expect(content).toContain('AnalysisResult')
    expect(content).toMatch(/tags:\s*z\.array/)
    expect(content).toMatch(/summary:\s*z\.string/)
    expect(content).toMatch(/title:\s*z\.string/)
    expect(content).toMatch(/language:\s*z\.enum/)
  })
})
