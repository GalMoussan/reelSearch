import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T002 — Tailwind CSS Setup', () => {
  it('should have tailwind.config.ts', () => {
    const configPath = resolve(ROOT, 'tailwind.config.ts')
    expect(existsSync(configPath)).toBe(true)
  })

  it('should have globals.css containing CSS variables', () => {
    const cssPath = resolve(ROOT, 'src/app/globals.css')
    expect(existsSync(cssPath)).toBe(true)
    const content = readFileSync(cssPath, 'utf-8')
    expect(content).toContain('--')
    expect(content).toContain(':root')
  })

  it('should have components/ui directory', () => {
    const uiDir = resolve(ROOT, 'src/components/ui')
    expect(existsSync(uiDir)).toBe(true)
  })
})
