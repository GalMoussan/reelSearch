import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { generateEmbedding } from "@/services/embedder"

export interface SearchResult {
  id: string
  url: string
  title: string | null
  summary: string | null
  thumbnailUrl: string | null
  rank: number
}

export interface SemanticSearchResult extends SearchResult {
  similarity: number
}

/**
 * Sanitize a user query string for use with PostgreSQL to_tsquery.
 * Escapes special tsquery characters and joins words with AND logic.
 */
function sanitizeTsQuery(query: string): string {
  const sanitized = query
    .replace(/[&|!:*()'"\\]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join(" & ")

  return sanitized
}

/**
 * Full-text search over Reel transcript and summary fields.
 * Uses PostgreSQL tsvector/tsquery with the 'english' dictionary first,
 * falling back to 'simple' (useful for Hebrew and other non-English content).
 */
export async function fullTextSearch(
  query: string,
  options?: { limit?: number; offset?: number },
): Promise<SearchResult[]> {
  const limit = options?.limit ?? 20
  const offset = options?.offset ?? 0

  const tsQuery = sanitizeTsQuery(query)
  if (!tsQuery) {
    return []
  }

  // Try English dictionary first
  const englishResults = await prisma.$queryRaw<SearchResult[]>(
    Prisma.sql`
      SELECT
        r."id",
        r."url",
        r."title",
        r."summary",
        r."thumbnailUrl",
        ts_rank(
          to_tsvector('english', COALESCE(r."transcript", '') || ' ' || COALESCE(r."summary", '')),
          to_tsquery('english', ${tsQuery})
        ) AS rank
      FROM "Reel" r
      WHERE to_tsvector('english', COALESCE(r."transcript", '') || ' ' || COALESCE(r."summary", ''))
        @@ to_tsquery('english', ${tsQuery})
      ORDER BY rank DESC
      LIMIT ${limit} OFFSET ${offset}
    `,
  )

  if (englishResults.length > 0) {
    return englishResults
  }

  // Fallback to 'simple' dictionary for Hebrew / non-English support
  const simpleResults = await prisma.$queryRaw<SearchResult[]>(
    Prisma.sql`
      SELECT
        r."id",
        r."url",
        r."title",
        r."summary",
        r."thumbnailUrl",
        ts_rank(
          to_tsvector('simple', COALESCE(r."transcript", '') || ' ' || COALESCE(r."summary", '')),
          to_tsquery('simple', ${tsQuery})
        ) AS rank
      FROM "Reel" r
      WHERE to_tsvector('simple', COALESCE(r."transcript", '') || ' ' || COALESCE(r."summary", ''))
        @@ to_tsquery('simple', ${tsQuery})
      ORDER BY rank DESC
      LIMIT ${limit} OFFSET ${offset}
    `,
  )

  return simpleResults
}

/**
 * Semantic (vector similarity) search over Reel embeddings.
 * Generates an embedding for the query and uses pgvector cosine distance.
 */
export async function semanticSearch(
  query: string,
  options?: { limit?: number; threshold?: number },
): Promise<SemanticSearchResult[]> {
  const limit = options?.limit ?? 10
  const threshold = options?.threshold ?? 0.3

  const queryEmbedding = await generateEmbedding(query)
  const vectorString = `[${queryEmbedding.join(",")}]`

  const results = await prisma.$queryRaw<SemanticSearchResult[]>(
    Prisma.sql`
      SELECT
        r."id",
        r."url",
        r."title",
        r."summary",
        r."thumbnailUrl",
        0::float AS rank,
        1 - (r."embedding" <=> ${vectorString}::vector) AS similarity
      FROM "Reel" r
      WHERE r."embedding" IS NOT NULL
        AND 1 - (r."embedding" <=> ${vectorString}::vector) > ${threshold}
      ORDER BY similarity DESC
      LIMIT ${limit}
    `,
  )

  return results
}
