# reelSearch Conventions

## Validation
- Zod for all input validation at API boundaries
- Prisma types for database layer
- Infer TypeScript types from Zod schemas: `type X = z.infer<typeof xSchema>`

## Import Conventions
- Path alias: `@/` maps to `src/`
- Example: `import { prisma } from '@/lib/prisma'`
- Group imports: external libs → internal libs → components → types

## Error Handling
- API routes: try/catch with proper HTTP status codes
- Return: `{ data: T | null, error: string | null }`
- BullMQ workers: catch and mark reel as FAILED with error message
- Never silently swallow errors

## File Naming
- Components: `kebab-case.tsx` (e.g., `reel-card.tsx`)
- Hooks: `use-{name}.ts` (e.g., `use-reels.ts`)
- Services: `{name}.ts` (e.g., `downloader.ts`, `analyzer.ts`)
- API routes: `route.ts` in directory structure

## Key Patterns
- Prisma singleton: `src/lib/prisma.ts` (globalThis cache)
- Redis singleton: `src/lib/redis.ts`
- BullMQ queue: `src/lib/queue.ts`
- Auth: `src/lib/auth.ts` + `src/lib/auth-utils.ts`
- Env validation: `src/lib/env.ts` (Zod schema)
- Tags: always lowercase, no spaces, deduplicated
- Embeddings: raw SQL via `prisma.$executeRaw` for vector ops
- Processing pipeline: download → transcribe → analyze → normalize → embed → cleanup
