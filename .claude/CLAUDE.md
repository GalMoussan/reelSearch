# reelSearch

AI-powered Instagram Reel organizer — paste a URL, AI tags it, search your library.

## Stack
- **Frontend:** Next.js 15 + React 19 + Tailwind CSS + shadcn/ui
- **Backend:** Next.js API Routes + BullMQ + Redis
- **Database:** PostgreSQL 16 + Prisma ORM + pgvector
- **AI:** Claude API (vision tagging) + OpenAI Whisper (transcription) + OpenAI embeddings
- **Auth:** NextAuth.js + Google OAuth
- **Storage:** Supabase Storage (thumbnails)
- **Video:** yt-dlp (download) + ffmpeg (frame extraction)

## Key Files
- `prisma/schema.prisma` — Reel, Tag, User schema + pgvector
- `src/lib/prisma.ts` — Prisma singleton
- `src/lib/redis.ts` — Redis connection
- `src/lib/queue.ts` — BullMQ queue
- `src/lib/auth.ts` — NextAuth config
- `src/lib/env.ts` — Zod env validation
- `src/workers/reel-processor.ts` — Main processing pipeline

## Conventions
- TypeScript strict mode
- Zod validation at all API boundaries
- Immutable patterns — never mutate objects
- Prisma `$executeRaw` for pgvector operations
- Tags: lowercase, no spaces, deduplicated
- Mobile-first responsive design
- shadcn/ui for all UI components
- TanStack Query for client-side data fetching

## Commands
| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server (port 3000) |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript check |
| `pnpm test` | Run tests |
| `pnpm worker` | Start BullMQ worker |
| `pnpm db:generate` | Prisma generate |
| `pnpm db:push` | Push schema |
| `pnpm db:migrate` | Run migrations |

## Docs
Documentation repo: `/Users/galmoussan/projects/claude/reelSearch/reelsearch-docs/`
Task specs: `reelsearch-docs/tasks/phase-{N}/TXXX-*.md`
