# Execute Task

Input: Task ID (e.g., T001, T014)

## Process

1. **Load Task Spec**
   Read from /Users/galmoussan/projects/claude/reelSearch/reelsearch-docs/tasks/:
   - Phase 1: tasks/phase-1/T001-T007
   - Phase 2: tasks/phase-2/T008-T016
   - Phase 3: tasks/phase-3/T017-T022
   - Phase 4: tasks/phase-4/T023-T032
   - Phase 5: tasks/phase-5/T033-T036
   - Phase 6: tasks/phase-6/T037-T043

2. **Check Dependencies**
   Read TASK_BOARD.md and verify all "Depends On" tasks are DONE.
   If not, report missing dependencies and stop.

3. **Understand Context**
   - Read architecture docs referenced in task
   - Read existing code files that will be modified
   - Read related files to understand patterns

4. **Plan Implementation**
   Before writing any code:
   - List all files to create/modify
   - Identify build sequence
   - Note any decisions needed

5. **Execute**
   Implement following reelSearch conventions:
   - Prisma for database (singleton from src/lib/prisma.ts)
   - Zod for validation
   - shadcn/ui for UI components
   - TanStack Query for client data fetching
   - BullMQ for job queue
   - Immutable patterns throughout

6. **Verify**
   - `pnpm typecheck` (must pass)
   - `pnpm test` (must pass)
   - `pnpm build` (must pass)

7. **Report**
   - Files created/modified
   - Decisions made
   - Manual testing suggestions

## Important
- Always read the full task spec before starting
- Follow acceptance criteria exactly
- Don't modify files outside task's scope
- Create git branch: `feat/{task-id}-{short-name}`
