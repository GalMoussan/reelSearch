import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T035 — User Attribution', () => {
  it('should reference addedBy in reel-card component', () => {
    const content = readFileSync(resolve(ROOT, 'src/components/reel-card.tsx'), 'utf-8')
    expect(content).toMatch(/addedBy/i)
  })

  it('should reference addedBy in reel-detail-modal component', () => {
    const content = readFileSync(resolve(ROOT, 'src/components/reel-detail-modal.tsx'), 'utf-8')
    expect(content).toMatch(/addedBy/i)
  })
})
