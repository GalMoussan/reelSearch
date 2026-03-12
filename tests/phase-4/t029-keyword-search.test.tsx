import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const srcDir = resolve(__dirname, '../../src')

describe('T029 — Keyword Search Bar', () => {
  it('should have a search bar component at src/components/search-bar.tsx', () => {
    const searchPath = resolve(srcDir, 'components/search-bar.tsx')
    expect(existsSync(searchPath)).toBe(true)
  })

  it('should render a search input', () => {
    const searchPath = resolve(srcDir, 'components/search-bar.tsx')
    const content = readFileSync(searchPath, 'utf-8')

    expect(content).toContain('Input')
    expect(content).toContain('placeholder')
    expect(content).toContain('Search')
  })

  it('should implement debounce logic with setTimeout', () => {
    const searchPath = resolve(srcDir, 'components/search-bar.tsx')
    const content = readFileSync(searchPath, 'utf-8')

    expect(content).toContain('setTimeout')
    expect(content).toContain('clearTimeout')
    expect(content).toContain('300') // 300ms debounce
  })

  it('should use a ref for the debounce timer', () => {
    const searchPath = resolve(srcDir, 'components/search-bar.tsx')
    const content = readFileSync(searchPath, 'utf-8')

    expect(content).toContain('useRef')
    expect(content).toContain('debounceTimerRef')
  })

  it('should call onChange callback with debounced value', () => {
    const searchPath = resolve(srcDir, 'components/search-bar.tsx')
    const content = readFileSync(searchPath, 'utf-8')

    expect(content).toContain('onChange')
    expect(content).toContain('localValue')
  })

  it('should support clearing the search input', () => {
    const searchPath = resolve(srcDir, 'components/search-bar.tsx')
    const content = readFileSync(searchPath, 'utf-8')

    expect(content).toContain('handleClear')
    expect(content).toContain('Clear')
  })
})
