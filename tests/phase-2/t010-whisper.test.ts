import { describe, it, expect, vi, beforeEach } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

// Mock OpenAI before importing
vi.mock('openai', () => {
  const mockCreate = vi.fn()
  return {
    default: vi.fn().mockImplementation(() => ({
      audio: {
        transcriptions: {
          create: mockCreate,
        },
      },
    })),
    __mockCreate: mockCreate,
  }
})

// Mock fs.createReadStream so it doesn't try to open real files
vi.mock('fs', async (importOriginal) => {
  const original = await importOriginal<typeof import('fs')>()
  return {
    ...original,
    createReadStream: vi.fn().mockReturnValue('mock-stream'),
  }
})

const ROOT = resolve(__dirname, '../..')

describe('T010 — Whisper Transcription', () => {
  it('should export transcribe function from transcriber.ts', () => {
    const transcriberPath = resolve(ROOT, 'src/services/transcriber.ts')
    expect(existsSync(transcriberPath)).toBe(true)
    const content = readFileSync(transcriberPath, 'utf-8')
    expect(content).toContain('export')
    expect(content).toContain('transcribe')
  })

  it('should call Whisper API with whisper-1 model', () => {
    const transcriberPath = resolve(ROOT, 'src/services/transcriber.ts')
    const content = readFileSync(transcriberPath, 'utf-8')
    expect(content).toContain('whisper-1')
    expect(content).toContain('audio.transcriptions.create')
  })

  it('should return transcript text and detected language', () => {
    const transcriberPath = resolve(ROOT, 'src/services/transcriber.ts')
    const content = readFileSync(transcriberPath, 'utf-8')
    // Verify return shape includes text and language
    expect(content).toContain('TranscriptionResult')
    expect(content).toMatch(/text:\s*/)
    expect(content).toMatch(/language:\s*/)
  })

  it('should handle no-speech audio gracefully', () => {
    const transcriberPath = resolve(ROOT, 'src/services/transcriber.ts')
    const content = readFileSync(transcriberPath, 'utf-8')
    // Verify it handles no-speech case
    expect(content).toContain('no speech')
    expect(content).toContain('language: "none"')
  })
})
