import { prisma } from "@/lib/prisma"

/**
 * Normalize a single tag string:
 * - Lowercase
 * - Trim whitespace
 * - Remove leading #
 * - Remove spaces (compound words)
 * - Strip special characters except Hebrew letters and basic alphanumeric
 */
export function normalizeTag(tag: string): string {
  const trimmed = tag.trim().toLowerCase()
  const withoutHash = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed
  const withoutSpaces = withoutHash.replace(/\s+/g, "")
  const cleaned = withoutSpaces.replace(/[^a-z0-9\u0590-\u05FF]/g, "")
  return cleaned
}

interface ReelMetadata {
  readonly title: string
  readonly summary: string
  readonly transcript: string
  readonly language: string
}

/**
 * Normalize tags, upsert them into the Tag table, and connect them to the reel.
 * Also updates reel metadata (title, summary, transcript, language).
 * Runs inside a Prisma transaction for atomicity.
 */
export async function normalizeTags(
  reelId: string,
  tags: readonly string[],
  metadata: ReelMetadata
): Promise<void> {
  const normalizedTags = tags.map(normalizeTag)

  const uniqueTags = [...new Set(normalizedTags.filter((t) => t.length > 0))]

  // Upsert tags outside the transaction to avoid timeout on Supabase pooler
  const tagRecords = []
  for (const name of uniqueTags) {
    const tag = await prisma.tag.upsert({
      where: { name },
      create: { name },
      update: {},
    })
    tagRecords.push(tag)
  }

  // Update reel metadata and connect tags
  await prisma.reel.update({
    where: { id: reelId },
    data: {
      title: metadata.title,
      summary: metadata.summary,
      transcript: metadata.transcript,
      language: metadata.language,
      tags: {
        set: tagRecords.map((tag) => ({ id: tag.id })),
      },
    },
  })
}
