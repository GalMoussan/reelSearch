import OpenAI from "openai"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

const EMBEDDING_MODEL = "text-embedding-3-small"

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text.trim()) {
    throw new Error("Cannot generate embedding for empty text")
  }

  const response = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  })

  return response.data[0].embedding
}

export async function storeEmbedding(
  reelId: string,
  embedding: number[]
): Promise<void> {
  const vectorString = `[${embedding.join(",")}]`

  await prisma.$executeRaw(
    Prisma.sql`UPDATE "Reel" SET embedding = ${vectorString}::vector WHERE id = ${reelId}`
  )
}

export function isEmbeddingEnabled(): boolean {
  return Boolean(
    process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY !== "sk-your-openai-key",
  )
}

export async function embedAndStore(
  reelId: string,
  text: string
): Promise<void> {
  if (!isEmbeddingEnabled()) {
    console.warn("[Embedder] OPENAI_API_KEY not set, skipping embedding generation")
    return
  }

  if (!text?.trim()) {
    return
  }

  // Truncate to ~8000 chars to stay within embedding model token limits
  const truncated = text.slice(0, 8000)

  const embedding = await generateEmbedding(truncated)
  await storeEmbedding(reelId, embedding)
}
