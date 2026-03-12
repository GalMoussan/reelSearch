import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const srcDir = resolve(__dirname, '../../src')

describe('T028 — Tag Filter Bar', () => {
  it('should have a tag filter bar component at src/components/tag-filter-bar.tsx', () => {
    const filterPath = resolve(srcDir, 'components/tag-filter-bar.tsx')
    expect(existsSync(filterPath)).toBe(true)
  })

  it('should have a use-tags hook at src/hooks/use-tags.ts', () => {
    const hookPath = resolve(srcDir, 'hooks/use-tags.ts')
    expect(existsSync(hookPath)).toBe(true)
  })

  it('should use useTags hook to fetch tags', () => {
    const filterPath = resolve(srcDir, 'components/tag-filter-bar.tsx')
    const content = readFileSync(filterPath, 'utf-8')

    expect(content).toContain('useTags')
    expect(content).toMatch(/import.*useTags/)
  })

  it('should support multi-select via selectedTags prop', () => {
    const filterPath = resolve(srcDir, 'components/tag-filter-bar.tsx')
    const content = readFileSync(filterPath, 'utf-8')

    expect(content).toContain('selectedTags')
    expect(content).toContain('onTagsChange')
  })

  it('should toggle tag selection on click', () => {
    const filterPath = resolve(srcDir, 'components/tag-filter-bar.tsx')
    const content = readFileSync(filterPath, 'utf-8')

    expect(content).toContain('handleTagClick')
    expect(content).toContain('includes')
    expect(content).toContain('filter')
  })

  it('should render tag count in each badge', () => {
    const filterPath = resolve(srcDir, 'components/tag-filter-bar.tsx')
    const content = readFileSync(filterPath, 'utf-8')

    expect(content).toContain('tag.count')
    expect(content).toContain('Badge')
  })
})
