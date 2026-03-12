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

export async function embedAndStore(
  reelId: string,
  summaryText: string
): Promise<void> {
  if (!summaryText?.trim()) {
    return
  }

  const embedding = await generateEmbedding(summaryText)
  await storeEmbedding(reelId, embedding)
}
