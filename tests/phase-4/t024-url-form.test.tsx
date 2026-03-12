import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const srcDir = resolve(__dirname, '../../src')

describe('T024 — Reel URL Form', () => {
  it('should have a reel form component at src/components/reel-form.tsx', () => {
    const formPath = resolve(srcDir, 'components/reel-form.tsx')
    expect(existsSync(formPath)).toBe(true)
  })

  it('should POST to /api/reels on submit', () => {
    const formPath = resolve(srcDir, 'components/reel-form.tsx')
    const content = readFileSync(formPath, 'utf-8')

    expect(content).toContain('POST')
    expect(content).toContain('/api/reels')
  })

  it('should import reelUrlSchema for validation', () => {
    const formPath = resolve(srcDir, 'components/reel-form.tsx')
    const content = readFileSync(formPath, 'utf-8')

    expect(content).toContain('reelUrlSchema')
    expect(content).toMatch(/import.*reelUrlSchema/)
  })

  it('should include a URL input field', () => {
    const formPath = resolve(srcDir, 'components/reel-form.tsx')
    const content = readFileSync(formPath, 'utf-8')

    expect(content).toContain('type="url"')
  })

  it('should handle validation errors', () => {
    const formPath = resolve(srcDir, 'components/reel-form.tsx')
    const content = readFileSync(formPath, 'utf-8')

    expect(content).toContain('safeParse')
    expect(content).toContain('validationError')
  })

  it('should show success feedback after submit', () => {
    const formPath = resolve(srcDir, 'components/reel-form.tsx')
    const content = readFileSync(formPath, 'utf-8')

    // Should use toast for feedback
    expect(content).toContain('toast')
  })
})
