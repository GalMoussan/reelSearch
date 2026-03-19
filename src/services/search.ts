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
 * Run a full-text search query against Reel content using the specified
 * PostgreSQL text-search dictionary.
 */
function ftsQuery(
  dictionary: "english" | "simple",
  tsQuery: string,
  limit: number,
  offset: number,
): ReturnType<typeof prisma.$queryRaw<SearchResult[]>> {
  // Prisma.sql doesn't support interpolating identifiers, so we use
  // Prisma.raw for the dictionary name (a fixed literal, not user input).
  const dict = Prisma.raw(`'${dictionary}'`)

  return prisma.$queryRaw<SearchResult[]>(
    Prisma.sql`
      SELECT
        r."id",
        r."url",
        r."title",
        r."summary",
        r."thumbnailUrl",
        ts_rank(
          to_tsvector(${dict},
            COALESCE(r."title", '') || ' ' || COALESCE(r."transcript", '') || ' ' || COALESCE(r."summary", '')
            || ' ' || COALESCE((SELECT string_agg(t."name", ' ') FROM "_ReelToTag" rt JOIN "Tag" t ON t.id = rt."B" WHERE rt."A" = r.id), '')
          ),
          to_tsquery(${dict}, ${tsQuery})
        ) AS rank
      FROM "Reel" r
      WHERE to_tsvector(${dict},
            COALESCE(r."title", '') || ' ' || COALESCE(r."transcript", '') || ' ' || COALESCE(r."summary", '')
            || ' ' || COALESCE((SELECT string_agg(t."name", ' ') FROM "_ReelToTag" rt JOIN "Tag" t ON t.id = rt."B" WHERE rt."A" = r.id), '')
          )
        @@ to_tsquery(${dict}, ${tsQuery})
      ORDER BY rank DESC
      LIMIT ${limit} OFFSET ${offset}
    `,
  )
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

  const englishResults = await ftsQuery("english", tsQuery, limit, offset)

  if (englishResults.length > 0) {
    return englishResults
  }

  return ftsQuery("simple", tsQuery, limit, offset)
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
