import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T043 — README Documentation', () => {
  it('should have README.md at project root', () => {
    const readmePath = resolve(ROOT, 'README.md')
    expect(existsSync(readmePath)).toBe(true)
  })

  it('should contain setup instructions', () => {
    const content = readFileSync(resolve(ROOT, 'README.md'), 'utf-8')
    expect(content).toMatch(/Quick\s+Start|Getting\s+Started/i)
  })

  it('should list Node.js as a prerequisite', () => {
    const content = readFileSync(resolve(ROOT, 'README.md'), 'utf-8')
    expect(content).toMatch(/Node\.?js/i)
  })

  it('should list pnpm as a prerequisite', () => {
    const content = readFileSync(resolve(ROOT, 'README.md'), 'utf-8')
    expect(content).toMatch(/pnpm/i)
  })

  it('should document environment variables', () => {
    const content = readFileSync(resolve(ROOT, 'README.md'), 'utf-8')
    expect(content).toMatch(/environment\s+variables|\.env/i)
  })
})
