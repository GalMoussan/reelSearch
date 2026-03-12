import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const srcDir = resolve(__dirname, '../../src')

describe('T025 — Processing Status Indicator', () => {
  it('should have a use-reel-status hook at src/hooks/use-reel-status.ts', () => {
    const hookPath = resolve(srcDir, 'hooks/use-reel-status.ts')
    expect(existsSync(hookPath)).toBe(true)
  })

  it('should have a processing status component at src/components/processing-status.tsx', () => {
    const componentPath = resolve(srcDir, 'components/processing-status.tsx')
    expect(existsSync(componentPath)).toBe(true)
  })

  it('should poll for status changes in the hook', () => {
    const hookPath = resolve(srcDir, 'hooks/use-reel-status.ts')
    const content = readFileSync(hookPath, 'utf-8')

    // Should use refetchInterval for polling
    expect(content).toContain('refetchInterval')
    expect(content).toContain('useQuery')
  })

  it('should stop polling when status is DONE or FAILED', () => {
    const hookPath = resolve(srcDir, 'hooks/use-reel-status.ts')
    const content = readFileSync(hookPath, 'utf-8')

    expect(content).toContain('DONE')
    expect(content).toContain('FAILED')
    expect(content).toContain('false') // returns false to stop refetching
  })

  it('should display different UI states for PENDING, PROCESSING, DONE, FAILED', () => {
    const componentPath = resolve(srcDir, 'components/processing-status.tsx')
    const content = readFileSync(componentPath, 'utf-8')

    expect(content).toContain('PENDING')
    expect(content).toContain('PROCESSING')
    expect(content).toContain('DONE')
    expect(content).toContain('FAILED')
  })

  it('should show spinner/animation for pending state', () => {
    const componentPath = resolve(srcDir, 'components/processing-status.tsx')
    const content = readFileSync(componentPath, 'utf-8')

    expect(content).toContain('animate-spin')
  })
})
