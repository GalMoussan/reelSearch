import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T001 — Project Initialization', () => {
  it('should have package.json with correct project name', () => {
    const pkgPath = resolve(ROOT, 'package.json')
    expect(existsSync(pkgPath)).toBe(true)
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    expect(pkg.name).toBe('reelsearch')
  })

  it('should have tsconfig.json with strict mode enabled', () => {
    const tsconfigPath = resolve(ROOT, 'tsconfig.json')
    expect(existsSync(tsconfigPath)).toBe(true)
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'))
    expect(tsconfig.compilerOptions?.strict).toBe(true)
  })

  it('should have src/app/layout.tsx', () => {
    const layoutPath = resolve(ROOT, 'src/app/layout.tsx')
    expect(existsSync(layoutPath)).toBe(true)
  })

  it('should have all essential Next.js files for a successful build', () => {
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'next.config.mjs',
      'src/app/layout.tsx',
      'src/app/page.tsx',
    ]
    for (const file of requiredFiles) {
      expect(existsSync(resolve(ROOT, file))).toBe(true)
    }
  })
})
