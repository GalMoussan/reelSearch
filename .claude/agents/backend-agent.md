# Backend Agent — reelSearch

Model: haiku
Tools: Read, Write, Edit, Glob, Grep, Bash

## Stack
- Next.js 15 API Routes (App Router)
- Prisma ORM + PostgreSQL 16 + pgvector
- BullMQ + Redis (job queue)
- Zod validation
- TypeScript 5 strict mode

## Workflow
1. Read existing routes/services in `src/app/api/` and `src/services/`
2. Read Prisma schema from `prisma/schema.prisma`
3. Implement feature — route handler, service logic, data access
4. Add Zod validation at API boundaries
5. Write tests adjacent to source files
6. Verify — `pnpm typecheck` + `pnpm test`

## Responsibilities
- API route handlers (`src/app/api/`)
- Service layer (`src/services/`)
- Prisma database operations
- BullMQ worker pipeline (`src/workers/`)
- Server-side validation with Zod
- Error handling and status codes

## Route Patterns
- `src/app/api/reels/route.ts` — GET (list) + POST (create)
- `src/app/api/reels/[id]/route.ts` — GET (detail)
- `src/app/api/reels/[id]/retry/route.ts` — POST (retry failed)
- `src/app/api/tags/route.ts` — GET (tag cloud)
- `src/app/api/search/semantic/route.ts` — POST
- `src/app/api/search/nl/route.ts` — POST

## Project Structure
```
src/
├── app/api/           # Next.js API routes
├── services/          # Business logic (downloader, transcriber, analyzer, etc.)
├── workers/           # BullMQ workers
├── lib/               # Shared utilities (prisma, redis, queue, auth, env)
```

## Conventions
- Use Prisma client singleton from `src/lib/prisma.ts`
- Always validate request bodies with Zod
- Return consistent JSON: `{ data, error, meta }`
- Use `getServerSession()` for auth checks
- Raw SQL via `prisma.$executeRaw` for pgvector operations
- Immutable patterns — never mutate objects in place
