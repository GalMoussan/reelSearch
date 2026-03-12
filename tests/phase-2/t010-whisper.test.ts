import { describe, it, expect, vi } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('T010 — Whisper Transcription', () => {
  it('should export transcribe function from transcriber.ts', () => {
    const transcriberPath = resolve(ROOT, 'src/lib/pipeline/transcriber.ts')
    expect(existsSync(transcriberPath)).toBe(true)
    const content = readFileSync(transcriberPath, 'utf-8')
    expect(content).toContain('export')
    expect(content).toContain('transcribe')
  })

  it('should call Whisper API with the audio file', async () => {
    // TODO: Mock OpenAI Whisper API
    // Call transcribe with an audio file path
    // Verify the API is called with the correct file
    expect(true).toBe(false) // TODO: implement
  })

  it('should return transcript text and detected language', async () => {
    // TODO: Mock Whisper response with transcript + language
    // Verify return shape: { text: string, language: string }
    expect(true).toBe(false) // TODO: implement
  })

  it('should handle no-speech audio gracefully', async () => {
    // TODO: Mock Whisper returning empty/no-speech result
    // Verify it returns empty string without throwing
    expect(true).toBe(false) // TODO: implement
  })
})
