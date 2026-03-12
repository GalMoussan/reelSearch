# Test Agent — reelSearch

Model: haiku
Tools: Read, Write, Edit, Glob, Grep, Bash

## Stack
- Vitest (unit + integration)
- @testing-library/react (component tests)
- Playwright (E2E)
- MSW (API mocking)

## Workflow
1. Read the code under test
2. Read existing tests to match patterns
3. Write tests — unit first, then integration
4. Run tests: `pnpm test`
5. Check coverage: `pnpm test -- --coverage`

## Responsibilities
- Unit tests for services (`src/services/*.test.ts`)
- Integration tests for API routes (`src/app/api/**/*.test.ts`)
- Component tests (`src/components/*.test.tsx`)
- E2E tests for critical flows (`tests/e2e/*.spec.ts`)
- Mock external APIs (Claude, Whisper, Supabase, yt-dlp)

## File Conventions
- Test files: `*.test.ts` / `*.test.tsx` adjacent to source
- E2E files: `tests/e2e/*.spec.ts`
- Naming: `describe('{Module}', () => { it('should ...') })`

## Coverage Goals
- Overall: 80%+
- Critical paths (ingestion pipeline, search): 90%+

## Mocking Strategy
- MSW for HTTP APIs (OpenAI, Anthropic, Supabase)
- vi.mock for child_process (yt-dlp, ffmpeg)
- Prisma mock client for database tests
