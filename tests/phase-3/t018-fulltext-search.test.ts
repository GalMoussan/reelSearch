import { describe, it, expect } from 'vitest'

describe('T018 — Full-Text Search', () => {
  it('should export a fullTextSearch function from the search service', () => {
    // TODO: import { fullTextSearch } from '@/lib/search' and verify it exists
    expect(true).toBe(false)
  })

  it('should use tsvector for transcript + summary search', () => {
    // TODO: verify fullTextSearch queries against tsvector columns
    expect(true).toBe(false)
  })

  it('should support English language queries', () => {
    // TODO: call fullTextSearch('cooking tips') and verify results
    expect(true).toBe(false)
  })

  it('should support Hebrew language queries', () => {
    // TODO: call fullTextSearch('מתכון') and verify results
    expect(true).toBe(false)
  })
})
