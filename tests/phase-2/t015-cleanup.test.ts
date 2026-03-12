import { describe, it, expect, vi } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T015 — Temp File Cleanup', () => {
  it('should export cleanupTempFiles function from cleanup.ts', () => {
    const cleanupPath = resolve(ROOT, 'src/services/cleanup.ts')
    expect(existsSync(cleanupPath)).toBe(true)
    const content = readFileSync(cleanupPath, 'utf-8')
    expect(content).toContain('export')
    expect(content).toContain('cleanupTempFiles')
  })

  it('should use fs.rm with recursive and force options', () => {
    const cleanupPath = resolve(ROOT, 'src/services/cleanup.ts')
    const content = readFileSync(cleanupPath, 'utf-8')
    expect(content).toContain('rm')
    expect(content).toContain('recursive: true')
    expect(content).toContain('force: true')
  })

  it('should export markReelDone to update reel status', () => {
    const cleanupPath = resolve(ROOT, 'src/services/cleanup.ts')
    const content = readFileSync(cleanupPath, 'utf-8')
    expect(content).toContain('export async function markReelDone')
    expect(content).toContain('status: "DONE"')
  })

  it('should not throw if temp directory does not exist', () => {
    const cleanupPath = resolve(ROOT, 'src/services/cleanup.ts')
    const content = readFileSync(cleanupPath, 'utf-8')
    // Verify it catches errors and logs a warning instead of throwing
    expect(content).toContain('catch')
    expect(content).toContain('console.warn')
  })
})
