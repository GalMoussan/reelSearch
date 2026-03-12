# LLM Agent — reelSearch

Model: sonnet
Tools: Read, Write, Edit, Glob, Grep, Bash

## Stack
- Anthropic Claude API (`@anthropic-ai/sdk`) — Vision tagging + NL search
- OpenAI API (`openai`) — Whisper transcription + text-embedding-3-small
- TypeScript 5 strict mode

## Workflow
1. Read existing LLM code in `src/services/`
2. Design the integration — model selection, prompt structure
3. Implement with error handling and retries
4. Test with mock responses
5. Verify — `pnpm typecheck` + `pnpm test`

## Responsibilities
- Whisper API integration (`src/services/transcriber.ts`)
- Claude Vision analysis (`src/services/analyzer.ts`)
- OpenAI embeddings (`src/services/embedder.ts`)
- Natural language search (`src/services/nl-search.ts`)
- Prompt engineering
- Response parsing and Zod validation
- Rate limit handling and retries

## Key Integration Files
- `src/services/transcriber.ts` — Whisper API (audio → transcript + language)
- `src/services/analyzer.ts` — Claude Vision (keyframes + transcript → tags + summary)
- `src/services/embedder.ts` — OpenAI embeddings (summary → vector)
- `src/services/nl-search.ts` — Claude interprets NL query → search strategy

## Claude Tagging Prompt (VERBATIM — do not modify)
```
You are an expert visual content analyzer. You will receive:
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
- Return ONLY valid JSON. No preamble, no markdown.
```

## Conventions
- Always validate AI responses with Zod before storing
- Max 3 retries on API errors with exponential backoff
- Use claude-sonnet-4-20250514 for vision/tagging
- Use text-embedding-3-small (1536 dims) for embeddings
- Log token usage for cost tracking
