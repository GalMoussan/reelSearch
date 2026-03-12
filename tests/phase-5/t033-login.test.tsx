import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T033 — Login Page', () => {
  it('should have a login page at src/app/login/page.tsx', () => {
    const loginPath = resolve(ROOT, 'src/app/login/page.tsx')
    expect(existsSync(loginPath)).toBe(true)
  })

  it('should reference signIn for authentication', () => {
    const content = readFileSync(resolve(ROOT, 'src/app/login/page.tsx'), 'utf-8')
    expect(content).toMatch(/signIn/i)
  })

  it('should reference google as an auth provider', () => {
    const content = readFileSync(resolve(ROOT, 'src/app/login/page.tsx'), 'utf-8')
    expect(content.toLowerCase()).toContain('google')
  })

  it('should render a "Sign in with Google" label', () => {
    const content = readFileSync(resolve(ROOT, 'src/app/login/page.tsx'), 'utf-8')
    expect(content).toMatch(/Sign\s+in\s+with\s+Google/i)
  })
})
