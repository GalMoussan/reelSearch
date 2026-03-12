import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T041 — Railway / Docker Configuration', () => {
  it('should have Dockerfile.worker at project root', () => {
    const dockerfilePath = resolve(ROOT, 'Dockerfile.worker')
    expect(existsSync(dockerfilePath)).toBe(true)
  })

  it('should install yt-dlp in Dockerfile.worker', () => {
    const content = readFileSync(resolve(ROOT, 'Dockerfile.worker'), 'utf-8')
    expect(content).toMatch(/yt-dlp/i)
  })

  it('should install ffmpeg in Dockerfile.worker', () => {
    const content = readFileSync(resolve(ROOT, 'Dockerfile.worker'), 'utf-8')
    expect(content).toMatch(/ffmpeg/i)
  })

  it('should have docker-compose.yml at project root', () => {
    const composePath = resolve(ROOT, 'docker-compose.yml')
    expect(existsSync(composePath)).toBe(true)
  })

  it('should define postgres service in docker-compose.yml', () => {
    const content = readFileSync(resolve(ROOT, 'docker-compose.yml'), 'utf-8')
    expect(content).toMatch(/postgres/i)
  })

  it('should define redis service in docker-compose.yml', () => {
    const content = readFileSync(resolve(ROOT, 'docker-compose.yml'), 'utf-8')
    expect(content).toMatch(/redis/i)
  })
})
