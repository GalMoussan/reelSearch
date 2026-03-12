import { createReadStream } from "fs"
import OpenAI from "openai"

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export type TranscriptionResult = {
  text: string
  language: "en" | "he" | "mixed" | "none"
}

type DetectedLanguage = "en" | "he" | "mixed" | "none"

const LANGUAGE_MAP: Record<string, "en" | "he"> = {
  english: "en",
  hebrew: "he",
}

function mapLanguage(whisperLanguage: string | undefined): DetectedLanguage {
  if (!whisperLanguage) {
    return "none"
  }

  const normalized = whisperLanguage.toLowerCase()
  return LANGUAGE_MAP[normalized] ?? "none"
}

export async function transcribe(
  audioPath: string
): Promise<TranscriptionResult> {
  try {
    const fileStream = createReadStream(audioPath)

    const response = await getOpenAI().audio.transcriptions.create({
      model: "whisper-1",
      file: fileStream,
      response_format: "verbose_json",
    })

    const text = response.text?.trim() ?? ""

    if (text.length === 0) {
      return { text: "", language: "none" }
    }

    const language = mapLanguage(response.language)

    return { text, language }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error)

    // If Whisper returns an error indicating no speech, treat gracefully
    if (
      message.includes("no speech") ||
      message.includes("audio is too short")
    ) {
      return { text: "", language: "none" }
    }

    throw new Error(`Transcription failed: ${message}`)
  }
}
