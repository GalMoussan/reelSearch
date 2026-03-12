import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const srcDir = resolve(__dirname, '../../src')

describe('T030 — Natural Language Search UI', () => {
  it('should have an NL search component at src/components/nl-search.tsx', () => {
    const nlPath = resolve(srcDir, 'components/nl-search.tsx')
    expect(existsSync(nlPath)).toBe(true)
  })

  it('should call /api/search/nl endpoint', () => {
    const nlPath = resolve(srcDir, 'components/nl-search.tsx')
    const content = readFileSync(nlPath, 'utf-8')

    expect(content).toContain('/api/search/nl')
    expect(content).toContain('POST')
  })

  it('should display AI reasoning alongside results', () => {
    const nlPath = resolve(srcDir, 'components/nl-search.tsx')
    const content = readFileSync(nlPath, 'utf-8')

    expect(content).toContain('reasoning')
    expect(content).toContain('AI Reasoning')
  })

  it('should have a mode toggle between keyword and AI search', () => {
    const nlPath = resolve(srcDir, 'components/nl-search.tsx')
    const content = readFileSync(nlPath, 'utf-8')

    expect(content).toContain('isNLMode')
    expect(content).toContain('Keyword')
    expect(content).toContain('AI Search')
  })

  it('should show loading state while AI is thinking', () => {
    const nlPath = resolve(srcDir, 'components/nl-search.tsx')
    const content = readFileSync(nlPath, 'utf-8')

    expect(content).toContain('isPending')
    expect(content).toContain('AI is thinking')
  })

  it('should render search plan details (keywords, tags, semantic query)', () => {
    const nlPath = resolve(srcDir, 'components/nl-search.tsx')
    const content = readFileSync(nlPath, 'utf-8')

    expect(content).toContain('searchPlan')
    expect(content).toContain('keywords')
    expect(content).toContain('semanticQuery')
  })
})
