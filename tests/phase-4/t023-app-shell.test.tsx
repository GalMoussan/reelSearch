import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const srcDir = resolve(__dirname, '../../src')

describe('T023 — App Shell / Header', () => {
  it('should have a header component at src/components/layout/header.tsx', () => {
    const headerPath = resolve(srcDir, 'components/layout/header.tsx')
    expect(existsSync(headerPath)).toBe(true)
  })

  it('should have a mobile nav component at src/components/layout/mobile-nav.tsx', () => {
    const mobileNavPath = resolve(srcDir, 'components/layout/mobile-nav.tsx')
    expect(existsSync(mobileNavPath)).toBe(true)
  })

  it('should have a providers component at src/components/providers.tsx', () => {
    const providersPath = resolve(srcDir, 'components/providers.tsx')
    expect(existsSync(providersPath)).toBe(true)
  })

  it('should import Providers and Header in the root layout', () => {
    const layoutPath = resolve(srcDir, 'app/layout.tsx')
    expect(existsSync(layoutPath)).toBe(true)

    const content = readFileSync(layoutPath, 'utf-8')
    expect(content).toContain('Providers')
    expect(content).toContain('Header')
    expect(content).toMatch(/import.*Providers.*from/)
    expect(content).toMatch(/import.*Header.*from/)
  })

  it('should wrap children with Providers and include Header in root layout', () => {
    const layoutPath = resolve(srcDir, 'app/layout.tsx')
    const content = readFileSync(layoutPath, 'utf-8')

    // Verify the JSX structure wraps children in Providers and includes Header
    expect(content).toContain('<Providers>')
    expect(content).toContain('<Header')
  })
})
