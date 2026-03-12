import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"

function getAnthropic() {
  return new Anthropic()
}

const analysisSchema = z.object({
  tags: z.array(z.string()).min(20),
  summary: z.string().min(1),
  title: z.string().min(1),
  language: z.enum(["en", "he", "mixed", "none"]),
})

export type AnalysisResult = z.infer<typeof analysisSchema>

const SYSTEM_PROMPT = `You are an expert visual content analyzer. You will receive:
- A series of keyframe images from an Instagram Reel
- The audio transcript (if available)

Your job is to return a JSON object with exactly this structure:
{
  "tags": ["tag1", "tag2", ...],
  "summary": "...",
  "title": "...",
  "language": "en" | "he" | "mixed" | "none"
}

Tag rules:
- Cover ALL dimensions: visuals, people, behavior, topic, mood, sensitive content, format, language, setting, and emotion.
- Do NOT filter or censor. If content is racist, tag it #racist. If it contains nudity, tag it #nsfw. Accuracy over moderation.
- Use compound words for specificity: drunkman, babycat, streetfight
- Include Hebrew tags when content is Israeli or Hebrew-language
- Minimum 20 tags. More is better. Aim for 30+.
- Return ONLY valid JSON. No preamble, no markdown.`

const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

function isRetryableError(error: unknown): boolean {
  if (error instanceof Anthropic.APIError) {
    return error.status === 429 || error.status >= 500
  }
  return false
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function callWithRetry(
  frames: string[],
  transcript: string
): Promise<string> {
  const content: Anthropic.MessageCreateParams["messages"][0]["content"] = []

  for (const frame of frames) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: frame,
      },
    })
  }

  content.push({
    type: "text",
    text: transcript
      ? `Audio transcript:\n${transcript}`
      : "No audio transcript available.",
  })

  let lastError: unknown

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await getAnthropic().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content }],
      })

      const textBlock = response.content.find(
        (block) => block.type === "text"
      )

      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text content in Claude response")
      }

      return textBlock.text
    } catch (error: unknown) {
      lastError = error

      if (!isRetryableError(error)) {
        throw error
      }

      if (attempt < MAX_RETRIES - 1) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt)
        await delay(delayMs)
      }
    }
  }

  throw lastError
}

export async function analyzeReel(
  frames: string[],
  transcript: string
): Promise<AnalysisResult> {
  const rawText = await callWithRetry(frames, transcript)

  let parsed: unknown
  try {
    parsed = JSON.parse(rawText)
  } catch {
    throw new Error(
      `Failed to parse Claude response as JSON: ${rawText.slice(0, 200)}`
    )
  }

  const result = analysisSchema.safeParse(parsed)

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ")
    throw new Error(`Analysis response validation failed: ${issues}`)
  }

  return result.data
}
