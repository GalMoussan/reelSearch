# reelSearch

AI-powered Instagram Reel search and discovery. Save reels by URL, get AI-generated transcripts and intelligent tags, then search semantically across your entire collection.

## Overview

reelSearch is a multi-user web application that transforms Instagram Reels into searchable, AI-analyzed content. Simply paste a reel URL and the app handles the rest: downloads the video via yt-dlp, transcribes audio using Whisper, generates 20-40 contextual tags via Claude Vision, and stores everything in PostgreSQL with pgvector for semantic search. Users can then discover their content through natural language queries, tags, or traditional search.

## Features

- **URL-based Reel Import**: Paste Instagram Reel URLs directly—no manual uploads needed
- **Automatic Transcription**: OpenAI Whisper transcribes audio to text
- **AI-Powered Tagging**: Claude Vision analyzes video and generates 20-40 intelligent tags
- **Semantic Search**: pgvector embeddings enable natural language queries ("show me funny cooking videos")
- **Multi-User Support**: NextAuth.js with Google OAuth for secure, multi-tenant experience
- **Thumbnails**: Automatic thumbnail extraction stored on Supabase
- **Background Processing**: BullMQ + Redis queue ensures fast, non-blocking uploads
- **Real-Time Updates**: TanStack React Query for optimistic updates and live data sync

## Prerequisites

