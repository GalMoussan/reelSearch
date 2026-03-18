import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { fullTextSearch, semanticSearch } from "@/services/search"
import type { SearchResult, SemanticSearchResult } from "@/services/search"

function getAnthropic() {
  return new Anthropic()
}

const searchPlanSchema = z.object({
  keywords: z.array(z.string()),
  tags: z.array(z.string()),
  semanticQuery: z.string(),
  reasoning: z.string(),
})
export type SearchPlan = z.infer<typeof searchPlanSchema>

export interface NLSearchResult {
  data: SearchResult[]
  reasoning: string
  searchPlan: SearchPlan
}

const SYSTEM_PROMPT = `You are a search query decomposer. Given a natural language query about Instagram Reels, decompose it into structured search components. Return ONLY valid JSON with this structure:
{
  "keywords": ["keyword1", "keyword2"],
  "tags": ["tag1", "tag2"],
  "semanticQuery": "rephrased query for semantic search",
  "reasoning": "brief explanation of your interpretation"
}
keywords: exact terms for full-text search
tags: normalized tag names (lowercase, no spaces) that might match existing tags
semanticQuery: a clean sentence capturing the user's intent for embedding-based search`

async function decompose(query: string): Promise<SearchPlan> {
  const message = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: query }],
  })

  const text =
    message.content[0].type === "text" ? message.content[0].text : ""

  // Strip markdown code fences if present
  const cleanedText = text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleanedText)
  } catch {
    throw new Error(
      `Failed to parse search plan as JSON: ${cleanedText.slice(0, 200)}`,
    )
  }

  const result = searchPlanSchema.safeParse(parsed)

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ")
    throw new Error(`Search plan validation failed: ${issues}`)
  }

  return result.data
}

function deduplicateResults(
  resultSets: SearchResult[][],
): SearchResult[] {
  const seen = new Map<string, SearchResult>()

  // Process in order: semantic results first (highest priority), then others
  for (const results of resultSets) {
    for (const result of results) {
      if (!seen.has(result.id)) {
        seen.set(result.id, result)
      }
    }
  }

  return Array.from(seen.values())
}

export async function naturalLanguageSearch(
  query: string,
): Promise<NLSearchResult> {
  let plan: SearchPlan

  try {
    plan = await decompose(query)
  } catch (error) {
    console.error("Claude API error, falling back to full-text search:", error)

    const fallbackResults = await fullTextSearch(query)
    return {
      data: fallbackResults,
      reasoning: "Fallback: used direct full-text search due to AI decomposition error.",
      searchPlan: {
        keywords: [query],
        tags: [],
        semanticQuery: "",
        reasoning: "Fallback: AI decomposition unavailable.",
      },
    }
  }

  const searches: Promise<SearchResult[]>[] = []

  // 1. Full-text search on keywords
  if (plan.keywords.length > 0) {
    searches.push(fullTextSearch(plan.keywords.join(" ")))
  }

  // 2. Tag-based search
  if (plan.tags.length > 0) {
    searches.push(
      prisma.reel
        .findMany({
          where: {
            tags: {
              some: {
                name: { in: plan.tags },
              },
            },
          },
          select: {
            id: true,
            url: true,
            title: true,
            summary: true,
            thumbnailUrl: true,
          },
        })
        .then((reels) =>
          reels.map((r) => ({ ...r, rank: 0 })),
        ),
    )
  }

  // 3. Semantic search
  if (plan.semanticQuery) {
    searches.push(
      semanticSearch(plan.semanticQuery).then(
        (results: SemanticSearchResult[]) =>
          results.map((r) => ({
            id: r.id,
            url: r.url,
            title: r.title,
            summary: r.summary,
            thumbnailUrl: r.thumbnailUrl,
            rank: r.rank,
          })),
      ),
    )
  }

  const settled = await Promise.allSettled(searches)

  // Collect results: semantic first (last search added), then others
  const allResultSets: SearchResult[][] = []

  // Reverse so semantic results (added last) come first for dedup priority
  for (const result of [...settled].reverse()) {
    if (result.status === "fulfilled") {
      allResultSets.push(result.value)
    } else {
      console.error("Search leg failed:", result.reason)
    }
  }

  const merged = deduplicateResults(allResultSets)

  return {
    data: merged,
    reasoning: plan.reasoning,
    searchPlan: plan,
  }
}
