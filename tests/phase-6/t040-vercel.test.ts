import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T040 — Vercel Configuration', () => {
  it('should have vercel.json at project root', () => {
    const vercelPath = resolve(ROOT, 'vercel.json')
    expect(existsSync(vercelPath)).toBe(true)
  })

  it('should specify nextjs as the framework', () => {
    const content = readFileSync(resolve(ROOT, 'vercel.json'), 'utf-8')
    const config = JSON.parse(content)
    expect(config.framework).toBe('nextjs')
  })

  it('should have regions configured', () => {
    const content = readFileSync(resolve(ROOT, 'vercel.json'), 'utf-8')
    const config = JSON.parse(content)
    // Regions can be at top level or inside functions config
    const hasRegions = config.regions || config.functions?.['**/*']?.regions || JSON.stringify(config).includes('region')
    expect(hasRegions).toBeTruthy()
  })
})
