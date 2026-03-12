import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T039 — Empty State', () => {
  it('should have an empty-state component', () => {
    const emptyStatePath = resolve(ROOT, 'src/components/empty-state.tsx')
    expect(existsSync(emptyStatePath)).toBe(true)
  })

  it('should support "initial" variant', () => {
    const content = readFileSync(resolve(ROOT, 'src/components/empty-state.tsx'), 'utf-8')
    expect(content).toMatch(/initial/i)
  })

  it('should support "filtered" variant', () => {
    const content = readFileSync(resolve(ROOT, 'src/components/empty-state.tsx'), 'utf-8')
    expect(content).toMatch(/filtered/i)
  })

  it('should use EmptyState in reel-grid', () => {
    const content = readFileSync(resolve(ROOT, 'src/components/reel-grid.tsx'), 'utf-8')
    expect(content).toMatch(/EmptyState/)
  })
})
