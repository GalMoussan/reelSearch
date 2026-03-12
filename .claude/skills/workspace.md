# reelSearch Workspace

## Project Layout
```
reelsearch/
├── .claude/              # Agent configs, commands, skills
├── prisma/
│   └── schema.prisma     # Database schema (Reel, Tag, User, Account, Session)
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   │   ├── reels/    # Reel CRUD + retry
│   │   │   ├── tags/     # Tag cloud
│   │   │   ├── search/   # Semantic + NL search
│   │   │   └── auth/     # NextAuth handler
│   │   ├── login/        # Login page
│   │   ├── tags/[name]/  # Tag detail page
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/
│   │   ├── ui/           # shadcn/ui primitives
│   │   └── layout/       # Header, nav
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities (prisma, redis, queue, auth, env)
│   ├── services/         # Business logic (downloader, transcriber, analyzer, etc.)
│   └── workers/          # BullMQ worker process
├── tests/
│   └── e2e/              # Playwright E2E tests
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.mjs
└── tailwind.config.ts
```

## Key Commands
| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm test` | Run Vitest tests |
| `pnpm worker` | Start BullMQ worker process |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:studio` | Open Prisma Studio GUI |

## Adding New Code
- **API Route**: Create `src/app/api/{resource}/route.ts`
- **Component**: Create `src/components/{name}.tsx`
- **Hook**: Create `src/hooks/use-{name}.ts`
- **Service**: Create `src/services/{name}.ts`
- **Worker step**: Modify `src/workers/reel-processor.ts`

## Docs Repo
Located at: /Users/galmoussan/projects/claude/reelSearch/reelsearch-docs/
