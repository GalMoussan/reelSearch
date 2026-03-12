# ReelSearch

AI-powered video reel search and discovery platform. Add reels by URL, get AI-generated summaries, transcripts, and semantic search across your entire collection.

## Tech Stack

- **Framework:** Next.js 15 + React 19 + TypeScript
- **Database:** PostgreSQL (Railway) + Prisma ORM
- **Queue:** BullMQ + Redis (Railway)
- **Auth:** NextAuth.js (Google OAuth)
- **AI:** OpenAI (embeddings), Anthropic (summaries)
- **Storage:** Supabase (thumbnails/media)
- **Styling:** Tailwind CSS + shadcn/ui

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual values

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Start development server
pnpm dev

# In a separate terminal, start the background worker
pnpm worker
```

## Project Structure

```
src/
├── app/                # Next.js App Router pages and layouts
│   ├── api/            # API routes
│   └── (routes)/       # Page routes
├── components/         # React components
│   ├── ui/             # shadcn/ui primitives
│   └── features/       # Feature-specific components
├── lib/                # Shared utilities and clients
│   ├── prisma.ts       # Prisma singleton
│   ├── redis.ts        # Redis/BullMQ client
│   └── ai/             # AI service wrappers
├── server/             # Server-side logic
│   ├── actions/        # Server actions
│   └── services/       # Business logic
├── workers/            # BullMQ worker processes
└── types/              # Shared TypeScript types
prisma/
└── schema.prisma       # Database schema
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm worker` | Start BullMQ background worker |
