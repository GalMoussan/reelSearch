import { describe, it, expect } from 'vitest'
import { existsSync } from 'fs'
import { resolve } from 'path'

const srcDir = resolve(__dirname, '../../src')

describe('T032 — Tag Page (/tags/[name])', () => {
  it('should have a tag page at src/app/tags/[name]/page.tsx', () => {
    const pagePath = resolve(srcDir, 'app/tags/[name]/page.tsx')
    expect(existsSync(pagePath)).toBe(true)
  })

  it('should have a tag-reels component at src/app/tags/[name]/tag-reels.tsx', () => {
    const tagReelsPath = resolve(srcDir, 'app/tags/[name]/tag-reels.tsx')
    expect(existsSync(tagReelsPath)).toBe(true)
  })
})