- **Node.js**: 20+ (with pnpm)
- **Docker**: For local Redis + PostgreSQL (optional but recommended)
- **Accounts needed**:
  - [Supabase](https://supabase.com) — Database + Storage
  - [Google Cloud Console](https://console.cloud.google.com) — OAuth credentials
  - [Anthropic](https://console.anthropic.com) — API key for Claude Vision
  - [OpenAI](https://platform.openai.com) — API key for Whisper
- **System dependencies**: ffmpeg (for video processing, installed via Homebrew or apt)

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/reelsearch.git
cd reelsearch
pnpm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your actual credentials (see section below)
```

### 3. Start Local Services (Optional but Recommended)

```bash
docker-compose up -d
```

This starts PostgreSQL 16 (with pgvector) and Redis locally. Skip if using Railway or Supabase hosted services.

### 4. Initialize Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push
```

### 5. Start Development

In one terminal:
```bash
pnpm dev
```

In another terminal:
```bash
pnpm worker:dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the following:

### Database

- **`DATABASE_URL`**: Prisma connection string with SSL. Format: `postgresql://user:pass@host:5432/reelsearch?sslmode=require`
  - For Supabase: Use the "Connection pooling" URL from Dashboard → Settings → Database
  - For local Docker: `postgresql://postgres:postgres@localhost:5432/reelsearch?sslmode=disable`

- **`DIRECT_URL`**: Direct database connection (no pooling) for migrations. Format: `postgresql://user:pass@host:5432/reelsearch`
  - For Supabase: Use the standard connection URL, not the pooler
  - For local Docker: `postgresql://postgres:postgres@localhost:5432/reelsearch`

### Redis

- **`REDIS_URL`**: BullMQ job queue connection. Format: `redis://:password@host:6379`
  - For Railway: Copy from Dashboard → Database → Redis → Connection string
  - For local Docker: `redis://localhost:6379`

### Authentication

- **`NEXTAUTH_SECRET`**: Encryption key for NextAuth sessions. Generate with:
  ```bash
  openssl rand -base64 32
  ```

- **`NEXTAUTH_URL`**: App URL for OAuth redirects
  - Local: `http://localhost:3000`
  - Production: `https://yourdomain.com`

- **`GOOGLE_CLIENT_ID`** & **`GOOGLE_CLIENT_SECRET`**: OAuth credentials from Google Cloud
  1. Go to [Google Cloud Console](https://console.cloud.google.com)
  2. Create OAuth 2.0 Client ID (Application type: Web application)
  3. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (local) and production URL
  4. Copy Client ID and Client Secret

### AI APIs

- **`OPENAI_API_KEY`**: OpenAI API key for Whisper transcription. Get from [OpenAI Platform](https://platform.openai.com/api-keys)

- **`ANTHROPIC_API_KEY`**: Anthropic API key for Claude Vision tagging. Get from [Anthropic Console](https://console.anthropic.com/api-keys)

### Supabase Storage

- **`SUPABASE_URL`**: Your Supabase project URL. Format: `https://your-project.supabase.co`
  - Get from Dashboard → Settings → API → Project URL

- **`SUPABASE_SERVICE_ROLE_KEY`**: Service role key for server-side storage access
  - Get from Dashboard → Settings → API → Service Role Key (keep secret!)

## Database Setup

### For Supabase (Production)

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Enable pgvector extension:
   - Go to Dashboard → SQL Editor
   - Run: `CREATE EXTENSION IF NOT EXISTS vector;`
3. Copy DATABASE_URL and DIRECT_URL from Dashboard → Settings → Database → Connection strings
4. Run migrations:
   ```bash
   pnpm db:push
   ```

### For Local Development (Docker)

1. Start services:
   ```bash
   docker-compose up -d
   ```
2. Set `DATABASE_URL` and `DIRECT_URL` to `postgresql://postgres:postgres@localhost:5432/reelsearch` (without sslmode)
3. Push schema:
   ```bash
   pnpm db:push
   ```

### Enable pgvector

pgvector is required for semantic search. It's automatically included in the Dockerfile (`pgvector/pgvector:pg16`) and can be created in Supabase via SQL.

## Running Locally

### Full Development Environment

```bash
# Terminal 1: Start services
docker-compose up -d

# Terminal 2: Start Next.js dev server with Turbopack
pnpm dev

# Terminal 3: Start BullMQ worker for background jobs
pnpm worker:dev
```

### Useful Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start Next.js dev server with Turbopack |
| `pnpm build` | Create production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Check TypeScript types |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Sync schema to database |
| `pnpm db:migrate` | Create and run migrations |
| `pnpm db:studio` | Open Prisma Studio (visual DB editor) |
| `pnpm worker` | Start BullMQ worker (one-off) |
| `pnpm worker:dev` | Start worker with auto-reload |
| `pnpm test` | Run vitest once |
| `pnpm test:watch` | Run vitest in watch mode |

## Deployment

### Web (Vercel)

1. Push code to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` (with sslmode=require)
   - `DIRECT_URL` (without sslmode, for migrations)
   - `REDIS_URL`
   - `NEXTAUTH_SECRET` (generate new, don't reuse local)
   - `NEXTAUTH_URL` (your production domain)
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

### Background Worker (Railway)

The BullMQ worker must run continuously. Deploy separately:

1. Create new Railway project
2. Add Dockerfile or run directly:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY . .
   RUN pnpm install
   CMD ["pnpm", "worker"]
   ```
3. Set same environment variables as Vercel
4. Deploy

Alternatively, use AWS Lambda, Google Cloud Run, or any container platform.

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Authentication routes
│   ├── (reels)/                # Main app routes
│   │   ├── page.tsx            # Dashboard
│   │   ├── [id]/               # Reel detail page
│   │   └── search/             # Search page
│   ├── api/
│   │   ├── reels/              # REST API routes
│   │   │   ├── route.ts        # GET/POST reels
│   │   │   └── [id]/           # Individual reel endpoints
│   │   ├── search/             # Semantic search endpoint
│   │   ├── auth/               # NextAuth configuration
│   │   └── webhooks/           # External integrations
│   └── layout.tsx              # Root layout
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   └── features/               # Feature-specific components
│       ├── ReelCard.tsx
│       ├── ReelUploader.tsx
│       ├── SearchBar.tsx
│       └── TagList.tsx
├── lib/
│   ├── prisma.ts               # Prisma singleton
│   ├── redis.ts                # Redis/BullMQ client
│   ├── auth.ts                 # NextAuth config
│   └── ai/
│       ├── openai.ts           # Whisper client
│       ├── anthropic.ts        # Claude Vision client
│       └── embeddings.ts       # pgvector queries
├── server/
│   ├── actions/                # Server actions
│   │   ├── reels.ts
│   │   └── search.ts
│   └── services/               # Business logic
│       ├── reel-service.ts
│       ├── search-service.ts
│       └── storage-service.ts
├── workers/
│   └── reel-processor.ts       # BullMQ worker
├── types/
│   └── index.ts                # Shared TypeScript types
└── env.ts                      # Runtime env validation

prisma/
└── schema.prisma               # Database schema (reels, tags, users, etc.)

tests/                          # Vitest test files
├── phase-1/
└── phase-2/
```

## Database Schema (Key Tables)

- **users**: NextAuth + custom profile fields
- **reels**: URL, video file, transcript, thumbnail
- **tags**: AI-generated tags with embeddings
- **reel_tags**: Many-to-many reel ↔ tag relationship
- **embeddings**: pgvector embeddings for semantic search
- **jobs**: BullMQ job metadata (processing status, errors)

See `prisma/schema.prisma` for full schema.

## Architecture

### Data Flow

1. **Upload**: User pastes Instagram Reel URL
2. **Queue**: URL added to BullMQ job queue
3. **Download**: Worker fetches video via yt-dlp
4. **Extract**: ffmpeg extracts thumbnail and audio
5. **Transcribe**: OpenAI Whisper transcribes audio
6. **Analyze**: Claude Vision generates tags
7. **Store**: Reel, transcript, tags, and thumbnail saved
8. **Index**: Embeddings computed and stored in pgvector
9. **Display**: Frontend fetches via API and renders

### Key Components

- **Next.js**: Web framework with API routes, server actions, and middleware
- **PostgreSQL + pgvector**: Semantic search via vector embeddings
- **BullMQ + Redis**: Asynchronous job processing (transcription, tagging)
- **Whisper API**: Audio-to-text transcription
- **Claude Vision**: Multi-modal reel analysis and tagging
- **NextAuth.js**: OAuth authentication (Google)
- **Supabase Storage**: Secure thumbnail and video file storage

## Contributing

### Branch Naming

Use the format: `feat/TXXX-task-name`

Example: `feat/T001-setup-initial-project`

### Commit Messages

Format: `[Phase X] TXXX: Brief description`

Example: `[Phase 1] T001: Set up Next.js project structure`

See contributing guidelines in the docs for detailed development workflow.

## Troubleshooting

### Video download fails
- Ensure ffmpeg is installed: `brew install ffmpeg` (macOS) or `apt install ffmpeg` (Linux)
- Check yt-dlp version: `yt-dlp --version` (should be recent)

### Transcription errors
- Verify OPENAI_API_KEY is valid and has available quota
- Check OpenAI dashboard for rate limits

### pgvector extension not found
- Run: `CREATE EXTENSION IF NOT EXISTS vector;` in Supabase SQL editor
- For local Docker, pgvector is pre-installed in the image

### Worker not processing jobs
- Check Redis connection: `redis-cli ping` (should return PONG)
- Verify REDIS_URL is correct
- Check worker logs for errors

### Auth issues
- Verify NEXTAUTH_SECRET is set (not empty)
- Check Google OAuth credentials are correct for your domain
- Clear browser cookies and try again

## Support

For issues, open an issue on GitHub or contact the development team.

## License

MIT
